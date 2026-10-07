import { ref } from 'vue'
import { FirebaseFirestore } from '@capacitor-firebase/firestore'

export function useFirestoreListener(tableName) {
   const records = ref([])
   const loading = ref(false)
   const error   = ref(null)
   let   listenerCallbackId = null

   const addListener = async () => {
      if (listenerCallbackId) { return }
      loading.value = true
      error.value = null

      try {
         const { callbackId } = await FirebaseFirestore.addCollectionSnapshotListener(
            { reference: tableName, compositeFilter: null, queryConstraints: [] },
            (event, err) => {
               if (err) {
                  console.error(`[${tableName}] listener error:`, err)
                  error.value = err.message || err
                  loading.value = false
                  return
               }

               if (event?.snapshots) {
                  records.value = event.snapshots.map(snapshot => snapshot.data)
                  console.log(`[Native Sync] Read ${records.value.length} ${tableName} records`)
               }
               loading.value = false
            }
         )
         listenerCallbackId = callbackId
      } 
      catch (err) {
         console.error(`Failed to attach native listener [${tableName}]:`, err)
         error.value = err.message || err
         loading.value = false
      }
   }

   const removeListener = async () => {
      if (listenerCallbackId) {
         try {
            await FirebaseFirestore.removeSnapshotListener({ callbackId: listenerCallbackId }) } 
         catch (err) {
            console.error(`Failed to remove listener [${tableName}]:`, err) } 
         finally {
            listenerCallbackId = null }
      }
   }

   return { records, loading, error, addListener, removeListener }
}