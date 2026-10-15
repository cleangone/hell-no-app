import { defineStore } from 'pinia'
import { useFirestoreListener } from '../firestoreListener'
  
const Table = 'chats'

export const useChatAccess = defineStore('chatAccess', () => {
   const { records, addListener, removeListener } = useFirestoreListener(Table)

   return { records, addListener, removeListener }
})
