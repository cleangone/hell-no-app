import { defineStore } from 'pinia'
import { FirebaseFirestore, FieldValue } from '@capacitor-firebase/firestore'
import { useFirestoreListener } from './firestoreListener'
import { getAuth } from 'firebase/auth'

const Table = 'notifications'

export const useNotificationAccess = defineStore('notificationAccess', () => {
   function docPath(id) { return `${Table}/${id}` }
   const { records, addListener, removeListener } = useFirestoreListener(Table)

   async function update(id, data) {
      console.log("notificationStore.update", id, data)

      const auth = getAuth()
      console.log("auth uid", auth.currentUser?.uid)

      const dbData = { ...data, dateModified: FieldValue.serverTimestamp() }
      try { 
         await FirebaseFirestore.updateDocument({ reference: docPath(id), data: dbData })
      } 
      catch (err) {
         console.error("notificationAccess.update failed", err)
         throw err
      }
   }

   return { records, update, addListener, removeListener }
})
