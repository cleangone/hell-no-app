import { defineStore } from 'pinia'
import { FirebaseFirestore, FieldValue } from '@capacitor-firebase/firestore'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'users'

export const useUserAccess = defineStore('userAccess', () => {
   function docPath(id) { return `${Table}/${id}` }

   const { records, addListener, removeListener } = useFirestoreListener(Table)

   async function update(id, data) {
      // console.log("userAccess.update", id)
      const dbData = { ...data, dateModified: FieldValue.serverTimestamp() }
      try {
         await FirebaseFirestore.updateDocument({ reference: docPath(id), data: dbData })
         // console.log("userAccess.update succeeded", id)
      } 
      catch (error) {
         // console.error("userAccess.update failed", error)
         throw error
      }
   }

   return { records, addListener, removeListener, update }
})
