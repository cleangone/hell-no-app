import { computed } from 'vue'
import { defineStore } from 'pinia'
import { Timestamp } from "firebase/firestore"
import { useLocalStorage } from '@vueuse/core'
import { useItemMgr }      from '@/stores/itemMgr'

/*
   Cache store - pass-through cache for item retrieval
*/

export const useCacheStore = defineStore('cache', () => {
   const itemMgr = useItemMgr()
   
   const recentPublicItemsLocal = useLocalStorage('recent-public-items', [])
   const recentPublicItems = computed(() => {
      const items = itemMgr.recentPublicItems 
      return items.length ? setLocal(recentPublicItemsLocal, items) : fixObjs(recentPublicItemsLocal.value)
   })

   const recentViewedPublicItemsLocal = useLocalStorage('recent-viewed-public-items', [])
   const recentViewedPublicItems = computed(() => {
      console.log("cacheStore.recentViewedPublicItems")
      const items = itemMgr.recentViewedPublicItems 
      return items.length ? setLocal(recentViewedPublicItemsLocal, items) : fixObjs(recentViewedPublicItemsLocal.value)
   })
   
   function setLocal(local, obj) { 
      local.value = obj
      return obj
   }

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
      if (clone.dateViewed)   { clone.dateViewed   = getTimestamp(clone.dateViewed)  }
      
      return clone
   }

   function getTimestamp(dateObj) { return new Timestamp(dateObj.seconds, dateObj.nanoseconds) }
   
   return { recentPublicItems, recentViewedPublicItems }
})
