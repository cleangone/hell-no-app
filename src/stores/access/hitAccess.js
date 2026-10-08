import { defineStore } from 'pinia'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'hits'

export const useHitAccess = defineStore('hitAccess', () => {
   const { 
      records: hits, 
      loading, 
      error, 
      addListener, 
      removeListener 
   } = useFirestoreListener(Table)

   return { hits, loading, error, addListener, removeListener }
})
