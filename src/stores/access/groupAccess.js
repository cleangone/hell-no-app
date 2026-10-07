import { defineStore } from 'pinia'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'groups'

export const useGroupAccess = defineStore('groupAccess', () => {
   const { 
      records: groups, 
      loading, 
      error, 
      addListener, 
      removeListener 
   } = useFirestoreListener(Table)

   return { groups, loading, error, addListener, removeListener }
})
