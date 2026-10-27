import { defineStore } from 'pinia'
import { FirebaseFirestore, FieldValue } from '@capacitor-firebase/firestore'
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'hits'

export const useHitAccess = defineStore('hitAccess', () => {
   function docPath(id) { return `${Table}/${id}` }

   const { records, addListener, removeListener } = useFirestoreListener(Table)

   async function create(id, data) {
      console.log("hitAccess.create", id)
      const dbData = { ...data, dateCreated: FieldValue.serverTimestamp(), dateModified: FieldValue.serverTimestamp()}
      try {
         await FirebaseFirestore.setDocument({ reference: docPath(id), data: dbData })
         console.log("hitAccess.create succeeded", id)
      } 
      catch (err) {
         console.error("hitAccess.create failed", err)
         throw err
      }
   }
   
   async function update(id, data) {
      console.log("hitAccess.update", id)
      const dbData = { ...data, dateModified: FieldValue.serverTimestamp() }
      try {
         await FirebaseFirestore.updateDocument({ reference: docPath(id), data: dbData })
         console.log("hitAccess.update succeeded", id)
      } 
      catch (err) {
         console.error("hitAccess.update failed", err)
         throw err
      }
   }

   async function batchUpdate(updates) {
      console.log("hitAccess.batchUpdate count:", updates.length)
      try {
         const operations = updates.map(({ id, data }) => ({
            type: 'update',
            reference: docPath(id),
            data: { ...data, dateModified: FieldValue.serverTimestamp() }
         }))

         await FirebaseFirestore.writeBatch({ operations })
         console.log("hitAccess.batchUpdate succeeded")
      } 
      catch (err) {
         console.error("hitAccess.batchUpdate failed", err)
         throw err
      }
   }

   return { records, addListener, removeListener, create, update, batchUpdate }
})
