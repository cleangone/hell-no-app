import { defineStore } from 'pinia'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'galleries'

export const useGalleryAccess = defineStore('galleryAccess', () => {
   const { 
      records: galleries, 
      loading, 
      error, 
      addListener, 
      removeListener 
   } = useFirestoreListener(Table)

   return { galleries, loading, error, addListener, removeListener }
})
