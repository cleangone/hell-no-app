<template>
   <ion-page>
   <!-- title if not mobile - mobile title in app -->
   <v-container v-if="!viewMgr.isMobile" class="pa-0 mt-2 mb-1 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="1" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <span class="title">{{ title }}</span>
         </v-col>
         <v-col cols="1" class="flex-grow-0 flex-shrink-0 d-flex justify-end">
            <DarkButton class="mr-n2"/>
         </v-col>
      </v-row>
   </v-container>
   <!-- greeting, notifications, wall -->
   <!-- <v-container class="pa-0 mb-2 width-100"> -->
      <!-- <div v-if="viewMgr.solo" class="text-subtitle-1 mt-n2 mb-2">Solo Mode</div> -->
      <!-- <ShowNotifications v-if="invites.length" :notifications="invites" class="mb-3"/> -->
      <!-- <div class="walldiv" :style="wallDivStyle">
         <v-img :src="wallImage" cover :style="wallBackgroundStyle" class="wall-background"></v-img>
         <div class="wall-content">
            <SplitWall v-if="showWall" :wall="displayWall" :rowHeight="slideRowHeight"/>
         </div> 
      </div> -->
   <!-- </v-container> -->
   
   <!-- galleries -->
   <RecentGalleryThumbs v-if="recentGalleries.length" :galleries="recentGalleries" 
      :maxRows="recentRows" bypassShowUser class="mt-10 mb-5"/>

   <!-- groups if user logged in and not solo -->
   <!-- <MyGroupThumbs v-if="!viewMgr.solo"/> -->

   <!-- recent updated, viewed -->
   <!-- <div v-if="viewMgr.isXs">
      <div class="mx-2 mb-10 bg-shade">
         <ItemThumbsPanel title="Recent Updates" :items="recentUpdatedItems" 
            :linkTo="Route.RECENT.url + Defaults.SITE_ID"/>
      </div>
      <div class="mx-2 bg-shade">
         <ItemThumbsPanel title="Recent Viewed" :items="recentViewedItems" 
            :linkTo="Route.VIEWED.url + Defaults.SITE_ID" showDateViewed/>
      </div>
   </div>
   <v-row v-else class="mr-5">
      <v-col cols="6">
         <ItemThumbsPanel title="Recent Updates" :items="recentUpdatedItems" 
            :linkTo="Route.RECENT.url + Defaults.SITE_ID" class="bg-shade border-md fill-height"/>
      </v-col>
      <v-col cols="6" class="">
         <ItemThumbsPanel title="Recent Viewed" :items="recentViewedItems" 
            :linkTo="Route.VIEWED.url + Defaults.SITE_ID" showDateViewed class="bg-shade border-md fill-height"/>
      </v-col>
   </v-row> -->
   </ion-page>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   // import { useElementSize } from '@vueuse/core'
   import { useSeoMeta } from '@unhead/vue'
   import { IonPage } from '@ionic/vue'

   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   // import { useInviteStore }  from '@/stores/inviteStore'
   // import { useItemMgr }      from '@/stores/itemMgr'
   // import { useWallMgr }      from '@/stores/wallMgr'
   // import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   // import { useCacheStore }   from '@/stores/cacheStore'
   // import { useLocalStore }   from '@/stores/localStore'
   // import ItemThumbsPanel     from '@/components/item/thumb/ItemThumbsPanel.vue'
   import RecentGalleryThumbs from '@/components/gallery/thumb/RecentGalleryThumbs.vue'
   // import MyGroupThumbs       from '@/components/group/thumb/MyGroupThumbs.vue'
   // import SplitWall           from '@/components/wall/SplitWall.vue'
   import DarkButton          from '@/components/util/DarkButton.vue'
   // import ShowNotifications   from '@/components/notification/ShowNotifications.vue'
   import { timestampsEqual } from '@/utils/dateUtils'
   import { isOwned, randomizeArray, toSortedDateContentModifiedDesc } from '@/utils/utils'
   import { Defaults, ItemOrigin, Route, TodoType, WallRowHeight } from '@/utils/constants'
   
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   // const inviteStore  = useInviteStore()
   // const itemMgr      = useItemMgr()
   // const wallMgr      = useWallMgr()
   // const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   // const cacheStore   = useCacheStore()
   // const localStore   = useLocalStore()
   // const favoritesRef = ref(null)
   // const { width: favoritesWidth } = useElementSize(favoritesRef)
   // const currSiteWall = ref(null)
   // const currMyWall   = ref(null)
   // const wallBackgroundOpacity = ref(.1) 
   // const isBrowserDarkMode = ref(false)
   
   // onMounted(() => {
   //    // console.log("Home")
   //    viewMgr.init()
   //    // if (!viewStore.showSiteWall) {
   //    //    wallBackgroundOpacity.value = 1.0
   //    //    setTimeout(() => { 
   //    //       viewStore.setShowSiteWall(true) 
   //    //       fadeWallBackground()
   //    //    }, 1000)  
   //    // }

   //    console.log("calling subscribeToGalleries")
   //    galleryStore.subscribeToGalleries()

   //    // not working
   //    // isBrowserDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
   // })

