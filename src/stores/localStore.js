import { computed } from 'vue'
import { defineStore } from 'pinia'
import { Timestamp } from "firebase/firestore"
import { useLocalStorage } from '@vueuse/core'
import { dateUuid } from '@/utils/utils'
import { DefaultWall, State } from '@/utils/constants'

/*
   Local storage
      site-wall - {}
      my-wall - {}
      app-id
      device-id
      camera-gallery-id
*/

export const useLocalStore = defineStore('local', () => {
   const siteWallLocal = useLocalStorage('site-wall', DefaultWall)
   const siteWall = computed(() => fixDates(siteWallLocal.value))
   function setSiteWall(wall) { siteWallLocal.value = wall }
   
   const myWallLocal = useLocalStorage('my-wall', DefaultWall)
   const myWall = computed(() => fixDates(myWallLocal.value))
   function setMyWall(wall) { myWallLocal.value = wall }
   
   const appId = useLocalStorage('app-id', null)
   function resetAppId() { 
      if (!appId.value) {
         console.log("Resetting appId")
         appId.value = dateUuid()
      }
   }

   const deviceId = useLocalStorage('device-id', null)
   function setDeviceId(id) { deviceId.value = id }

   const cameraGalleryId = useLocalStorage('camera-gallery-id', null)
   function setCameraGalleryId(id) { cameraGalleryId.value = id }

   const cameraItemState = useLocalStorage('camera-item-state', State.PUBLIC)
   function setCameraItemState(state) { cameraItemState.value = state }

   const savedPhotos = useLocalStorage('saved-photos', [])

   function fixObjs(localObjs) {
      const objs = []
      for (const localObj of localObjs) {
         objs.push(fixDates(localObj))
      }
      return objs
   }

   // local storage serialization recreates date but not the object w methods
   function fixDates(obj) { 
      const clone = { ...obj }
      if (clone.dateCreated)  { clone.dateCreated  = getTimestamp(clone.dateCreated)  }
      if (clone.dateModified) { clone.dateModified = getTimestamp(clone.dateModified) }
      if (clone.dateContentModified) { clone.dateContentModified = getTimestamp(clone.dateContentModified) }
      return clone
   }

   function getTimestamp(dateObj) { return new Timestamp(dateObj.seconds, dateObj.nanoseconds) }
   
   return { siteWall, setSiteWall, myWall, setMyWall, 
            appId, resetAppId, deviceId, setDeviceId, 
            cameraGalleryId, setCameraGalleryId, cameraItemState, setCameraItemState, savedPhotos }
})
