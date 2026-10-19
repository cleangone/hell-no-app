import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { useUserStore }    from '@/stores/userStore'
import { useItemStore }    from '@/stores/itemStore'
import { useGalleryStore } from '@/stores/galleryStore'
import { useGroupStore }   from '@/stores/groupStore'
import { useChatStore }    from '@/stores/chat/chatStore'
import { usePostStore }    from '@/stores/chat/postStore'
import { useReplyStore }   from '@/stores/chat/replyStore'
import { useHitStore }     from '@/stores/hitStore'
import { useWallStore }    from '@/stores/wallStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useViewStore }    from '@/stores/viewStore'
import { useLocalStore }   from '@/stores/localStore'
import { daysOld }         from '@/utils/dateUtils'
   
export const useAuthMgr = defineStore('authMgr', () => {
   const userStore    = useUserStore()
   const itemStore    = useItemStore()
   const galleryStore = useGalleryStore()
   const groupStore   = useGroupStore()
   const chatStore    = useChatStore()
   const postStore    = usePostStore()
   const replyStore   = useReplyStore()
   const hitStore     = useHitStore()
   const wallStore    = useWallStore()
   const notificationStore = useNotificationStore()
   const viewStore    = useViewStore()
   const localStore   = useLocalStore()
   const authListener = ref(null)
   const existingUid  = ref(null)
   
   const init = async () => {
      console.log("init")
      await checkCurrentUser()
      authListener.value = await FirebaseAuthentication
         .addListener('authStateChange', (event) => { handleAuthStateChange(event.user) })
      startSiteListeners()
   }
   
   const cleanup = async () => {
      console.log("cleanup") 
      if (authListener.value) {
         await authListener.value.remove()
         authListener.value = null
      }
   }

   const login = async (email, password) => {
      console.log("login", email, password)
      const result = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password })
      if (result.user) { return result.user }
      else { throw({ code: "user-unkown", message: "Login succeeded but no user returned" })}
   }

   const logout = async () => {
      console.log("logout")
      try {
         // stop listeneres first to avoid db read permissoin errors 
         // they will be stopped again by handleAuthStateChange, which is handled
         await stopUserListeners() 
         await FirebaseAuthentication.signOut()
      } 
      catch (error) {
         console.error("Logout failed", error)
      }
   }

   const createUser = async (email, password) => {
      console.log("createUser", email)
      const result = await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password })
      if (result.user) { return result.user }
      else { throw({ code: "user-unkown", message: "CreateUser succeeded but no user returned" })}
   }

   const sendPasswordEmail = async (email) => {
      console.log("resetPassword")
      FirebaseAuthentication.sendPasswordResetEmail({ email })
   }

   const checkCurrentUser = async () => {
      try {
         const result = await FirebaseAuthentication.getCurrentUser()
         handleAuthStateChange(result.user)
      } 
      catch (error) {
         console.warn("FirebaseAuthentication.getCurrentUser error", error) 
         handleAuthStateChange(null)
      }
   }

   const handleAuthStateChange = async (user) => {
      const newUid = user ? user.uid : ""
      console.log("handleAuthStateChange", newUid || "no user")

      if (existingUid.value === newUid && userStore.userId === newUid) { 
         console.log("Redundant uid")
         return 
      }
      existingUid.value = newUid

      if (user) { 
         userStore.setUserId(user.uid) 
         await new Promise(resolve => setTimeout(resolve, 500)) // allow auth context to propagate
         startUserListeners()
      } 
      else { 
         userStore.setUserId("")
         stopUserListeners()
         localStore.setSoloMode(false)
      }

      if (userStore.userId) {
         setTimeout(() => {
            if (userStore.user && (!userStore.user.dateVisited || daysOld(userStore.user.dateVisited))) {
               userStore.updateDateVisited(userStore.userId)
            }
         }, 2000)
      }
      viewStore.resetView()
   }

   const startSiteListeners = async () => {
      console.log("startSiteListeners")
      await Promise.allSettled([
         userStore.addListener().catch(err    => console.error("userStore addListener error",    err)),
         itemStore.addListener().catch(err    => console.error("itemStore addListener error",    err)),
         galleryStore.addListener().catch(err => console.error("galleryStore addListener error", err)),
         groupStore.addListener().catch(err   => console.error("groupStore addListener error",   err)),
         chatStore.addListener().catch(err    => console.error("chatStore addListener error",    err)),
         hitStore.addListener().catch(err     => console.error("hitStore addListener error",     err)),
         wallStore.addListener().catch(err    => console.error("wallStore addListener error",    err)),
         notificationStore.addListener().catch(err => console.error("notificationStore addListener error", err))
      ])
   }

   const startUserListeners = async () => {
      console.log("startUserListeners")
      await Promise.allSettled([
         postStore.addListener().catch(err  => console.error("postStore addListener error", err)),
         replyStore.addListener().catch(err => console.error("replyStore addListener error", err)),
      ])
   }

   const stopUserListeners = async () => {
      console.log("stopUserListeners")
      await Promise.allSettled([
         postStore.removeListener().catch(err  => console.error("postStore removeListener error", err)),
         replyStore.removeListener().catch(err => console.error("replyStore removeListener error", err)),
      ])
   }

   return { init, cleanup, login, logout, createUser, sendPasswordEmail }
})
