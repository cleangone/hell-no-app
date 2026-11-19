import { defineStore } from 'pinia'
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase" 
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'users'

export const useUserAccess = defineStore('userAccess', () => {
   function userDoc(id) { return doc(db, Table, id) }

   const { records, addListener, removeListener } = useFirestoreListener(Table)

   async function update(id, data) {
      try {
         await updateDoc(userDoc(id), { ...data, dateModified:serverTimestamp() })
      }
      catch (error) {
         console.error("userAccess.update failed", error)
         throw error
      }
   }

   return { records, addListener, removeListener, update }
})
