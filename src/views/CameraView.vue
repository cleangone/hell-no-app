<template>
<ion-page>
<ion-content :fullscreen="true">
   <Header>
      <template #left><BackButton/></template>
      <template #title>{{ Route.CAMERA.display }}</template>
      <template #right><span class="mr-8"></span></template>
   </Header>
   <div class="photo-container ion-margin-bottom mx-5">
      <div v-if="currImage" class="position-relative">
         <ion-img :src="currImage.photoUrl" alt="Captured photo"/>
         <div v-if="currImage.audioBlob" class="position-absolute bottom-0 right-0">
            <IconButton icon="mdi-volume-high" @click.stop="playAudio"   size="med" style="background-color:white" class="pa-1 mr-2 mb-2 admin-link"/>  
            <IconButton icon="mdi-volume-mute" @click.stop="deleteAudio" size="med" style="background-color:white" class="pa-1 mr-2 mb-2 admin-link"/> 
         </div>
      </div>
      <p v-else>No photo</p>
   </div>
   <div class="mt-5 d-flex justify-center">
      <BlueBtn text="Take Photo" @click="takePhoto" class="mr-5"/>
      <BlueBtn v-if="isRecording" text="Stop Recording" @click="stopAudioRecording"/>
      <BlueBtn v-else text="Record Audio" @click="startAudioRecording"/>
      <BlueBtn v-if="currImage" text="Upload" @click="addItem" :disabled="!canUpload" class="ml-5"/>
   </div>
   <HorizontalDiv class="mt-5 mx-10 d-flex justify-center align-center">
      <v-select v-model="selectedGalleryId" label="Gallery" :items="galleryOptions" clearable density="compact" hide-details class="mr-5"/>
      <BlueBtn :text="isPublic ? State.PUBLIC : State.PRIVATE" @click="toggleState" class="my-4"/>
   </HorizontalDiv>
   <div v-if="uploadStatus" class="mt-5 d-flex justify-center">{{ uploadStatus }}</div>
   
   <v-row align-content="start" justify="space-around" density="compact" class="mt-5 mx-2 mb-2">
      <div v-for="(image, index) in localStore.savedPhotos" class="position-relative mb-2">
         <ion-img :src="image.photoUrl" @click.stop="showImage(index)" :style="{ width:'95px' }"/>
         <div class="position-absolute bottom-0 right-0">
         <IconButton icon="mdi-close-circle" @click.stop="deleteImage(index)" size="med" style="background-color:white" class="admin-link mr-2 mb-2"/>  
         </div>
      </div>
   </v-row>
