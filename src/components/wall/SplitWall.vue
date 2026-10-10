<template>
   <div class="wall-container px-3">
      <SwipeRow :wallRow="topRow" :rowHeight="topHeight" :showAvatars="showUserAvatars"/>
      <SwipeRow v-if="botRow" :wallRow="botRow" :rowHeight="botHeight"/>
   </div>
</template>

<script setup>
   import { computed, onMounted } from 'vue'
   import { useSwipeStore } from './SwipeStore'
   import { useViewStore }  from '@/stores/viewStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import SwipeRow          from './SwipeRow.vue'
   import { objAspectRatio, randomizeArray } from '@/utils/utils'
   import { Defaults, ItemOrigin, Route } from '@/utils/constants'

   const props = defineProps({ wall:Object, rowHeight:Number, linkUrl:String })
   
   const swipeStore = useSwipeStore()
   const viewStore  = useViewStore()
   const viewMgr    = useViewMgr()
   
   onMounted(() => {
      swipeStore.reset()
   })
   
   const wallItems = computed(() => {
      // console.log("wall", props.wall)
      const maxWallItems = props.wall.maxWallItems ? props.wall.maxWallItems : Defaults.MAX_WALL_ITEMS
      
      // fill wall with user wall items - these will be items from all user if site wall, or items
      // selected by the user to be on their wall.  They do not include the filled/recent items
      const allWallItems = []
      if (props.wall.userWallItems) {
         const randomUserWallItems = randomizeArray(props.wall.userWallItems)
         allWallItems.push(...randomUserWallItems.slice(0, maxWallItems))
      }
      // console.log("userWallItems", allWallItems)
     
      const userWallItemIds = allWallItems.map((obj) => obj.itemId) 
      const filledWallItems = randomizeArray([...props.wall.wallItems])
      for (const wallItem of filledWallItems) { 
         if (allWallItems.length >= maxWallItems) { break }
         else if (!userWallItemIds.includes(wallItem.itemId)) { allWallItems.push(wallItem) }
      }

      const maxTopRowItems = allWallItems.length < 10 ? 4 : 6
      let currTopRowItems = 0
      const topRowUserIdToCount = new Map() // site wall has no more than two top row items/user
      for (const wallItem of allWallItems) {  
         let topRowAvailable = true
         if (props.wall.id == Defaults.SITE_ID) {
            let userTopRowItems = topRowUserIdToCount.get(wallItem.userId) ?? 0
            if (userTopRowItems == 2) { topRowAvailable = false }
            else { topRowUserIdToCount.set(wallItem.userId, userTopRowItems + 1) }
         }
         
         if (currTopRowItems < maxTopRowItems && topRowAvailable) {
            wallItem.wallRow = 1
            currTopRowItems++
         }
         else if (props.wall.wallRows > 1) { wallItem.wallRow = 2 }
      } 
      
      return sizeWallItems(allWallItems)   
   })

   const sizeWallItems = (wallItems) => { 
      const sizedWallItems = []
      for (const wallItem of wallItems) {
         const sizedWallItem = { ...wallItem }

         const rowHeight =  wallItem.wallRow == 1 ? topHeight.value : botHeight.value
         if (wallItem.wallRow == 1) {
            sizedWallItem.wallImageUrl = wallItem.popupUrl  
            const aspectRatio = objAspectRatio(wallItem.popupDimensions)
            if (aspectRatio > 1) { 
               const thumbAspectRatio = objAspectRatio(wallItem.thumbDimensions)
               // console.log("thumbAspectRatio", wallItem.title, thumbAspectRatio)
               if (thumbAspectRatio > 1.25 && wallItem.largeThumbUrl) { 
                  sizedWallItem.wallImageUrl = wallItem.largeThumbUrl 
               }
               const targetWidth = rowHeight * .65 * aspectRatio // target so  height is 2/3 of row height
               const maxWidth =  viewMgr.isXs ? 300 : 400
               sizedWallItem.wallImageWidth = targetWidth < maxWidth ? targetWidth : maxWidth 
            }
            else { sizedWallItem.wallImageWidth = rowHeight * aspectRatio - (viewMgr.isXs ? 40 : 75) }
         }
         else {
            sizedWallItem.wallImageUrl = wallItem.thumbUrl
            const aspectRatio = objAspectRatio(wallItem.thumbDimensions)
            if (aspectRatio > 1) { 
               const targetWidth = rowHeight * .65 * aspectRatio // target so  height is 2/3 of row height
               sizedWallItem.wallImageWidth = targetWidth < 280 ? targetWidth : 280 
            }
            else { sizedWallItem.wallImageWidth = rowHeight * aspectRatio }
         }
         
         sizedWallItems.push(sizedWallItem)
      }

      return sizedWallItems
   }

   const getRowContainter = () => { 
      const rows = [] 
      for (let i=0; i<props.wall.wallRows; i++) {
         rows.push({ id: i, items: [] })
      }
      return rows
   }

   const slideRows = computed(() => { 
      const rows = getRowContainter()
      if (!rows.length) { return rows }
      const navItems = []

      for (const wallItem of wallItems.value) {
         if (wallItem.wallRow) {  
            const index = wallItem.wallRow - 1
            // console.log("index/rows", index, rows)
            if (index < rows.length) { // guard against screen width mobile issues
               rows[index].items.push(wallItem)
               rows[index].row = index

               navItems.push({ 
                  id:       wallItem.itemId, 
                  childNum: wallItem.childNum,
                  name:     wallItem.name, 
                  primaryImage: { 
                     thumbUrl: wallItem.thumbUrl, 
                     url: wallItem.popupUrl, 
                     dimensions: wallItem.thumbDimensions ? wallItem.thumbDimensions : wallItem.dimensions // backward compatible
                  } 
               })
            }
         }
      }

      viewStore.setVisibleItems(ItemOrigin.WALL, "Art Wall", props.linkUrl ?? Route.HOME.url, navItems) 
      return rows
   }) 

   const topRow = computed(() => slideRows.value[0])
   const botRow = computed(() => slideRows.value[1] ?? null)
   const totalHeight = computed(() => props.wall.wallRows > 1 ? props.rowHeight * 2 : props.rowHeight)
   const topHeight   = computed(() => props.wall.wallRows > 1 ? totalHeight.value * .8 : totalHeight.value)
   const botHeight   = computed(() => props.wall.wallRows > 1 ? totalHeight.value * .2 : 0)
   
   const showUserAvatars = computed(() => props.wall.id == Defaults.SITE_ID)
</script>

<style>
.wall-container {
   width: 100%;
   height: 100%;
   position: relative;
}
</style>
