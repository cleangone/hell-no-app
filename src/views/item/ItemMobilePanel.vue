<template>
   <div> <!-- origin page and galleries -->
      <span style="text-align:center">
         <div v-if="showNav"> <!-- origin page and gallery if there is only one -->
            <RouterLink v-if="viewStoreVisibleItems" :to="viewStoreVisibleItems.linkUrl" :class="singleOtherGallery ? 'font-weight-bold' : ''">
               {{ viewStoreVisibleItems.linkName }}
            </RouterLink> 
            <span v-if="singleOtherGallery">
               | <RouterLink :to="galleryUrl(otherGalleries[0].id)">{{ otherGalleries[0].name }} Gallery</RouterLink>
            </span>
         </div>
         <div v-if="!showNav || multipleOtherGalleries"> <!-- row of galleries -->
            <span v-for="gallery,index in otherGalleries" :key="gallery.id">
               <span v-if="index"> | </span>
               <RouterLink :to="galleryUrl(gallery.id)">{{ gallery.name }} Gallery</RouterLink>
            </span>
         </div>
      </span>
   </div>
   <div v-if="showPrevNext"> <!-- prev/next -->
      <v-row class="align-center justify-center flex-nowrap my-1" >
         <v-col cols="6" class="d-flex flex-grow-1 flex-shrink-0 justify-end align-center px-0">
            <RouterLink v-if="navItems.prev" :to="prevItemUrl">{{ navItems.prev.name }}</RouterLink>  
         </v-col>
         <v-col v-if="navItems.prev || navItems.next" class="d-flex flex-grow-0 flex-shrink-0 justify-center text-no-wrap">|</v-col>
         <v-col cols="6" class="d-flex flex-grow-1 flex-shrink-0 justify-start align-center px-0">
            <RouterLink v-if="navItems.next" :to="nextItemUrl">{{ navItems.next.name }}</RouterLink> 
         </v-col>
      </v-row>
   </div>
   <div style="position:relative" class="w-100" ref="imageDivRef">  
      <div v-if="viewStore.isMobileSwipe"> <!-- swipe -->
         <div ref="swipeElement" class="center d-flex justify-center">  
            <ItemSwipe v-for="item in swipeItems" :key="item.id" :item="item" v-on:done="onSwipeDone"
               :canSwipeLeft="navItems.next!=null" :canSwipeRight="navItems.prev!=null"
               v-on:swipeLeft="onSwipeLeftStarted" v-on:swipeRight="onSwipeRightStarted" 
               class="itemSwipe" :style="itemSwipeWidthStyle"/>
         </div>
      </div>
         <!-- <v-infinite-scroll :items="scrollItems" :onLoad="loadItems">
            <template v-for="item in scrollItems" :key="item.id">
               <div v-if="item.id != route.params.id" class="mt-5">
                  <div class="text-h6">{{ item.name }}</div>
                  <div v-if="itemOtherGalleries(item).length"> 
                     <span v-for="gallery,index in itemOtherGalleries(item)" :key="gallery.id">
                        <span v-if="index"> | </span>
                        <RouterLink :to="galleryUrl(gallery.id)">{{ gallery.name }} Gallery</RouterLink>
                     </span>
                  </div>
               </div>
               <v-img :src="imageUrl(item.primaryImage)" contain class="no-pointer-events"/>
               <div class="text-left mt-2">
                  <ItemArtistYear :item="item"/>
               </div>
            </template>
            <template v-slot:empty></template>
         </v-infinite-scroll> -->

      <div v-else> <!-- infinite scroll -->
         <v-img :src="imageUrl(props.item.primaryImage)" contain class="no-pointer-events" />
         <div class="text-left mt-2">
            <ItemArtistYear :item="props.item" />
         </div>
         <template v-for="item in scrollItems" :key="item.id">
            <div v-if="item.id != route.params.id" class="mt-5">
               <div class="text-h6">{{ item.name }}</div>
               <div v-if="itemOtherGalleries(item).length"> 
                  <span v-for="(gallery, index) in itemOtherGalleries(item)" :key="gallery.id">
                  <span v-if="index"> | </span>
                  <RouterLink :to="galleryUrl(gallery.id)">{{ gallery.name }} Gallery</RouterLink>
                  </span>
               </div>
            </div>
            <v-img :src="imageUrl(item.primaryImage)" contain class="no-pointer-events"/>
            <div class="text-left mt-2">
               <ItemArtistYear :item="item"/>
            </div>
         </template>
         <ion-infinite-scroll @ionInfinite="loadItems">
            <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Loading...">
            </ion-infinite-scroll-content>
         </ion-infinite-scroll>
      </div>
   </div>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useRoute, useRouter } from 'vue-router'
   import { useWindowSize } from '@vueuse/core'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import ItemArtistYear      from '@/components/item/ItemArtistYear.vue'
   import ItemSwipe           from '@/components/item/ItemSwipe.vue'
   import { Emit, ItemNavAction, ItemOrigin, Route } from '@/utils/constants'

   const props = defineProps({ item: Object, origin: String, nav: String })
  
   const route  = useRoute()
   const router = useRouter()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const galleryStore = useGalleryStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const showNav = ref(false)
   const swipeBotItem = ref(null)
   const { width: windowWidth } = useWindowSize()
   
   onMounted(async() => {
      console.log("onMounted - origin", props.origin)
      if (viewStore.isInitialized && props.origin != ItemOrigin.EXTERNAL) { showNav.value = true }
      initializeScrollItems()
   })

   const originGalleryId = computed(() => {  
      return props.origin == ItemOrigin.GALLERY ? viewStoreVisibleItems.value?.linkId : null      
   })

   const singleOtherGallery     = computed(() => otherGalleries.value.length == 1)
   const multipleOtherGalleries = computed(() => otherGalleries.value.length > 1)
   const otherGalleries = computed(() => {  
      const galleries = []
      if (props.item?.galleryIds) { 
         for (const galleryId of props.item.galleryIds) {
            const gallery = galleryStore.getGallery(galleryId)
            if (gallery.id != originGalleryId.value && viewMgr.galleryThumbVisibleToUser(gallery)) { galleries.push(gallery) }
         }
      }
      galleries.sort(function(a, b){return a.name.localeCompare(b.name)}) 
      return galleries
   })

   const itemIdToOtherGalleries = new Map()
   const itemOtherGalleries = (item) => {
      if (itemIdToOtherGalleries.has(item.id)) { return itemIdToOtherGalleries.get(item.id) }
 
      let galleryIds = item.galleryIds
      if (!galleryIds) {
         // workaround for wall items
         // console.log("Retrieving " + item.name + " galleries")
         const fullItem = itemStore.getItem(item.id)
         galleryIds = fullItem ? fullItem.galleryIds : []
      }

      const galleries = []
      for (const galleryId of galleryIds) {
         const gallery = galleryStore.getGallery(galleryId)
         if (gallery.id != originGalleryId.value && viewMgr.galleryIsVisibleToUser(gallery)) { galleries.push(gallery) }
      }
      galleries.sort(function(a, b){return a.name.localeCompare(b.name)}) 
      itemIdToOtherGalleries.set(item.id, galleries)
      
      return galleries
   }

   // do not show prev/next for infinite scroll
   const showPrevNext = computed(() => viewStore.isMobileSwipe ? showNav.value : false)
   
   const viewStoreVisibleItems = computed(() => showNav.value ? viewStore.getVisibleItems(props.origin) : null)
   // const viewStoreItems = computed(() => viewStoreVisibleItems.value ? viewStoreVisibleItems.value.items : [])
   
   const viewStoreItems = computed(() => {
      console.log("viewStoreItems - viewStoreVisibleItems", viewStoreVisibleItems.value)
      return viewStoreVisibleItems.value ? viewStoreVisibleItems.value.items : []
   })
   
   const prevItemUrl = computed(() => itemMgr.itemNavURL(linkId(navItems.value.prev), props.origin, ItemNavAction.PREV, navItems.value.prev.childNum))
   const nextItemUrl = computed(() => itemMgr.itemNavURL(linkId(navItems.value.next), props.origin, ItemNavAction.NEXT, navItems.value.next.childNum))
   const linkId      = (item)      => { return item.linkId ? item.linkId : item.id }
   const galleryUrl  = (galleryId) => { return Route.GALLERY.url + galleryId }
   const imageUrl    = (image)     => { return itemMgr.mobileImageUrl(image) }

   const navItems = computed(() => { 
      for (let i=0; i<viewStoreItems.value.length; i++) {
         const viewStoreItem = viewStoreItems.value[i]
         if (viewStoreItem.id == route.params.id)
         {
            let prev = i > 0 ? viewStoreItems.value[i-1] : null
            let next = i < viewStoreItems.value.length - 1 ? viewStoreItems.value[i+1] : null
         
            // preload next image (prev probably already been displayed)
            if (next) { viewStore.loadImage(next.primaryImage.url) } 
            
            // preload predicted bottom image, which will be gradually revealed during swipe
            // if at either end, preload the only possible direction to swipe/arrow 
            // in middle, user swiping or arrowing in a direction will prob continue that way 
            // if prediction wrong, correct bottom will be set at beginning of swipe
            setTimeout(() => { // delay prevents flash of top image
               if (prev || next) {
                  if (prev == null) {  swipeBotItem.value = next } 
                  else if (next == null) {  swipeBotItem.value = prev } 
                  else if (props.nav == ItemNavAction.PREV) { swipeBotItem.value = prev } 
                  else { swipeBotItem.value = next } 
               }
            }, 500)
         
            return { prev: prev, next: next }
         } 
      }
      return { }
   })
   
   // --- Infinite Scroll ------------------------------------------------------------------ 
   const scrollItems = ref([])
   const scrollEndIndex = ref(0)
   
   const setScrollEndIndex = (startIndex) => { scrollEndIndex.value = viewStoreItems.value.length > startIndex + 2 ? startIndex + 2 : viewStoreItems.value.length } 
   const initializeScrollItems = () => { 
      console.log("initializeScrollItems")
      scrollItems.value.push(...getNewScrollItems(getScrollStartIndex())) }
   const getScrollStartIndex = () => { 
      if (viewStoreItems.value) { 
         for (var i=0; i<viewStoreItems.value.length; i++) { 
            const viewItem = viewStoreItems.value[i]
            if (route.params.id == viewItem.id) { return i + 1 } // scroll starts after props item
         }
      }
      return 0
   }
   const getNewScrollItems = (startIndex) => { 
      console.log("getNewScrollItems", startIndex)
      const newScrollItems = []
      // if (startIndex) {
      console.log("viewStoreItems length", viewStoreItems.value?.length ?? "null")
      
      if (startIndex >= 0 && viewStoreItems.value) {
         setScrollEndIndex(startIndex)
         for (var i=startIndex; i<scrollEndIndex.value; i++) { 
            const newScrollItem = viewStoreItems.value[i]
            if (newScrollItem) {
               newScrollItems.push(newScrollItem)
               viewStore.loadImage(newScrollItem.primaryImage.url) 
            }
         }
      }
      return newScrollItems
   }
   async function getNextScrollItems() {
      return new Promise(resolve => {
         setTimeout(() => { resolve(getNewScrollItems(scrollEndIndex.value)) }, 1000)
      })
   }
   async function loadItems(event) {
      console.log("loadItems")
      const nextScrollItems = await getNextScrollItems()
      if (nextScrollItems.length) {
         scrollItems.value.push(...nextScrollItems)
      }
   
      event.target.complete() // signal to ionic
      if (scrollEndIndex.value >= viewStoreItems.value.length) { event.target.disabled = true }
   }

   // --- Swipe ----------------------------------------------------------------- 
   const swipeItems = computed(() => {
      const swipeTop = { ...props.item, isTop: true }
      const swipeBot = swipeBotItem.value ? { ...swipeBotItem.value } : null
      return swipeBot ? [ swipeBot, swipeTop ] : [ swipeTop ]
   })

   const imageWidth = computed(() => { return props.item.primaryImage?.dimensions?.width ?? 500 })
   const itemSwipeWidth = computed(() => Math.min(windowWidth.value, imageWidth.value))
   const itemSwipeWidthStyle = computed(() => "width:" + itemSwipeWidth.value +  "px")
   const onSwipeLeftStarted  = (itemName) => { swipeBotItem.value = navItems.value.next }
   const onSwipeRightStarted = (itemName) => { swipeBotItem.value = navItems.value.prev }
   const onSwipeDone = (swipeEmit, itemName) => {
      setTimeout(() => { // delay actions so swipe finishes smoothly 
         if (swipeEmit == Emit.SWIPE_LEFT) {
            if (navItems.value.next) { router.push(nextItemUrl.value) } 
         }
         else if (swipeEmit == Emit.SWIPE_RIGHT) {
            if (navItems.value.prev) { router.push(prevItemUrl.value) } 
         }
      }, 300)
   }
</script>

<style>
.itemSwipe {
   position: absolute;
   max-width: 95%;
}
.no-pointer-events {
   pointer-events: none;
}

</style>
