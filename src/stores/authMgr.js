import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useIonRouter } from '@ionic/vue'
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
import { dateUuid, isHidden, isOwned, isPublic } from '@/utils/utils'  
import { Route } from '@/utils/constants'
   
export const useAuthMgr = defineStore('authMgr', () => {
   const ionRouter = useIonRouter()
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
         authMgr
         await authListener.value.remove()
         authListener.value = null
      }
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

   const logout = async () => {
      console.log("authMgr logout")
      try {
         await stopUserListeners()
         await FirebaseAuthentication.signOut()
         ionRouter.push(Route.HOME.url)
      } 
      catch (error) {
         console.error("Logout failed", error)
      }
   }

   const handleAuthStateChange = (user) => {
      console.log("handleAuthStateChange", user ? user.uid : "no user")
      if (user) { userStore.setUserId(user.uid) } 
      else { 
         userStore.setUserId("")
         localStore.setSoloMode(false) // in case user had solo set
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

   return { init, cleanup, logout, handleAuthStateChange, startSiteListeners, startUserListeners, stopUserListeners }
})
