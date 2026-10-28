import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useIonRouter } from '@ionic/vue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
// import { auth } from '@/firebase' 
// import { signOut } from "firebase/auth"
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { useAuthMgr }      from '@/stores/authMgr'
import { useUserStore }  from '@/stores/userStore'
import { useItemMgr }    from '@/stores/itemMgr'
import { useGalleryMgr } from '@/stores/galleryMgr'
import { useWallStore }  from '@/stores/wallStore'
import { usePostStore }  from '@/stores/chat/postStore'
import { useReplyStore } from '@/stores/chat/replyStore'
import { useHitMgr }     from '@/stores/hitMgr'
import { useViewStore }  from '@/stores/viewStore'
import { useLocalStore } from '@/stores/localStore'
import { dateUuid, isHidden, isOwned, isPublic } from '@/utils/utils'  
import { ItemMaxLandscapeWidths, Route, ThumbHeights, ThumbSize } from '@/utils/constants'
   
export const useViewMgr = defineStore('viewMgr', () => {   
   const router    = useRouter()
   const ionRouter = useIonRouter()
   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const authMgr      = useAuthMgr()
   const userStore    = useUserStore()
   const itemMgr      = useItemMgr()
   const galleryMgr   = useGalleryMgr()
   const wallStore    = useWallStore()
   const postStore    = usePostStore()
   const replyStore   = useReplyStore()
   const hitMgr       = useHitMgr()
   const viewStore    = useViewStore()
   const localStore   = useLocalStore()
   
   function init() {
      // console.log("viewMgr.init")
      if (!viewStore.isInitialized) {
         viewStore.init()

         let deviceId = localStore.deviceId
         // console.log("localStore.deviceId", deviceId)
         if (!deviceId) {
            deviceId = dateUuid()
            // console.log("localStore.setDeviceId", deviceId)
            localStore.setDeviceId(deviceId)
         }
         viewStore.setDeviceId(deviceId)

         // preload walls for Home 
         wallStore.siteWall
         if (userStore.userExists) { wallStore.myWall }
      }
   }

   const logout = async () => {
      console.log("viewMgr logout")
      try {
         await authMgr.logout()
         ionRouter.push(Route.HOME.url)
      } 
      catch (err) {
         console.error("Logout failed", err)
      }
   }

   const isStandalone = computed(() => window.matchMedia('(display-mode: standalone)').matches)
   const isXs         = computed(() => xs.value)
   const isMobile     = computed(() => {
         const iosDevice = navigator.userAgent.match(/iPhone|iPod/) // ipad no longer matches
         if (xs.value || (isStandalone.value && iosDevice != null)) { return true }
         
         // ipad check
         if (navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints){ return true }

         return false
   })
   const isDeskTop = computed(() => !isMobile.value)
   const solo      = computed(() => localStore.soloMode)

   // can nav directly to INVISIBLE item even though thumb/link not visible, but HIDDEN items never visible
   function itemIsVisibleToUser(item)    { return itemThumbVisibleToUser(item) }
   function itemThumbVisibleToUser(item) { return isPublic(item) || item.onUserWall || (isOwned(item, userStore.userId) && !isHidden(item)) }
      
   // can nav directly to INVISIBLE gallery even though thumb/link not visible
   function galleryIsVisibleToUser(gallery) { 
      return isOwned(gallery, userStore.userId) || !solo.value && (isPublic(gallery)) }
   function galleryThumbVisibleToUser(gallery) { 
      return isOwned(gallery, userStore.userId) || !solo.value && isPublic(gallery) }

   const hitIds = ref([])
   function addHit(itemId) {
      if (!hitIds.value.includes(itemId)) {
         hitIds.value.push(itemId)
         hitMgr.addHit(itemId)
      }
      if (hitIds.value.length == 1) {
         setTimeout(function() { 
            // console.log("viewMgr hits reset")
            hits.value = [] 
         }, 1000 * 60 * 60) // reset after an hour
      }
   }

   function galleryItemCount(gallery) {
      const itemIds = new Set()
      for (const item of galleryMgr.uniqueItems(gallery) ) {
         if (itemIsVisibleToUser(item)) { 
            if (itemMgr.isItemGroup(item)) { 
               for (const childItem of item.childItems) { 
                  itemIds.add(childItem.id)
               }
            }
            else { itemIds.add(item.id) }
         }
      } 
      return itemIds.size
   }

   function getTargetThumbHeight(size) {
      const heights = isXs.value ? ThumbHeights.xsSizes : ThumbHeights.sizes 

      if (size == ThumbSize.IMG)      { return heights[0] }
      else if (size == ThumbSize.SM)  { return heights[1] }
      else if (size == ThumbSize.MED) { return heights[2] }
      else if (size == ThumbSize.XL)  { return heights[4] }
      else { return heights[3] }
   }

   function getItemMaxLandscapeWidth(thumbSize) {
      const widths = isXs.value ? ItemMaxLandscapeWidths.xsSizes : ItemMaxLandscapeWidths.sizes 
      return widths.get(thumbSize) 
   }
      
   return { init, isMobile, isXs, isDeskTop, solo, addHit, itemIsVisibleToUser, itemThumbVisibleToUser, 
            galleryIsVisibleToUser, galleryThumbVisibleToUser, galleryItemCount, 
            getTargetThumbHeight, getItemMaxLandscapeWidth,
            logout }
})
