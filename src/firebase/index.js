import { initializeApp }  from "firebase/app"
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore"
// import { initializeAuth, indexedDBLocalPersistence } from "firebase/auth"
import { getStorage }     from "firebase/storage"
import { FirebaseConfig } from '@/config/config'
   
const app = initializeApp(FirebaseConfig)

// db init for comiplation - stores will be updated to use direct ion/firebase api
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
})
// const auth = initializeAuth(app, { persistence: indexedDBLocalPersistence })
const storage = getStorage(app)

// export { app, db, auth, storage } 
export { app, db, storage } 
