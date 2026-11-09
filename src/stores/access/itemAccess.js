import { defineStore } from 'pinia'
import { FirebaseFirestore, FieldValue } from '@capacitor-firebase/firestore'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'items'

export const useItemAccess = defineStore('itemAccess', () => {
   function docPath(id) { return `${Table}/${id}` }

   const { records, addListener, removeListener } = useFirestoreListener(Table)

   async function set(id, data) {
      console.log("itemAccess.set", id)
      const dbData = { ...data, 
         dateCreated: FieldValue.serverTimestamp(), 
         dateModified: FieldValue.serverTimestamp(),
         dateContentModified: FieldValue.serverTimestamp() }
      try {
         await FirebaseFirestore.setDocument({ reference: docPath(id), data: dbData })
         console.log("itemAccess.set succeeded", id)
      } 
      catch (err) {
         console.error("itemAccess.set failed", err)
         throw err
      }
   }

   return { records, addListener, removeListener, set }
})
