<template>
<ion-page>
   <ion-content :fullscreen="true">
      <!-- header -->
      <div class="scrolling-header-container">
         <ion-toolbar class="custom-scrolling-toolbar">
            <ion-buttons slot="start">
               <nav>
                  <v-menu>
                     <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-menu" class="icon-btn" size="medium" variant="text"></v-btn>
                     </template>
                     <v-list>
                        <!-- <v-list-item @click="toggleSoloMode()">
                           <template v-slot:prepend>
                              <v-icon :icon="viewMgr.solo?'mdi-account-multiple': 'mdi-account'" class="menu-icon"></v-icon>
                           </template>
                           <v-list-item-title>{{ viewMgr.solo ? "Exit " : "" }}Solo Mode</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="user" @click="toRoute(Route.ADD_ITEM)">
                           <template v-slot:prepend>
                              <v-icon icon="mdi-plus" class="menu-icon"></v-icon>
                           </template>
                           <v-list-item-title>Add Item</v-list-item-title>
                        </v-list-item> -->
                        <v-list-item v-if="user" @click="toRoute(Route.MESSAGE)">
                           <template v-slot:prepend>
                              <v-icon icon="mdi-message" class="menu-icon"></v-icon>
                           </template>
                           <v-list-item-title>Messages</v-list-item-title>
                        </v-list-item>
                     </v-list>
                  </v-menu>
               </nav>
            </ion-buttons>
            <ion-title class="text-center text-h6">{{ title }}</ion-title>
            <ion-buttons slot="end">
               <nav>
                  <!-- <Icon icon="mdi-dice-multiple" @click="toRoute(Route.RANDOM)"/> -->
                  <!-- <ShakeIcon v-if="activeNotificationsExist" icon="mdi-bell-ring" size="small" @click="toRoute(Route.MESSAGE)" class="mr-n1"/> -->
                  <DarkButton class="mr-n2"/>
               </nav>
            </ion-buttons>
         </ion-toolbar>
      </div>
      <!-- content -->
       <v-container class="pa-0 mb-2 width-100">
         <!-- <div v-if="viewMgr.solo" class="text-subtitle-1 mt-n2 mb-2">Solo Mode</div> -->
         <!-- <ShowNotifications v-if="invites.length" :notifications="invites" class="mb-3"/> -->
         <div class="walldiv" :style="wallDivStyle">
            <v-img :src="wallImage" cover :style="wallBackgroundStyle" class="wall-background"></v-img>
            <div class="wall-content">
               <SplitWall v-if="showWall" :wall="displayWall" :rowHeight="slideRowHeight"/>
            </div> 
         </div>
      </v-container>

      <div class="center">
         <!-- galleries -->
         <RecentGalleryThumbs v-if="recentGalleries.length" :galleries="recentGalleries" 
            :maxRows="recentRows" bypassShowUser class="mb-5"/>

         <!-- groups if user logged in and not solo -->
         <!-- <MyGroupThumbs v-if="!viewMgr.solo"/> -->

         <!-- recent updated, viewed -->
         <div v-if="viewMgr.isXs">
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
                  :linkTo="Route.RECENT.url + Defaults.SITE_ID" class="bg-shade border-md "/>
                  <!-- fill-height -->
            </v-col>
            <v-col cols="6" class="">
               <ItemThumbsPanel title="Recent Viewed" :items="recentViewedItems" 
                  :linkTo="Route.VIEWED.url + Defaults.SITE_ID" showDateViewed class="bg-shade border-md"/>
            </v-col>
         </v-row>
      </div>
   </ion-content>  
