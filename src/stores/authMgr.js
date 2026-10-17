import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase' 
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
      authListener.value = onAuthStateChanged(auth, (user) => { handleAuthStateChange(user) })
      startSiteListeners()
   }
   
   const cleanup = async () => {
      console.log("cleanup") 
      if (authListener.value) {
         authListener.value() // unsubscribe auth listener
         authListener.value = null
      }
   }

   const login = async (email, password) => {
      console.log("login")
      try {
         const result = await signInWithEmailAndPassword(auth, email, password)
         if (result.user) { return { success: true, user: result.user }}
         else { return { success: false, error: { message: "Login succeeded but no user returned" } }} 
      }
      catch (error) {
         return { success: false, error: error}
      }
   }

   const logout = async () => {
      console.log("logout")
      try {
         // stop listeneres first to avoid db read permissoin errors 
         // they will be stopped again by handleAuthStateChange, which is handled
         await stopUserListeners() 
         await signOut(auth)
      } 
      catch (error) {
         console.error("Logout failed", error)
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
         startUserListeners()
      } 
      else { 
         userStore.setUserId("")
         stopUserListeners()
         localStore.setSoloMode(false)
      }

      // todo - commented out during db update migrattion
      if (userStore.userId) {
         setTimeout(() => {
            if (userStore.user && (!userStore.user.dateVisited || daysOld(userStore.user.dateVisited))) {
               console.log("userStore.updateDateVisited bypassed")
               // userStore.updateDateVisited(userStore.userId)
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

   return { init, cleanup, login, logout }
})
