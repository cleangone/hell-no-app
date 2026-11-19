import { defineStore } from 'pinia'
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase" 
import { useFirestoreListener } from './firestoreListener'
  
const Table = 'items'

export const useItemAccess = defineStore('itemAccess', () => {
   function itemDoc(id) { return doc(db, Table, id) }
   
   const { records, addListener, removeListener } = useFirestoreListener(Table)

   async function set(id, data) {
      console.log("itemAccess.set", id)
      const dbData = { ...data, 
         dateCreated: serverTimestamp(), 
         dateModified: serverTimestamp(),
         dateContentModified: serverTimestamp() }
      try {
         await setDoc(itemDoc(id), dbData)
      } 
      catch (err) {
         console.error("itemAccess.set failed", err)
         throw err
      }
   }

   return { records, addListener, removeListener, set }
})
