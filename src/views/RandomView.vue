<template>
   <div v-if="galleries.length"> 
      <span v-for="gallery,index in galleries" :key="gallery.id">
         <span v-if="index"> | </span>
         <RouterLink :to="Route.GALLERY.url + gallery.id">{{ gallery.name }} Gallery</RouterLink>
      </span>
   </div>
   <div v-if="currItem" ref="swipeElement" class="center d-flex justify-center">  
      <SwipeItem v-for="item in swipeItems" :key="item.id" :item="item" :isFavorite="isFavorite" 
         :canSwipeLeft="navItems.next!=null" :canSwipeRight="navItems.prev!=null" canSwipeUp canSwipeDown
         v-on:swipeLeft="onSwipeLeftStarted"  v-on:swipeRight="onSwipeRightStarted" 
         v-on:swipeUp="onSwipeVerticalStarted" v-on:swipeDown="onSwipeVerticalStarted" 
         v-on:done="onSwipeDone" class="itemSwipe" :style="itemSwipeWidthStyle"/>
   </div>
</template>

<script setup>
   import { computed, ref }   from 'vue'
   import { useWindowSize }   from '@vueuse/core'
   import { useUserStore }    from '@/stores/userStore'
   import { useUserMgr }      from '@/stores/userMgr'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import SwipeItem from '@/components/item/SwipeItem.vue'
   import { Emit } from '@/utils/constants'
   import { Route } from '@/utils/constants'
   
   const userStore    = useUserStore()
   const userMgr      = useUserMgr()
   const itemMgr      = useItemMgr()
   const galleryStore = useGalleryStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const { width: windowWidth } = useWindowSize()
   const currItems = ref([])
   const currItemIndex = ref(0)
   const swipeBotItem = ref(null)
   const prevHorSwipe = ref(null)

   const items = computed(() => {
      if (currItems.value.length < 5) { currItems.value.push(...itemMgr.getRandomItems()) }
      return currItems.value
   })

   const currItem = computed(() => {
      if (currItemIndex.value > currItems.value.length - 3) { currItems.value.push(...itemMgr.getRandomItems()) }
      const curr = currItems.value[currItemIndex.value]
      viewStore.setPageName(curr.name)
      return curr
   })

   const imageWidth = computed(() => currItem.value ? currItem.value.primaryImage.dimensions.width : 0)
   const isFavorite = computed(() => userStore.user?.favoriteItems?.includes(currItem.value.id))
   
   const navItems = computed(() => { 
      const i = currItemIndex.value
      // console.log("currItemIndex", i)
      // console.log("currItem", currItem.value ? currItem.value.name : "null")
      
      let prev = i > 0 ? items.value[i-1] : null
      let next = i < items.value.length - 1 ? items.value[i+1] : null

      // preload next image (prev probably already been displayed)
      if (next) { viewStore.loadImage(next.primaryImage.url) } 
         
      // preload predicted bottom image, which will be gradually revealed during swipe
      // if at either end, preload the only possible direction to swipe/arrow 
      // in middle, user swiping or arrowing in a direction will prob continue that way 
      // if prediction wrong, correct bottom will be set at beginning of swipe
      setTimeout(() => { // delay prevents flash of top image
         if (prev || next) {
            if (prev == null || prevHorSwipe.value == Emit.SWIPE_LEFT) {  swipeBotItem.value = next } 
            else if (next == null || prevHorSwipe.value == Emit.SWIPE_RIGHT) {  swipeBotItem.value = prev } 
            else { swipeBotItem.value = next } 
         }
      }, 200)
         
      return { prev: prev, next: next }
   })

   const swipeItems = computed(() => {
      const swipeTop = { ...currItem.value, isTop: true }
      const swipeBot = swipeBotItem.value ? { ...swipeBotItem.value } : null
      return swipeBot ? [ swipeBot, swipeTop ] : [ swipeTop ]
   })

   const itemSwipeWidth = computed(() => Math.min(windowWidth.value, imageWidth.value))
   const itemSwipeWidthStyle = computed(() => "width:" + itemSwipeWidth.value +  "px")
   const onSwipeLeftStarted  = (itemName) => { swipeBotItem.value = navItems.value.next }
   const onSwipeRightStarted = (itemName) => { if (navItems.value.prev) { swipeBotItem.value = navItems.value.prev } }
   const onSwipeVerticalStarted = (itemName) => { 
      if (navItems.value.next)      { swipeBotItem.value = navItems.value.next  } 
      else if (navItems.value.prev) { swipeBotItem.value = navItems.value.prev  }       
   }

   const onSwipeDone = (swipeEmit, itemName) => {
      setTimeout(() => { // delay actions so swipe finishes smoothly 
         if (swipeEmit == Emit.SWIPE_LEFT) {
            prevHorSwipe.value = Emit.SWIPE_LEFT
            if (navItems.value.next) { currItemIndex.value = currItemIndex.value + 1 } 
         }
         else if (swipeEmit == Emit.SWIPE_RIGHT) {
            prevHorSwipe.value = Emit.SWIPE_RIGHT
            if (navItems.value.prev) { currItemIndex.value = currItemIndex.value - 1 } 
         }
         else if (swipeEmit == Emit.SWIPE_UP) {            
            if (userStore.userExists) { userMgr.addFavoriteItem(currItem.value.id) }
            // keep item in list
            prevHorSwipe.value = Emit.SWIPE_LEFT
            if (navItems.value.next) { currItemIndex.value = currItemIndex.value + 1 } 
         }
         else if (swipeEmit == Emit.SWIPE_DOWN) {
            if (userStore.userExists) { userMgr.removeFavoriteItem(currItem.value.id) }
            currItems.value.splice(currItemIndex.value, 1)
         }
         
      }, 300)
   }

   const galleries = computed(() => {  
      const gals = []
      for (const galleryId of currItem.value?.galleryIds) {
         const gallery = galleryStore.getGallery(galleryId)
         if (viewMgr.galleryThumbVisibleToUser(gallery)) { gals.push(gallery) }
      }
      gals.sort(function(a, b){return a.name.localeCompare(b.name)}) 
      return gals
   })

</script>

<style>
.itemSwipe {
   position: absolute;
   max-width: 95%;
}
</style>
