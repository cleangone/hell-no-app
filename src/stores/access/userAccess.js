import { defineStore } from 'pinia'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'users'

export const useUserAccess = defineStore('userAccess', () => {
   const { 
      records: users, 
      loading, 
      error, 
      addListener, 
      removeListener 
   } = useFirestoreListener(Table)

   return { users, loading, error, addListener, removeListener }
})
