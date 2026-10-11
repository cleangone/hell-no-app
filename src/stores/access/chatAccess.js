import { defineStore } from 'pinia'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'chats'

export const useChatAccess = defineStore('chatAccess', () => {
   const { 
      records: chats, 
      loading, 
      error, 
      addListener, 
      removeListener 
   } = useFirestoreListener(Table)

   return { chats, loading, error, addListener, removeListener }
})
