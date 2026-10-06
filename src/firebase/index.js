import { initializeApp }  from "firebase/app"
import { initializeFirestore, memoryLocalCache } from "firebase/firestore"
import { getStorage }     from "firebase/storage"
import { FirebaseConfig } from '@/config/config'
   
const app = initializeApp(FirebaseConfig)

const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: memoryLocalCache()
})

const storage = getStorage(app)

export { db, storage } 
