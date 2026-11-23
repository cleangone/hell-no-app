import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { storage } from '@/firebase'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { useUserStore } from '@/stores/userStore'
import { dateUuid } from '@/utils/utils'
      
export const useAudioMgr = defineStore('audioMgr', () => {  
   const userStore   = useUserStore() 
   const audioChunks = ref([])
   let mediaRecorder = null
   
   async function startRecording() {
      audioChunks.value = []
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream, { mimeType })
      
      mediaRecorder.ondataavailable = (event) => {
         if (event.data && event.data.size > 0) { audioChunks.value.push(event.data) }
      }

      mediaRecorder.start()
      console.log("Recording started")
   }

   // not declared async because already returns promise containing the audioBlob
   function stopRecording() {
      return new Promise((resolve) => {
         if (!mediaRecorder || mediaRecorder.state === "inactive") {
            resolve(null)
            return
         }

         const mimeType = mediaRecorder.mimeType || 'audio/webm'
         mediaRecorder.onstop = () => {
            const audioBlob = audioChunks.value.length ? new Blob(audioChunks.value, { type: mimeType }) : null
            resolve(audioBlob)
         }

         mediaRecorder.stop()
         // Stop all media stream tracks to turn off the microphone indicator light
         mediaRecorder.stream.getTracks().forEach(track => track.stop())
      })
   }

   function playAudio(audioBlob) {
      if (!audioBlob) return
      console.log("playAudio - audioBlob{bytes:" + audioBlob.size + ", type:" + audioBlob.type + "}")

      const audioUrl = URL.createObjectURL(audioBlob)
      const audioElement = new Audio(audioUrl)

      audioElement.play().catch((error) => {
         console.error("Error playing audio:", error)
      })
   }

   async function uploadAudio(audioBlob) {
      const audioSet = createAudioSet(audioBlob) 
      const audioRef = storageRef(storage, audioSet.filePath)
      
      try {
         const snapshot = await uploadBytes(audioRef, audioBlob)
         console.log("Successfully uploaded audioBlob", snapshot)

         const downloadURL = await getDownloadURL(snapshot.ref)
         audioSet.url = downloadURL
      } catch (error) {
         // todo - handle better - retry?
         console.error("Error uploading audio", error)
      }

      return audioSet
   }

   function createAudioSet(audioBlob) {
      const id = dateUuid()
      const dir = "audio/" + userStore.userId + "/"
      const filePath = dir + id 
      return { 
         id: id, 
         mimeType: audioBlob.type,
         filePath: filePath,
      }
   }

   return { startRecording, stopRecording, playAudio, uploadAudio } 
})
