import { defineStore } from 'pinia'
import { useFirestoreListener } from '../firestoreListener'
  
const Table = 'chat-posts'

export const usePostAccess = defineStore('postAccess', () => {
   const { records, addListener, removeListener } = useFirestoreListener(Table)

   return { records, addListener, removeListener }
})
