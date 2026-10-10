<template>
<ion-page>
   <ion-content> 
      <!-- header -->
      <div class="scrolling-header-container">
         <ion-toolbar class="custom-scrolling-toolbar">
            <ion-buttons slot="start"><BackButton/></ion-buttons>
            <ion-title class="text-center text-h6">{{ displayName }}</ion-title>
            <ion-buttons slot="end">
               <div v-if="isLoggedInUser">  
                  <!-- todo - use ion router logic in GalleryThumb -->
                  <RouterLink v-if="invisibleItemsExist" :to="Route.INVISIBLE.url">
                     <v-icon icon="mdi-incognito" class="mr-2"/>
                  </RouterLink>
               </div>
               <EmailButton v-else-if="userExists" :user="user"/>
            </ion-buttons>
         </ion-toolbar>
      </div>
      <!-- <div v-if="!contentExists">
         <div class="pt-10 pb=5 text-h5">No Content</div>
         <div>Add Items and Galleries in <RouterLink :to="Route.ACCOUNT.url">My Account</RouterLink></div>
      </div> -->

      <!-- wall -->
      <div v-if="wallItemsExist" class="walldiv" :style="wallDivStyle">
         <v-img :src="wallImage" cover :style="wallBackgroundStyle" class="wall-background"></v-img>
         <div class="wall-content">
            <SplitWall :wall="displayWall" :rowHeight="slideRowHeight" :linkUrl="userLinkUrl"/>
         </div> 
         <Avatar v-if="viewMgr.isDeskTop" :user="user" :size="75" class="wall-content ml-2 mt-n7 pa-1 bg-black"/>
      </div>
      <div class="center">
         <!-- galleries -->
         <RecentGalleryThumbs v-if="visibleGalleries.length" :galleries="visibleGalleries" 
            :maxRows="galleryRows" :toRouteId="props.id"  bypassShowUser class="mt-10 mb-5"/>

         <!-- <MyGroupThumbs v-if="props.id == userStore.userId"/> -->

         <!-- recent updated, viewed -->
         <div v-if="viewMgr.isXs">
            <div class="mx-2 mb-10 bg-shade">
               <ItemThumbsPanel title="Recent Updates" :items="recentUpdatedItems" 
                  :linkTo="Route.RECENT.url + props.id"/>
            </div>
            <div class="mx-2 bg-shade">
               <ItemThumbsPanel title="Recent Viewed" :items="recentViewedItems" 
                  :linkTo="Route.VIEWED.url + props.id" showDateViewed/>
            </div>
         </div>
         <v-row v-else class="mr-5">
            <v-col cols="6">
               <ItemThumbsPanel title="Recent Updates" :items="recentUpdatedItems" 
                  :linkTo="Route.RECENT.url + props.id" class="bg-shade border-md fill-height"/>
            </v-col>
            <v-col cols="6" class="">
               <ItemThumbsPanel title="Recent Viewed" :items="recentViewedItems" 
                  :linkTo="Route.VIEWED.url + props.id" showDateViewed class="bg-shade border-md fill-height"/>
            </v-col>
         </v-row>
      </div>
   </ion-content>
</ion-page>
</template>

