<template>
<ion-page>
<ion-content :fullscreen="true">
   <Header>
      <template #left><BackButton/></template>
      <template #title>{{ Route.CAMERA.display }}</template>
      <template #right><span class="mr-8"></span></template>
   </Header>
   <div class="position-relative photo-container ion-margin-bottom mx-5">
      <ion-img v-if="currImage" :src="currImage.photoUrl" alt="Captured photo"></ion-img>
      <p v-else>No photo selected.</p>
      <div v-if="currImage" class="position-absolute bottom-0 right-0">
        <IconButton icon="mdi-close-circle" @click.stop="deletePhoto" size="med" style="background-color:white" class="admin-link mr-2 mb-2"/>  
      </div>
   </div>
   <div class="mt-5 d-flex justify-center">
      <BlueBtn text="Take Photo" @click="takePhoto" class="mr-5"/>
      <BlueBtn v-if="isRecording" text="Stop Recording" @click="stopAudioRecording"/>
      <BlueBtn v-else text="Record Audio" @click="startAudioRecording"/>
   </div>
   <HorizontalDiv class="mt-5 mx-10 d-flex justify-center align-center">
      <v-select v-model="selectedGalleryId" label="Gallery" :items="galleryOptions" clearable density="compact" hide-details class="mr-5"/>
      <BlueBtn :text="isPublic ? State.PUBLIC : State.PRIVATE" @click="toggleState" class="my-4"/>
   </HorizontalDiv>
   <div class="mt-5 d-flex justify-center">
      <BlueBtn v-if="currImage" text="Upload" @click="addItem" :disabled="!canUpload" class="mr-5"/>
      <BlueBtn v-if="currImage" text="Save" @click="saveImage" :disabled="isSavedImage" class="mr-5"/>
      <IconButton v-if="hasAudio" icon="mdi-volume-high" @click="playAudio" size="med" class="mr-2 admin-link"/>  
      <IconButton v-if="hasAudio" icon="mdi-volume-mute" @click="deleteAudio" size="med" class="admin-link"/>  
   </div>
   <div v-if="uploadStatus" class="mt-5 d-flex justify-center">{{ uploadStatus }}</div>
   
   <v-row align-content="start" justify="space-around" density="compact" class="mt-5 mb-2">
      <div v-for="image in localStore.savedPhotos.images" class="position-relative">
         <ion-img :src="image.photoUrl" @click.stop="showSavedImage(image)" :style="{ width:'100px' }"/>
         <div class="position-absolute bottom-0 right-0">
         <IconButton icon="mdi-close-circle" @click.stop="deleteSavedImage(image.id)" size="med" style="background-color:white" class="admin-link mr-2 mb-2"/>  
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
   const currImage    = ref(null) // { id, photoUrl, base64Image, fileDir, filePath } - either base64Image or fileDir/Path set),
   const canUpload    = ref(true)  
   const uploadStatus = ref("")  
   const isRecording  = ref(false)
   
   onIonViewWillEnter(() => {
      checkConnection()
      if (!currImage.value) { takePhoto() }
   })

   const takePhoto = async () => {
      try {
         const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Base64, 
            source: CameraSource.Camera  // Camera, Photos, Prompt
         })

         const base64Url = `data:image/${image.format};base64,${image.base64String}`
         const photoUrl = await createThumbOfWidth(base64Url, windowWidth.value) 
         currImage.value = { 
            id: dateUuid(), 
            photoUrl: photoUrl, 
            base64Image: image.base64String 
         }
         uploadStatus.value = ""
      } 
      catch (error) {
         if (error.errorMessage != "User cancelled photos app") { console.error('takePhoto error', error) }
      }
   }

   const deletePhoto = () => { currImage.value = null }

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

   const galleryOptions = computed(() => galleryMgr.myGalleryOptions)
   const selectedGalleryId = computed({ 
      get() { return localStore.cameraGalleryId },
      set(galleryId) { localStore.setCameraGalleryId(galleryId) }
   })

   const itemState = computed(() => localStore.cameraItemState)
   const isPublic = computed(() => itemState.value == State.PUBLIC)
   const toggleState = () => { localStore.setCameraItemState(isPublic.value ? State.PRIVATE : State.PUBLIC) }

   const isSavedImage = computed(() => localStore.savedPhotos.ids.includes(currImage.value.id) )
   const showSavedImage = (savedImage) => { currImage.value = savedImage }

   const saveImage = async () => { 
      if (!localStore.savedPhotos.ids.includes(currImage.value.id)) {
         const fileDir = Directory.Data
         const filePath = `saved-photos/${currImage.value.id}`
         
         const savedFile = await Filesystem.writeFile({
            directory: fileDir,
            path: filePath,
            data: currImage.value.base64Image,
            recursive: true,
         })
         console.log("savedFile", savedFile)

         localStore.savedPhotos.images.push({
            id: currImage.value.id,
            photoUrl: currImage.value.photoUrl,
            fileDir: fileDir,
            filePath: filePath
         })
         localStore.savedPhotos.ids.push(currImage.value.id)
      }
      currImage.value = null
   }
   
   const deleteSavedImage = async (imageId) => { 
      const imageIndex = localStore.savedPhotos.images.findIndex((image) => image.id === imageId)
      if (imageIndex !== -1) { 
         const savedImage = localStore.savedPhotos.images[imageIndex]
         const fileToDelete = { directory: savedImage.fileDir, path: savedImage.filePath } 
         console.log("Deleting file", fileToDelete)
         try {
            await Filesystem.deleteFile(fileToDelete)
         } 
         catch (error) {
            console.warn('Error deleteing file', error)
         }

         localStore.savedPhotos.images.splice(imageIndex, 1) 
      }

      const idIndex = localStore.savedPhotos.ids.findIndex((id) => id === imageId)
      if (imageIndex !== -1) { localStore.savedPhotos.ids.splice(idIndex, 1) }
  
      console.log("savedPhotos after deleteSavedImage", localStore.savedPhotos)
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
      if (hasAudio.value) {
         uploadStatus.value = "Uploading Audio"
         audioSet = await audioMgr.uploadAudio()
         // console.log("audioSet", audioSet)
         audioMgr.deleteAudio()
      }

      console.log("Getting base64Image", currImage.value)
      let base64Image = currImage.value.base64Image ?? null
      if (!base64Image && currImage.value.fileDir && currImage.value.filePath) {
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
               if (isSavedImage.value) { deleteSavedImage(currImage.value.id) }
               currImage.value = null
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

   // const createThumbnailUrl = (photoUrl, maxSize = 160, quality = 0.7) => {
   //    return new Promise((resolve, reject) => {
   //       const img = new Image()
   //       img.onload = () => {
   //          const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
   //          const width = Math.max(1, Math.round(img.width * scale))
   //          const height = Math.max(1, Math.round(img.height * scale))

   //          const canvas = document.createElement('canvas')
   //          canvas.width = width
   //          canvas.height = height

   //          const ctx = canvas.getContext('2d')
   //          if (!ctx) {
   //          reject(new Error('Could not get 2D canvas context'))
   //          return
   //          }

   //          ctx.drawImage(img, 0, 0, width, height)
   //          resolve(canvas.toDataURL('image/jpeg', quality))
   //       }
   //       img.onerror = (err) => reject(err)
   //       img.src = photoUrl
   //    })
   // }

   const createThumbOfWidth = (photoUrl, targetWidth, quality = 0.7) => {
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
