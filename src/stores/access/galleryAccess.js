import { defineStore } from 'pinia'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'galleries'

export const useGalleryAccess = defineStore('galleryAccess', () => {
   const { records, addListener, removeListener } = useFirestoreListener(Table)

   return { records, addListener, removeListener }
})
