<template>
<ion-page>
<ion-content :fullscreen="true">
   <Header>
      <template #left><BackButton/></template>
      <template #title>{{ Route.CAMERA.display }}</template>
      <template #right><span class="mr-8"></span></template>
   </Header>
   
   <div class="photo-container ion-margin-bottom mx-5">
      <ion-img v-if="photoUrl" :src="photoUrl" alt="Captured photo"></ion-img>
      <p v-else>No photo selected.</p>
   </div>
   <div class="mt-5 d-flex justify-center">
      <BlueBtn text="Take Photo" @click="takePhoto" class="mr-5"/>
      <BlueBtn v-if="isRecording" text="Stop Recording" @click="stopAudioRecording"/>
      <BlueBtn v-else text="Record Audio" @click="startAudioRecording"/>
   </div>
   <div class="mt-5 d-flex justify-center">
      <BlueBtn v-if="base64Image" text="Add Item" @click="addItem" :disabled="!canUpload" class="mr-5"/>
      <IconButton v-if="hasAudio" icon="mdi-volume-high" @click="playAudio" size="med" class="mr-2 admin-link"/>  
      <IconButton v-if="hasAudio" icon="mdi-volume-mute" @click="deleteAudio" size="med" class="admin-link"/>  
   </div>
   <div v-if="uploadStatus" class="mt-5 d-flex justify-center">{{ uploadStatus }}</div>
   
</ion-content>  
</ion-page>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
   import { storage } from '@/firebase'
   import { ref as storageRef } from 'firebase/storage'
   import { getDownloadURL, getMetadata, uploadBytesResumable } from 'firebase/storage'
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useImageMgr }     from '@/stores/image/imageMgr'
   import { useAudioMgr }     from '@/stores/audioMgr'
   import { useAddItemImageHandler } from '@/stores/image/addItemImageHandler'
   import BlueBtn    from '@/components/util/BlueBtn.vue'
   import BackButton from '@/components/util/BackButton.vue'
   import Header     from '@/components/util/Header.vue'
   import IconButton from '@/components/util/IconButton.vue'
   import { dateUuid } from '@/utils/utils'
   import { ImageType, ItemType, Route, State } from '@/utils/constants'
  
   const userStore    = useUserStore()
   const itemStore    = useItemStore()   
   const galleryStore = useGalleryStore() 
   const imageMgr     = useImageMgr()
   const audioMgr     = useAudioMgr()
   const imageHandler = useAddItemImageHandler()
   const photoGallery = ref(null)
   const photoUrl     = ref(null)
   const base64Image  = ref(null)
   const canUpload    = ref(true)  
   const uploadStatus = ref("")  
   const isRecording  = ref(false)

   onMounted(() => {
      for (const gallery of galleryStore.myGalleries) {
         if (gallery.isPhotoGallery) {
            photoGallery.value = gallery
         }
      }
   })

   const takePhoto = async () => {
      console.log("PhotoGallery", photoGallery.value.name)
      checkConnection()
      try {
         const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Base64, 
            source: CameraSource.Camera  //Camera, Photos, Prompt
         })

         photoUrl.value = `data:image/${image.format};base64,${image.base64String}`
         base64Image.value = image.base64String;
         uploadStatus.value = ""
      } 
      catch (error) {
         if (error.errorMessage != "User cancelled photos app") { console.error('takePhoto error', error) }
      }
   }

   const startAudioRecording = async () => {
      try {
         isRecording.value = true
         audioMgr.startRecording()
      } 
      catch (error) {
         isRecording.value = false
         console.error("Error recording", error)
      }
   }

   const stopAudioRecording = () => {
      isRecording.value = false
      audioMgr.stopRecording()
   }

   const hasAudio = computed(() => audioMgr.hasAudio)
   const playAudio   = () => { audioMgr.playAudio() } 
   const deleteAudio = () => { audioMgr.deleteAudio() }

   const addItem = async () => {
      if (!base64Image.value || !userStore.userId) {
         uploadStatus.value = "Upload failed - no image"
         return
      }

      const imageSet = imageMgr.createImageSet(ImageType.PRIMARY, userStore.userId)
      const imageRef = storageRef(storage, imageSet.filePath)
      const dimensions = await getImageDimensions(photoUrl.value)
      imageSet.dimensions = dimensions;

      let audioSet = null
      if (hasAudio.value) {
         uploadStatus.value = "Uploading Audio"
         audioSet = await audioMgr.uploadAudio()
         // console.log("audioSet", audioSet)
         audioMgr.deleteAudio()
      }

      // convert base64
      const byteCharacters = atob(base64Image.value);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
         byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const uploadTask = uploadBytesResumable(imageRef, blob, { contentType: 'image/jpeg' })

      uploadTask.on('state_changed',
         (snapshot) => {
            if (snapshot.bytesTransferred && snapshot.totalBytes) {
               const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
               uploadStatus.value = 'Upload ' + progress + '% done'
            }
         },
         (error) => {
            uploadStatus.value = "Upload failed"
            console.log("Upload failed", error)
         },
         () => {
            console.log("successful upload")
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
               imageSet.url = downloadURL
               imageSet.thumbUrl = downloadURL
               imageSet.largeThumbUrl = downloadURL

               const item = {
                  id:     dateUuid(),
                  name:   "photo",
                  state:  State.PUBLIC,
                  type:   ItemType.SINGLE,
                  userId: userStore.userId,
                  primaryImage: imageSet,
               }

               // todo - audioSet should prob be null 
               if (audioSet?.url) { item.primaryAudio = audioSet }
               if (photoGallery.value) { item.galleryIds = [ photoGallery.value.id ] }
               // console.log("uploading item", item)
               itemStore.setItem(item)

               uploadStatus.value = "Item added"
               photoUrl.value = null
               console.log("waitForThumbUrls")
               imageMgr.waitForThumbUrls(imageSet, imageHandler,  { itemId:item.id })        
            })

            console.log("thumbnails done")
         }
      )
   }

   const getImageDimensions = (src) => {
      return new Promise((resolve) => {
         const img = new Image()
         img.onload = () => {
            resolve({ width: img.width, height: img.height })
         };
         img.onerror = () => {
            console.log("error getting dimensions")
            resolve({ })
         };
         img.src = src
      })
   }

   async function checkConnection() {
      try {
         // attempt to fetch metadata to test the connection
         const testRef = storageRef(storage, "connection-test/ping")
         await getMetadata(testRef)
         canUpload.value = true // won't happen - file doesn't exist
      } 
      catch (error) {
         if (error.code == 'storage/object-not-found') { 
            // file doesn't exist, but server responded
            canUpload.value = true 
         } 
         else {
            // other error - most likely offline
            console.log("checkConnection error", error)
            canUpload.value = false
         }
      }
   }
</script>

<style>
.photo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  overflow: hidden;
}
</style>
