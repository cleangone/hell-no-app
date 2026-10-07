import { defineStore } from 'pinia'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'items'

export const useItemAccess = defineStore('itemAccess', () => {
   const { 
      records: items, 
      loading, 
      error, 
      addListener, 
      removeListener 
   } = useFirestoreListener(Table)

   return { items, loading, error, addListener, removeListener }
})
