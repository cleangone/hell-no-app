import { initializeApp }  from "firebase/app"
import { initializeFirestore, memoryLocalCache } from "firebase/firestore"
import { getAuth, initializeAuth, indexedDBLocalPersistence } from "firebase/auth"
import { getStorage }     from "firebase/storage"
import { Capacitor }      from '@capacitor/core'
import { FirebaseConfig } from '@/config/config'
   
const app = initializeApp(FirebaseConfig)

const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: memoryLocalCache()
})

const auth = Capacitor.isNativePlatform()
   ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
   : getAuth(app)

const storage = getStorage(app)

export { db, auth, storage } 
