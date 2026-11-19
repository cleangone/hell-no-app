import { defineStore } from 'pinia'
import { doc, setDoc, updateDoc, writeBatch, serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase" 
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'hits'

export const useHitAccess = defineStore('hitAccess', () => {
   // function docPath(id) { return `${Table}/${id}` }
   function hitDoc(id) { return doc(db, Table, id) }

   const { records, addListener, removeListener } = useFirestoreListener(Table)

   async function create(id, data) {
      console.log("hitAccess.create", id)
      // const dbData = { ...data, dateCreated: serverTimestamp(), dateModified: serverTimestamp()}
      try {
         // await FirebaseFirestore.setDocument({ reference: docPath(id), data: dbData })

         await setDoc(hitDoc(id), { ...data, dateCreated: serverTimestamp(), dateModified: serverTimestamp()})
         console.log("hitAccess.create succeeded", id)
      } 
      catch (err) {
         console.error("hitAccess.create failed", err)
         throw err
      }
   }
   
   async function update(id, data) {
      console.log("hitAccess.update", id)
      // const dbData = { ...data, dateModified: FieldValue.serverTimestamp() }
      try {
         // await FirebaseFirestore.updateDocument({ reference: docPath(id), data: dbData })
         await updateDoc(hitDoc(id), { ...data, dateModified: serverTimestamp() })
         console.log("hitAccess.update succeeded", id)
      } 
      catch (err) {
         console.error("hitAccess.update failed", err)
         throw err
      }
   }

   // async function batchUpdate(updates) {
   //    console.log("hitAccess.batchUpdate", updates.length)
   //    try {
   //       const operations = updates.map(({ id, data }) => ({
   //          type: 'update',
   //          reference: docPath(id),
   //          data: { ...data, dateModified: FieldValue.serverTimestamp() }
   //       }))

   //       await FirebaseFirestore.writeBatch({ operations })
   //       console.log("hitAccess.batchUpdate succeeded")
   //    } 
   //    catch (err) {
   //       console.error("hitAccess.batchUpdate failed", err)
   //       throw err
   //    }
   // }

   // updates: [{ id, data }]
   async function batchUpdate(updates) {
      console.log("hitAccess.batchUpdate", updates.length)
      try {
         const batch = writeBatch(db)
         for (const update of updates) {
            batch.update(hitDoc(update.id), { ...update.data, dateModified: serverTimestamp() })
         }
         await batch.commit()
         console.log("hitAccess.batchUpdate succeeded")
      } 
      catch (err) {
         console.error("hitAccess.batchUpdate failed", err)
         throw err
      }
   }

   return { records, addListener, removeListener, create, update, batchUpdate }
})
