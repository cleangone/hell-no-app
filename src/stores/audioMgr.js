import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { storage } from '@/firebase'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { useUserStore } from '@/stores/userStore'
import { dateUuid } from '@/utils/utils'
      
export const useAudioMgr = defineStore('audioMgr', () => {  
   const userStore   = useUserStore() 
   const audioBlob   = ref(null)
   let mediaRecorder = null
   
   async function startRecording() {
      audioBlob.value = null
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream, { mimeType })
      const audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
         // console.log("mediaRecorder.ondataavailable")
         if (event.data && event.data.size > 0) { audioChunks.push(event.data) }
      }
      mediaRecorder.onstop = () => {
         audioBlob.value = new Blob(audioChunks, { type: 'audio/webm' })
      }

      mediaRecorder.start()
      console.log("Recording started")
   }

   async function stopRecording() {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
         mediaRecorder.stop()
         // stop all media stream tracks to turn off the microphone indicator light
         mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
   }

   const hasAudio = computed(() => audioBlob.value != null)

   function playAudio() {
      if (!audioBlob.value) return
      console.log("playAudio - audioBlob{bytes:" + audioBlob.value.size + ", type:" + audioBlob.value.type + "}")

      const audioUrl = URL.createObjectURL(audioBlob.value)
      const audioElement = new Audio(audioUrl)

      audioElement.play().catch((error) => {
         console.error("Error playing audio:", error)
      })
   }

   function playAudioUrl(audioUrl) {
      const audioElement = new Audio(audioUrl)
      audioElement.play().catch((error) => {
         console.error("Error playing audio:", error)
      })
   }

   function deleteAudio() { audioBlob.value = null }

   async function uploadAudio() {
      const audioSet = createAudioSet() 
      const audioRef = storageRef(storage, audioSet.filePath)
      
      try {
         const snapshot = await uploadBytes(audioRef, audioBlob.value)
         console.log("Uploaded a audio blob successfully!", snapshot)

         const downloadURL = await getDownloadURL(snapshot.ref)
         audioSet.url = downloadURL
      } catch (error) {
         // todo - handle better - retry?
         console.error("Error uploading audio", error)
      }

      return audioSet
   }

   function createAudioSet() {
      const id = dateUuid()
      const dir = "audio/" + userStore.userId + "/"
      const filePath = dir + id 
      return { 
         id: id, 
         mimeType: audioBlob.value.type,
         filePath: filePath,
      }
   }

   return { startRecording, stopRecording, hasAudio, playAudio, playAudioUrl, deleteAudio, uploadAudio }
})
