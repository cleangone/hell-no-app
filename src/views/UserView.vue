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
   <!-- <v-container v-if="viewMgr.isDeskTop" class="pa-0 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="2" class="flex-grow-0 flex-shrink-0"/>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div class="title">{{ displayName }} </div>
         </v-col>
         <v-col cols="2" class="mr-n2 d-flex flex-grow-0 flex-shrink-0 justify-end">
            <div v-if="isLoggedInUser">  
               <RouterLink v-if="invisibleItemsExist" :to="Route.INVISIBLE.url">
                  <v-icon icon="mdi-incognito" class="mr-2"/>
               </RouterLink>
            </div>
            <EmailButton v-else-if="userExists" :user="user"/>
         </v-col>
      </v-row>
   </v-container> -->
      <div v-if="!contentExists">
         <div class="pt-10 pb=5 text-h5">No Content</div>
         <div>Add Items and Galleries in <RouterLink :to="Route.ACCOUNT.url">My Account</RouterLink></div>
      </div>
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
            :maxRows="galleryRows" :toRouteId="route.params.id"  bypassShowUser class="mt-10 mb-5"/>

         <MyGroupThumbs v-if="route.params.id == userStore.userId"/>

         <!-- recent updated, viewed -->
         <div v-if="viewMgr.isXs">
            <div class="mx-2 mb-10 bg-shade">
               <ItemThumbsPanel title="Recent Updates" :items="recentUpdatedItems" 
                  :linkTo="Route.RECENT.url + route.params.id"/>
            </div>
            <div class="mx-2 bg-shade">
               <ItemThumbsPanel title="Recent Viewed" :items="recentViewedItems" 
                  :linkTo="Route.VIEWED.url + route.params.id" showDateViewed/>
            </div>
         </div>
         <v-row v-else class="mr-5">
            <v-col cols="6">
               <ItemThumbsPanel title="Recent Updates" :items="recentUpdatedItems" 
                  :linkTo="Route.RECENT.url + route.params.id" class="bg-shade border-md fill-height"/>
            </v-col>
            <v-col cols="6" class="">
               <ItemThumbsPanel title="Recent Viewed" :items="recentViewedItems" 
                  :linkTo="Route.VIEWED.url + route.params.id" showDateViewed class="bg-shade border-md fill-height"/>
            </v-col>
         </v-row>
      </div>
   </ion-content>
</ion-page>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useSeoMeta } from '@unhead/vue'
   import { useRoute }   from 'vue-router'
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
   
   const route        = useRoute()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const itemMgr      = useItemMgr()
   const wallStore    = useWallStore()
   const wallMgr      = useWallMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const cacheStore   = useCacheStore()
   
   useSeoMeta({
      title: "Hell-No User"
   })

   const user           = computed(() => userStore.getUser(route.params.id))
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
      return toSortedDateContentModifiedDesc(galleries)
   })

   const recentItems = computed(() => itemMgr.getRecentPublicItems(userId.value).filter(item => !itemMgr.isInvisible(item)))
   const displayWall = computed(() => {
      const wall = { ...wallStore.getUserWall(userId.value) }
      wall.origWallRows = wall.wallRows // hack 
      if (viewMgr.isXs && wall.wallRows) { wall.wallRows = 1 }
      else if (!viewMgr.isXs) { wall.wallRows = wall.origWallRows }

      const ungroupedItems = viewMgr.isXs ? itemMgr.ungroupItems(recentItems.value) : recentItems.value
      return wallMgr.fillWall(wall, ungroupedItems)
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
      const items = [ ...recentItems.value ]
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupItems(items) : [...items]
      viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates",  Route.RECENT.url + route.params.id, ungroupedItems)
   
      if (items.length > 10) { items.length = 10 }
      return items
   })

   const recentViewedItems = computed(() => {
      let items = [ ...cacheStore.recentViewedPublicItems ]   
      items = items.filter(item => isOwned(item, userId.value)) 
            
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : [...items]
      viewStore.setVisibleItems(ItemOrigin.VIEWED, "Recent Viewed", Route.VIEWED.url + route.params.id, ungroupedItems)
      
      if (items.length > 10) { items.length = 10 }
      return items
   })
</script>

<style>
</style>
