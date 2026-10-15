import { defineStore } from 'pinia'
import { useFirestoreListener } from '../firestoreListener'
  
const Table = 'chat-replies'

export const useReplyAccess = defineStore('replyAccess', () => {
   const { records, addListener, removeListener } = useFirestoreListener(Table)

   return { records, addListener, removeListener }
})
