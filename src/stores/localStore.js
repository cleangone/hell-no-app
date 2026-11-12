import { computed } from 'vue'
import { defineStore } from 'pinia'
import { Timestamp } from "firebase/firestore"
import { useLocalStorage } from '@vueuse/core'
import { DefaultWall } from '@/utils/constants'

/*
   Local storage
      site-wall - {}
      my-wall - {}
      device-id
*/

export const useLocalStore = defineStore('local', () => {
   const siteWallLocal = useLocalStorage('site-wall', DefaultWall)
   const siteWall = computed(() => fixDates(siteWallLocal.value))
   function setSiteWall(wall) { siteWallLocal.value = wall }
   
   const myWallLocal = useLocalStorage('my-wall', DefaultWall)
   const myWall = computed(() => fixDates(myWallLocal.value))
   function setMyWall(wall) { myWallLocal.value = wall }
   
   const deviceId = useLocalStorage('device-id', null)
   function setDeviceId(id) { deviceId.value = id }

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
   
   return { siteWall, setSiteWall, myWall, setMyWall, deviceId, setDeviceId }
})
