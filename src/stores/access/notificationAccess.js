import { defineStore } from 'pinia'
import { FirebaseFirestore, FieldValue } from '@capacitor-firebase/firestore'
import { useFirestoreListener } from './firestoreListener'

const Table = 'notifications'

export const useNotificationAccess = defineStore('notificationAccess', () => {
   function docPath(id) { return `${Table}/${id}` }
   const { records, addListener, removeListener } = useFirestoreListener(Table)

   async function update(id, data) {
      console.log("notificationStore.update", id, data)

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