<script setup>
   import { computed, ref, watch } from 'vue'
   import { onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useWallStore }    from '@/stores/wallStore'
   import { useWallMgr }      from '@/stores/wallMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { useCacheStore }   from '@/stores/cacheStore'  
   import RecentGalleryThumbs from '@/components/gallery/thumb/RecentGalleryThumbs.vue'
   import MyGroupThumbs       from '@/components/group/thumb/MyGroupThumbs.vue'
   import ItemThumbsPanel     from '@/components/item/thumb/ItemThumbsPanel.vue'
   import Avatar              from '@/components/user/avatar/Avatar.vue'
   import SplitWall           from '@/components/wall/SplitWall.vue'
   import EmailButton         from '@/components/email/EmailButton.vue'
   import { isOwned, randomizeArray, toSortedDateContentModifiedDesc } from '@/utils/utils'
   import { ItemOrigin, Route, WallRowHeight } from '@/utils/constants'
   
   const WALL_BCKGND_OPACITY = .15
   
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const itemMgr      = useItemMgr()
   const wallStore    = useWallStore()
   const wallMgr      = useWallMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const cacheStore   = useCacheStore()
   const isPageActive = ref(false)

   onIonViewWillEnter(() => {
      console.log("userView onIonViewWillEnter")
      isPageActive.value = true
   })
   onIonViewWillLeave(() => {
      console.log("userView onIonViewWillLeave")
      isPageActive.value = false
   })
   
   const props = defineProps({ id: String })
   watch(() => props.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
         console.log("User ID changed on active view:", newId)
         isPageActive.value = true
      }
   }, { immediate: true })

   const user           = computed(() => userStore.getUser(props.id))
   const userExists     = computed(() => user.value ? true : false )
   const userId         = computed(() => user.value ? user.value.id : null )
   const isLoggedInUser = computed(() => userId.value && userId.value == userStore.userId)
   const userLinkUrl    = computed(() => Route.USER.url + userId.value)
   const displayName    = computed(() => user.value ? (user.value.displayName ?? user.value.username) : "")
   const contentExists  = computed(() => wallItemsExist.value || visibleGalleries.value.length || recentItems.value.length) 
   const invisibleItemsExist = computed(() => itemMgr.myInvisibleItems.length) 

   const visibleGalleries = computed(() => { 
      const galleries = []     
      for (const gallery of galleryStore.getPublicGalleries(userId.value) ) {
         if (gallery.images.length && !gallery.parentGalleryId && viewMgr.galleryIsVisibleToUser(gallery)) { galleries.push(gallery) }
      }    
      console.log("sorting visibleGalleries")
      return toSortedDateContentModifiedDesc(galleries)
   })

   const recentItems = computed(() => {
      console.log("user recentItems")
      return itemMgr.getRecentPublicItems(userId.value).filter(item => !itemMgr.isInvisible(item))
   })

   const userWall = computed(() => {
      console.log("user userWall")
      return wallStore.getUserWall(userId.value)
   })
   
   const displayWall = computed(() => {
      console.log("user displayWall")
      const tempWall = userWall.value // No spread operator
      if (!tempWall) { return DefaultWall }
      
      const wall = { ...tempWall }
      wall.origWallRows = wall.wallRows // hack 
      if (viewMgr.isXs && wall.wallRows) { wall.wallRows = 1 }
      else if (!viewMgr.isXs) { wall.wallRows = wall.origWallRows } // handles switch back 

      // const ungroupedItems = viewMgr.isXs ? itemMgr.ungroupItems(recentItems.value) : recentItems.value
      // return wallMgr.fillWall(wall, ungroupedItems)
      return wallMgr.fillWall(wall, recentItems.value)
   })

   const wallItemsExist = computed(() => displayWall.value?.wallItems.length ? true : false)
   const slideRowHeight = computed(() => viewMgr.isMobile ? WallRowHeight.XS : WallRowHeight.DEFAULT)
   const wallRows       = computed(() => displayWall.value ? displayWall.value.wallRows : 2 )
   const wallDivStyle   = computed(() => "height:" + (((slideRowHeight.value + 10) * wallRows.value)) + "px;")
   const wallBackgroundStyle = computed(() => wallDivStyle.value + " opacity:" + WALL_BCKGND_OPACITY + ";")
   const galleryRows    = computed(() => viewMgr.isXs ? 1 : 2)
   
   const wallImage = computed(() => {
      const urls = itemMgr.getPublicGalleryThumbUrls(userId.value)
      return urls.length ? randomizeArray(urls)[0] : wallMgr.randomWallImage
   })

   const recentUpdatedItems = computed(() => {
      console.log("user recentUpdatedItems", props.id)
      if (!isPageActive.value) {
         console.log("page inactive", props.id)
         return []
      }

      const items = [ ...recentItems.value ]
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupItems(items) : [...items]
      viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates",  Route.RECENT.url + props.id, ungroupedItems)
   
      return items.length > 10 ? items.slice(0, 10) : items

      // if (items.length > 10) { items.length = 10 }
      // return items
   })


   // watch([isPageActive, recentItems], ([active, items]) => {
   //    if (!active || !items.length)  { return }

   //    console.log("watch recentItems")
      
   //    const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupItems(items) : [...items]
   //    viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates", Route.RECENT.url + props.id, ungroupedItems)
   // }, { immediate: true })


   const recentViewedItems = computed(() => {
      console.log("user recentViewedItems", props.id)
      if (!isPageActive.value) {
         console.log("page inactive", props.id)
         return []
      }

      let items = [ ...itemMgr.recentViewedPublicItems ]   
      // let items = [ ...cacheStore.recentViewedPublicItems ]   
      items = items.filter(item => isOwned(item, userId.value))      
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : [...items]
      viewStore.setVisibleItems(ItemOrigin.VIEWED, "Recent Viewed", Route.VIEWED.url + props.id, ungroupedItems)
      
      return items.length > 10 ? items.slice(0, 10) : items

      // if (items.length > 10) { items.length = 10 }
      // return items
   })  
</script>

<style>
</style>
