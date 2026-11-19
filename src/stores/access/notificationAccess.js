import { defineStore } from 'pinia'
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase" 
import { useFirestoreListener } from './firestoreListener'

const Table = 'notifications'

export const useNotificationAccess = defineStore('notificationAccess', () => {
   function notificationDoc(id) { return doc(db, Table, id) }

   const { records, addListener, removeListener } = useFirestoreListener(Table)

   async function update(id, data) {
      console.log("notificationStore.update", id, data)
      try { 
         await updateDoc(notificationDoc(id), { ...data, dateModified: serverTimestamp() })
      } 
      catch (err) {
         console.error("notificationAccess.update failed", err)
         throw err
      }
   }

   return { records, update, addListener, removeListener }
})