</ion-page>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   // import { useElementSize } from '@vueuse/core'
   import { useRoute } from 'vue-router'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useInviteStore }  from '@/stores/inviteStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useWallMgr }      from '@/stores/wallMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { useCacheStore }   from '@/stores/cacheStore'
   import { useLocalStore }   from '@/stores/localStore'
   import ItemThumbsPanel     from '@/components/item/thumb/ItemThumbsPanel.vue'
   import RecentGalleryThumbs from '@/components/gallery/thumb/RecentGalleryThumbs.vue'
   import MyGroupThumbs       from '@/components/group/thumb/MyGroupThumbs.vue'
   import SplitWall           from '@/components/wall/SplitWall.vue'
   import DarkButton          from '@/components/util/DarkButton.vue'
   import ShowNotifications   from '@/components/notification/ShowNotifications.vue'
   import { timestampsEqual } from '@/utils/dateUtils'
   import { isOwned, randomizeArray, toSortedDateContentModifiedDesc } from '@/utils/utils'
   import { Defaults, ItemOrigin, Route, TodoType, WallRowHeight } from '@/utils/constants'
   
   const route        = useRoute()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const inviteStore  = useInviteStore()
   const itemMgr      = useItemMgr()
   const wallMgr      = useWallMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const cacheStore   = useCacheStore()
   const localStore   = useLocalStore()
   // const favoritesRef = ref(null)
   // const { width: favoritesWidth } = useElementSize(favoritesRef)
   const currSiteWall = ref(null)
   const currMyWall   = ref(null)
   const wallBackgroundOpacity = ref(.1) 
   
   onMounted(() => {
      // console.log("Home")
      viewMgr.init()
      if (!viewStore.showSiteWall) {
         wallBackgroundOpacity.value = 1.0
         setTimeout(() => { 
            viewStore.setShowSiteWall(true) 
            fadeWallBackground()
         }, 1000)  
      }
   })

   const isPageActive = computed(() => route.name == Route.HOME.name)
   const user  = computed(() => userStore.user ?? null)
   const title = computed(() => viewMgr.solo && user.value ? 
                                 (user.value.displayName ?? user.value.username) : "Hell-No Gallery")

   // const seconds = () => { return " (" + viewStore.getSeconds() + " seconds)" }
   const showWall = computed(() => viewStore.showSiteWall) // allows for image fade out
   const fadeWallBackground = () => {
      if (wallBackgroundOpacity.value > .10) { 
         wallBackgroundOpacity.value -= .04
         setTimeout(() => { fadeWallBackground() }, 50)  
      }
   }

   // const invites = computed(() => {
   //    // console.log("notifications", inviteStore.myActiveInvites)
   //    const todos = []
   //    for (const invite of inviteStore.myActiveInvites) {
   //       todos.push({ type: TodoType.INVITE, invite: invite })
   //    }  
   //    // console.log("notifications", todos)
   //    return todos
   // })

   const wallImage = computed(() => {
      if (viewMgr.solo && userStore.userId) {
         const urls = itemMgr.getPublicGalleryThumbUrls(userStore.userId)
         if (urls.length) { return randomizeArray(urls)[0] }
      }
      return  wallMgr.randomWallImage
   })

   const displayWall = computed(() => {
      const wall = viewMgr.solo ? myDisplayWall.value : siteDisplayWall.value

      // todo - move this to mgr - logic duplicated in UserView
      // handle corner case of moving to/from mobile view
      // check xs instead of mobile - tablets not limited to 1 row
      if (viewMgr.isXs && wall.wallRows) { wall.wallRows = 1 }
      else if (!viewMgr.isXs) { wall.wallRows = wall.origWallRows}

      return wall
   })

   const siteDisplayWall = computed(() => {
      let wall = wallMgr.filledSiteWall
      if (wall.wallRows) { localStore.setSiteWall(wall) }
      else if (localStore.siteWall.wallRows) { wall = { ...localStore.siteWall } }

      // use currWall if it exists - prevent flashing of retrieved after display of one from local store
      if (currSiteWall.value) { return currSiteWall.value }
      if (wall.wallRows) { currSiteWall.value = wall }
      return wall
   })

   // handle corner case of solo mode and switching to a user that doesn't have any wall items yet
   const myDisplayWall = computed(() => {
      let wall = wallMgr.filledMyWall
      if (wall.wallRows) { localStore.setMyWall(wall) }
      else if (localStore.myWall.wallRows && localStore.myWall.id == wall.id) { wall = { ...localStore.myWall } }

      if (currMyWall.value && currMyWall.value.id == wall.id) { return currMyWall.value }
      if (wall.wallRows) { currMyWall.value = wall }
      return wall
   })
   
   const slideRowHeight = computed(() => viewMgr.isMobile ? WallRowHeight.XS : WallRowHeight.DEFAULT)
   const wallRows       = computed(() => displayWall.value ? displayWall.value.wallRows : 2 )
   const wallDivStyle   = computed(() => "height:" + (((slideRowHeight.value + 10) * wallRows.value)) + "px;")
   const wallBackgroundStyle = computed(() => wallDivStyle.value + " opacity:" + wallBackgroundOpacity.value + ";")
   
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
   
   const recentUpdatedItems = computed(() => {
      console.log("home recentUpdatedItems")
      if (!isPageActive.value) {
         console.log("home inactive")
         return []
      }

      let items = viewMgr.solo ? [ ...itemMgr.myRecentItems ] : [ ...cacheStore.recentPublicItems ]
      items = items.filter(item => !itemMgr.isInvisible(item))

      if (items.length) { 
         items.sort(function(a, b){return b.dateContentModified - a.dateContentModified}) 
         // localStore.setRecentItems(items) 
      }
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : [...items]
      viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates", Route.RECENT.url + Defaults.SITE_ID, ungroupedItems)
      
      if (items.length > 10) { items.length = 10 }
      return items
   })

   const recentViewedItems = computed(() => {
      console.log("home recentViewedItems")
      if (!isPageActive.value) {
         console.log("home inactive")
         return []
      }

      let items = [ ...cacheStore.recentViewedPublicItems ]   
      if (viewMgr.solo) { items = items.filter(item => isOwned(item, userStore.userId)) }
            
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : [...items]
      viewStore.setVisibleItems(ItemOrigin.VIEWED, "Recent Viewed", Route.VIEWED.url + Defaults.SITE_ID, ungroupedItems)
      
      if (items.length > 10) { items.length = 10 }
      return items
   })

   const recentRows = computed(() => viewMgr.isXs ? 1 : 2)
</script>

<style>

ion-content {
  --padding-top: 0px !important;
  --padding-bottom: 0px !important;
  --padding-start: 0px !important;
  --padding-end: 0px !important;
}

.scrolling-header-container {
  display: block;
  width: 100%;
  position: relative;
  z-index: 10;
  background-color: var(--v-theme-surface, #ffffff);
  padding-top: env(safe-area-inset-top, 0px);
}
.custom-scrolling-toolbar {
  --background: transparent;
  position: relative !important;
}

.center { 
   text-align: center; 
}
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
