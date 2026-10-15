import { defineStore } from 'pinia'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'walls'

export const useWallAccess = defineStore('wallAccess', () => {
   const { records, addListener, removeListener } = useFirestoreListener(Table)

   return { records, addListener, removeListener }
})
