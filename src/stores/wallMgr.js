import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useWallStore } from '@/stores/wallStore'
import { useItemStore } from '@/stores/itemStore'
import { useItemMgr }   from '@/stores/itemMgr'
import { Defaults, ItemType, WallImages, WallType } from '@/utils/constants' 
 
export const useWallMgr = defineStore('wallMgr', () => { 
   const userStore = useUserStore()
   const wallStore = useWallStore()
   const itemStore = useItemStore()
   const itemMgr   = useItemMgr()
   
   function name(wall) { 
      if (wall.type == WallType.SITE) { return "Site" }
      else if (wall.type == WallType.USER) { return userStore.getUsername(wall.id)  }
      return ""
   }

   const randomWallImage = computed(() => WallImages[Math.floor(Math.random() * WallImages.length)])

   const filledSiteWall = computed(() => {
      const siteCopy = { ...wallStore.siteWall }
      siteCopy.userWallItems = [ ...wallStore.userWallItems ]
      return fillWall(siteCopy, itemMgr.recentPublicItems) 
   })

   const filledMyWall = computed(() => {
      return fillWall({ ...wallStore.myWall }, itemMgr.myRecentItems) 
   })

   function fillWall(wall, items) { 
      wall.origWallRows = wall.wallRows // transient for moving between mobile/desktop view
      const maxItems = wall.maxWallItems ? wall.maxWallItems : Defaults.MAX_WALL_ITEMS
      const wallItemIds = wall.wallItems.map(wallItem => wallItem.itemId)

      const filledWall = { ...wall }
      filledWall.wallItems = [ ...wall.wallItems ]
      filledWall.userWallItems = wall.userWallItems ? [ ...wall.userWallItems ] : [  ...wall.wallItems ]

      const randomUngroupedItems = itemMgr.ungroupItems(items)
         .map(item => ({ ...item, random: Math.floor(Math.random() * 1000) }))
      randomUngroupedItems.sort(function(a, b) {return b.random - a.random}) 

      for (const ungroupedItem of randomUngroupedItems) { 
         if (filledWall.wallItems.length >= maxItems) { break }
         
         // workaround - having issues with actual ungrouped item not having a primaryImage
         if (!wallItemIds.includes(ungroupedItem.id) && ungroupedItem.type == ItemType.SINGLE) {
            const wallItem = { ...ungroupedItem, userId: ungroupedItem.userId }
            const imageItem = itemMgr.extractFromItemGroup(ungroupedItem)
            wallItem.name = imageItem.name
            filledWall.wallItems.push(wallStore.createWallItem(wallItem, imageItem.primaryImage))
         }
      }
      return filledWall
   }

   function userWallIncludesItem(userId, itemId) { 
      const wall = wallStore.getUserWall(userId)
      if (!wall?.wallItems?.length) { return false }

      const itemIds = wall.wallItems.map(a => a.itemId) 
      return itemIds.includes(itemId) 
   }   

   function deleteWallItem(wallItem, wallId) { 
      wallStore.removeWallItem(wallItem.itemId, wallId) 
      itemStore.updateItem({ id: wallItem.itemId, onUserWall: false })
   }
   
   return { name, randomWallImage, filledSiteWall, filledMyWall, fillWall, userWallIncludesItem, deleteWallItem }
})