</ion-content>  
</ion-page>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useWindowSize } from '@vueuse/core'
   import { onIonViewWillEnter } from '@ionic/vue'
   import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
   import { Filesystem, Directory } from '@capacitor/filesystem'
   import { storage } from '@/firebase'
   import { ref as storageRef } from 'firebase/storage'
   import { getDownloadURL, getMetadata, uploadBytesResumable } from 'firebase/storage'
   import { useUserStore }  from '@/stores/userStore'
   import { useItemStore }  from '@/stores/itemStore'
   import { useGalleryMgr } from '@/stores/galleryMgr'
   import { useImageMgr }   from '@/stores/image/imageMgr'
   import { useAudioMgr }   from '@/stores/audioMgr'
   import { useLocalStore } from '@/stores/localStore'
   import { useAddItemImageHandler } from '@/stores/image/addItemImageHandler'
   import BlueBtn       from '@/components/util/BlueBtn.vue'
   import BackButton    from '@/components/util/BackButton.vue'
   import Header        from '@/components/util/Header.vue'
   import HorizontalDiv from '@/components/util/HorizontalDiv.vue'
   import IconButton    from '@/components/util/IconButton.vue'
   import { dateUuid } from '@/utils/utils'
   import { ImageType, ItemType, Route, State } from '@/utils/constants'
  
   const { width: windowWidth } = useWindowSize()
   const userStore    = useUserStore()
   const itemStore    = useItemStore()   
   const galleryMgr   = useGalleryMgr()
   const imageMgr     = useImageMgr()
   const audioMgr     = useAudioMgr()
   const localStore   = useLocalStore()
   const imageHandler = useAddItemImageHandler()
   const currImageIndex = ref(-1) 
   const canUpload    = ref(true)  
   const uploadStatus = ref("")  
   const isRecording  = ref(false)
   
   onIonViewWillEnter(() => {
      checkConnection()
      if (localStore.savedPhotos.length) { currImageIndex.value = 0 }
      else { takePhoto() }
   })

   const takePhoto = async () => {
      uploadStatus.value = ""
      try {
         const cameraImage = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Base64, 
            source: CameraSource.Camera  // Camera, Photos, Prompt
         })

         currImageIndex.value = await saveImage(cameraImage)
      } 
      catch (error) {
         if (error.errorMessage != "User cancelled photos app") { console.error('takePhoto error', error) }
      }
   }

   const currImage = computed(() => currImageIndex.value == -1 ? null : localStore.savedPhotos[currImageIndex.value])

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

   const stopAudioRecording = async () => {
      isRecording.value = false
      const audioBlob = await audioMgr.stopRecording()
      if (audioBlob) { currImage.value.audioBlob = audioBlob }
   }

   const playAudio   = () => { audioMgr.playAudio(currImage.value.audioBlob) } 
   const deleteAudio = () => { currImage.value.audioBlob = null }

   const galleryOptions = computed(() => galleryMgr.myGalleryOptions)
   const selectedGalleryId = computed({ 
      get() { return localStore.cameraGalleryId },
      set(galleryId) { localStore.setCameraGalleryId(galleryId) }
   })

   const itemState = computed(() => localStore.cameraItemState)
   const isPublic = computed(() => itemState.value == State.PUBLIC)
   const toggleState = () => { localStore.setCameraItemState(isPublic.value ? State.PRIVATE : State.PUBLIC) }

   const showImage = (index) => { currImageIndex.value = index }
   
   const deleteImage = async (index) => { 
      const savedImage = localStore.savedPhotos[index]
      const fileToDelete = { directory: savedImage.fileDir, path: savedImage.filePath } 
      console.log("Deleting file", fileToDelete)
      try {
         await Filesystem.deleteFile(fileToDelete)
      } 
      catch (error) {
         console.warn('Error deleteing file', error)
      }

      // adjust currImageIndex
      if (index > 0) { currImageIndex.value = index - 1 }
      else if (localStore.savedPhotos.length > 1) { 
         // index == 0, and there is more than one saved image
         currImageIndex.value = 0 
      }
      else { currImageIndex.value = -1 }
      
      localStore.savedPhotos.splice(index, 1) 
      console.log("savedPhotos after deleteImage", localStore.savedPhotos)
   }

   const addItem = async () => {
      if (!currImage.value || !userStore.userId) {
         uploadStatus.value = "Upload failed - no image"
         return
      }

      const imageSet = imageMgr.createImageSet(ImageType.PRIMARY, userStore.userId)
      const imageRef = storageRef(storage, imageSet.filePath)
      const dimensions = await getImageDimensions(currImage.value.photoUrl)
      imageSet.dimensions = dimensions;

      let audioSet = null
      if (currImage.value.audioBlob) {
         uploadStatus.value = "Uploading Audio"
         audioSet = await audioMgr.uploadAudio(currImage.value.audioBlob)
      }

      console.log("Getting base64Image", currImage.value)
      let base64Image = null
      if (currImage.value.fileDir && currImage.value.filePath) {
         const fileToRead = { directory: currImage.value.fileDir, path: currImage.value.filePath }
         console.log("Reading file", fileToRead)
         const result = await Filesystem.readFile(fileToRead)
         console.log("Read result", result)
         base64Image = result.data
      }
      if (!base64Image) {
         uploadStatus.value = "Upload failed - cannot retrieve saved image"
         return
      }
      
      const byteCharacters = atob(base64Image)
      const byteNumbers = new Array(byteCharacters.length)
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
                  id:     currImage.value.id,
                  name:   "photo",
                  state:  itemState.value,
                  type:   ItemType.SINGLE,
                  userId: userStore.userId,
                  primaryImage: imageSet,
               }

               if (audioSet?.url) { item.primaryAudio = audioSet }
               if (selectedGalleryId.value) { item.galleryIds = [ selectedGalleryId.value ] }
               itemStore.setItem(item)

               uploadStatus.value = "Photo uploaded"
               deleteImage(currImageIndex.value)
               console.log("waitForThumbUrls")
               imageMgr.waitForThumbUrls(imageSet, imageHandler,  { itemId:item.id })        
            })

            console.log("thumbnails done")
         }
      )
   }

   // return index of newly saved image
   const saveImage = async (cameraImage) => { 
      const imageId = dateUuid()
      const fileDir = Directory.Data
      const filePath = `saved-photos/${imageId}`
      
      const savedFile = await Filesystem.writeFile({
         directory: fileDir,
         path: filePath,
         data: cameraImage.base64String,
         recursive: true,
      })
      console.log("savedFile", savedFile)

      const base64Url = `data:image/${cameraImage.format};base64,${cameraImage.base64String}`
      const photoUrl = await createThumb(base64Url, windowWidth.value) 

      localStore.savedPhotos.push({
         id:       imageId,
         photoUrl: photoUrl,
         fileDir:  fileDir,
         filePath: filePath
      })

      return localStore.savedPhotos.length - 1
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
      console.log("checkConnection")
      try {
         // attempt to fetch metadata to test the connection
         const testRef = storageRef(storage, "speakeasy-login.png") // known file
         await getMetadata(testRef)
         canUpload.value = true 
      } 
      catch (error) {
         if (error.code == 'storage/object-not-found') {  
            // should not happen, but still indicates connection exists
            console.log("checkConnection - online error", error.code)
            canUpload.value = true 
         } 
         else {
            console.log("checkConnection offline error", error.code)
            canUpload.value = false
         }
      }
   }

   const createThumb = (photoUrl, targetWidth, quality = 0.7) => {
      return new Promise((resolve, reject) => {
         const img = new Image()
         img.onload = () => {
            const scale = Math.min(1, targetWidth / img.width)
            const width = Math.max(1, Math.round(img.width * scale))
            const height = Math.max(1, Math.round(img.height * scale))

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
               reject(new Error('Could not get 2D canvas context'))
               return
            }

            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', quality))
         }
         img.onerror = (err) => reject(err)
         img.src = photoUrl
      })
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
