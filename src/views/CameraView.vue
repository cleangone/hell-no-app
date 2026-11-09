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
      <div v-if="base64Image">
         <BlueBtn text="Add Item" @click="addItem" class="mr-5"/>
         <BlueBtn v-if="recordingAudio" text="Stop Recording" @click="stopAudioRecording"/>
         <BlueBtn v-else text="Record Audio" @click="startAudioRecording"/>
      </div>
      <BlueBtn v-else text="Take Photo" @click="takePhoto"/>
   </div>
   <div class="mt-5 d-flex justify-center">
      <div v-if="uploadStatus" class="mt-5 d-flex justify-center">{{ uploadStatus }}</div>
      <BlueBtn v-else-if="audioBlob" text="Play Audio" @click="playAudio"/>
   </div>
   
</ion-content>  
</ion-page>
</template>

<script setup>
   import { computed, ref, watch } from 'vue'
   import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
   import { storage } from '@/firebase'
   import { ref as storageRef } from 'firebase/storage'
   import { uploadBytesResumable, getDownloadURL } from 'firebase/storage'
   import { useUserStore } from '@/stores/userStore'
   import { useItemStore } from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useImageMgr }  from '@/stores/image/imageMgr'
   import { useAddItemImageHandler } from '@/stores/image/addItemImageHandler'
   import BlueBtn    from '@/components/util/BlueBtn.vue'
   import Header     from '@/components/util/Header.vue'
   import BackButton from '@/components/util/BackButton.vue'  
   import { dateUuid } from '@/utils/utils'
   import { Emit, ImageType, ItemType, Route, State } from '@/utils/constants'
  
   const userStore    = useUserStore()
   const itemStore    = useItemStore()   
   const galleryStore = useGalleryStore() 
   const imageMgr     = useImageMgr()
   const imageHandler = useAddItemImageHandler()
   const photoUrl     = ref(null)
   const base64Image  = ref(null)
   const uploadStatus = ref("")  
   const recordingAudio = ref(false)
   const audioBlob    = ref(null)

   const photoGallery = computed(() => galleryStore.getGalleryByTag("photo"))

   const takePhoto = async () => {
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
      } catch (error) {
         console.error('User cancelled photo or error occurred:', error);
      }
   }

   const addItem = async () => {
      if (!base64Image.value || !userStore.userId) {
         uploadStatus.value = "Upload failed - no image"
         return;
      }

      const imageSet = imageMgr.createImageSet(ImageType.PRIMARY, userStore.userId)
      const imageRef = storageRef(storage, imageSet.filePath)
      const dimensions = await getImageDimensions(photoUrl.value)
      imageSet.dimensions = dimensions;

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

               if (photoGallery.value) { item.galleryIds = [ photoGallery.value.id ] }
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

   let mediaRecorder;
   let audioChunks = [];

   const startAudioRecording = async () => {
      recordingAudio.value = true
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
         audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
         audioBlob.value = new Blob(audioChunks, { type: 'audio/webm' });
         // Save audioBlob to state for upload
      };

      audioChunks = [];
      mediaRecorder.start();
   };

   const stopAudioRecording = () => {
      //  // Use mediaRecorder.mimeType dynamically instead of hardcoding 'audio/webm'
      // const audioBlob.value = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      // audioUrl.value = URL.createObjectURL(audioBlob);
      mediaRecorder.stop()
   }

   const playAudio = () => {
      if (!audioBlob.value) return

      // audioUrl.value = URL.createObjectURL(audioBlob) w

      const audioElement = new Audio(audioBlob.value)
      
      audioElement.play().catch((error) => {
         console.error("Error playing audio:", error)
      })
   }

   const getImageDimensions = (src) => {
      return new Promise((resolve) => {
         const img = new Image();
         img.onload = () => {
            resolve({ width: img.width, height: img.height });
         };
         img.onerror = () => {
            console.log("error getting dimensions")
            resolve({ }); 
         };
         img.src = src;
      });
   };
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