onMounted(async () => {
  try {
    await galleryStore.subscribeToGalleries()
  } catch (err) {
    console.error("Initialization error:", err)
  }
})





   useSeoMeta({
      title: "Hell-No Gallery" // displayed in browser tabs
   })
   
   const user  = computed(() => userStore.user ?? null)
   const title = computed(() => viewMgr.solo && user.value ? 
                                 (user.value.displayName ?? user.value.username) : "Hell-No Gallery")

   // const seconds = () => { return " (" + viewStore.getSeconds() + " seconds)" }
   // const showWall = computed(() => viewStore.showSiteWall) // allows for image fade out
   // const fadeWallBackground = () => {
   //    if (wallBackgroundOpacity.value > .10) { 
   //       wallBackgroundOpacity.value -= .04
   //       setTimeout(() => { fadeWallBackground() }, 50)  
   //    }
   // }

   // const invites = computed(() => {
   //    // console.log("notifications", inviteStore.myActiveInvites)
   //    const todos = []
   //    for (const invite of inviteStore.myActiveInvites) {
   //       todos.push({ type: TodoType.INVITE, invite: invite })
   //    }  
   //    // console.log("notifications", todos)
   //    return todos
   // })

   // const wallImage = computed(() => {
   //    if (viewMgr.solo && userStore.userId) {
   //       const urls = itemMgr.getPublicGalleryThumbUrls(userStore.userId)
   //       if (urls.length) { return randomizeArray(urls)[0] }
   //    }
   //    return  wallMgr.randomWallImage
   // })

   // const displayWall = computed(() => {
   //    const wall = viewMgr.solo ? myDisplayWall.value : siteDisplayWall.value

   //    // todo - move this to mgr - logic duplicated in UserView
   //    // handle corner case of moving to/from mobile view
   //    // check xs instead of mobile - tablets not limited to 1 row
   //    if (viewMgr.isXs && wall.wallRows) { wall.wallRows = 1 }
   //    else if (!viewMgr.isXs) { wall.wallRows = wall.origWallRows}

   //    return wall
   // })

   // const siteDisplayWall = computed(() => {
   //    let wall = wallMgr.filledSiteWall
   //    if (wall.wallRows) { localStore.setSiteWall(wall) }
   //    else if (localStore.siteWall.wallRows) { wall = { ...localStore.siteWall } }

   //    // use currWall if it exists - prevent flashing of retrieved after display of one from local store
   //    if (currSiteWall.value) { return currSiteWall.value }
   //    if (wall.wallRows) { currSiteWall.value = wall }
   //    return wall
   // })

   // handle corner case of solo mode and switching to a user that doesn't have any wall items yet
   // const myDisplayWall = computed(() => {
   //    let wall = wallMgr.filledMyWall
   //    if (wall.wallRows) { localStore.setMyWall(wall) }
   //    else if (localStore.myWall.wallRows && localStore.myWall.id == wall.id) { wall = { ...localStore.myWall } }

   //    if (currMyWall.value && currMyWall.value.id == wall.id) { return currMyWall.value }
   //    if (wall.wallRows) { currMyWall.value = wall }
   //    return wall
   // })
   
   // const slideRowHeight = computed(() => viewMgr.isMobile ? WallRowHeight.XS : WallRowHeight.DEFAULT)
   // const wallRows       = computed(() => displayWall.value ? displayWall.value.wallRows : 2 )
   // const wallDivStyle   = computed(() => "height:" + (((slideRowHeight.value + 10) * wallRows.value)) + "px;")
   // const wallBackgroundStyle = computed(() => wallDivStyle.value + " opacity:" + wallBackgroundOpacity.value + ";")
   
   const recentGalleries = computed(() => { 
      const galleries = []     
      const allGalleries = viewMgr.solo ? galleryStore.myGalleries : galleryStore.publicGalleries
      for (const gallery of allGalleries) {
         if (gallery.images.length && showGallery(gallery)) { galleries.push(gallery) }
      }   
      return toSortedDateContentModifiedDesc(galleries)
   })

   const showGallery = (gallery)  => {
      if (!gallery.childGalleryIds.length) { return true } // not a parent
      for (const childGallery of galleryStore.publicGalleryIdToChildGalleries.get(gallery.id)) {
         if (timestampsEqual(gallery.dateContentModified, childGallery.dateContentModified)) {
            return false // parent has same dateContentModified as a child
         }
      } 
      return true // gallery is a parent with dateContentModified different than all children
   }
   
   // const recentUpdatedItems = computed(() => {
   //    let items = viewMgr.solo ? [ ...itemMgr.myRecentItems ] : [ ...cacheStore.recentPublicItems ]
   //    items = items.filter(item => !itemMgr.isInvisible(item))

   //    if (items.length) { 
   //       items.sort(function(a, b){return b.dateContentModified - a.dateContentModified}) 
   //       // localStore.setRecentItems(items) 
   //    }
   //    const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : [...items]
   //    viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates", Route.RECENT.url + Defaults.SITE_ID, ungroupedItems)
      
   //    if (items.length > 10) { items.length = 10 }
   //    return items
   // })

   // const allFavoriteItems = computed(() => {
   //    const visibleItems = []
   //    if (userStore.userExists && userStore.user.favoriteItems) {
   //       const favoriteItemIds = userStore.user.favoriteItems
   //       const items = itemMgr.getItems(favoriteItemIds)
   //       const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
   //       for (const item of ungroupedItems) { 
   //          if (viewMgr.itemIsVisibleToUser(item)) { visibleItems.push(item) }
   //       }
   //    }
   //    return viewStore.setVisibleItems(ItemOrigin.FAVORITES, "My Favorites", Route.FAVORITES.url, visibleItems)
   // })

   // const recentViewedItems = computed(() => {
   //    let items = [ ...cacheStore.recentViewedPublicItems ]   
   //    if (viewMgr.solo) { items = items.filter(item => isOwned(item, userStore.userId)) }
            
   //    const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : [...items]
   //    viewStore.setVisibleItems(ItemOrigin.VIEWED, "Recent Viewed", Route.VIEWED.url + Defaults.SITE_ID, ungroupedItems)
      
   //    if (items.length > 10) { items.length = 10 }
   //    return items
   // })

   const recentRows = computed(() => viewMgr.isXs ? 1 : 2)
   
   // const displayUsers = computed(() => {
   //    const users = []
   //    for (const user of userStore.users) {
   //       if (user.images?.length) { users.push(user) }
   //    }
   //    return users
   // })

</script>

<style>
.box-border {
   border: 5px solid; 
}
.wall-background {
   position: absolute;
   left: 0;
   top: 0;
   width: 100%;
   height: 600px;
   z-index: 1;
}
.wall-content {
   position: absolute;
   left: 0;
   top: 0;
   width: 100%;
   z-index: 2;
}
</style>
