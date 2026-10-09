import { defineStore } from 'pinia'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'walls'

export const useWallAccess = defineStore('wallAccess', () => {
   const { 
      records: walls, 
      loading, 
      error, 
      addListener, 
      removeListener 
   } = useFirestoreListener(Table)

   return { walls, loading, error, addListener, removeListener }
})
