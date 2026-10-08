<template>
   <ion-app>
   <ion-page> 
   <!-- <div class="app">   -->
   <ion-header class="ion-no-border" :translucent="false">
      <ion-toolbar>
         <ion-buttons slot="start">
            <!-- top left icon for mobile -->
            <nav>
               <v-menu v-if="isRoute(Route.HOME)">
                  <template v-slot:activator="{ props }">
                     <v-btn v-bind="props" icon="mdi-menu" class="icon-btn" size="medium" variant="text"></v-btn>
                  </template>
                  <v-list>
                     <v-list-item @click="toggleSoloMode()">
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
                     </v-list-item>
                     <v-list-item v-if="user" @click="toRoute(Route.MESSAGE)">
                        <template v-slot:prepend>
                           <v-icon icon="mdi-message" class="menu-icon"></v-icon>
                        </template>
                        <v-list-item-title>Messages</v-list-item-title>
                     </v-list-item>
                  </v-list>
               </v-menu>
               <Icon v-if="currentRouteName!=Route.HOME.name" icon="mdi-chevron-left" @click="router.back()"/>
            </nav>
         </ion-buttons>
         <!-- top center title for mobile -->
         <ion-title class="text-center">
            <div class="text-h6"> 
               <span v-if="isRoute(Route.HOME)">{{ homeTitle }}</span>
               <span v-else-if="isRoute(Route.GALLERIES)">{{ Route.GALLERIES.display }}</span>
               <span v-else-if="inRoutes(Route.GALLERY, Route.GROUP, Route.ITEM, Route.ITEM_CHILD, Route.RANDOM, Route.ARTIST)">{{ pageName }}</span>
               <span v-else-if="isRoute(Route.GROUPS)">{{ Route.GROUPS.display }}</span>
               <span v-else-if="isRoute(Route.SEARCH)">{{ Route.SEARCH.display }}</span>
               <span v-else-if="isRoute(Route.FAVORITES)">{{ Route.FAVORITES.display }}</span>
               <span v-else-if="isRoute(Route.RECENT)">{{ Route.RECENT.display }}</span>
               <span v-else-if="isRoute(Route.VIEWED)">{{ (viewStore.sortRecentViewed ? "" : "Least ") + "Recent Viewed" }}</span>
               <span v-else-if="isRoute(Route.ABOUT)">{{ Route.ABOUT.display }}</span>
               <span v-else-if="isRoute(Route.USER)">{{ username }}</span>
               <span v-else-if="isRoute(Route.MESSAGE)">{{ Route.MESSAGE.display }}</span>
               <span v-else-if="isRoute(Route.LOGIN)">{{ Route.LOGIN.display }}</span>
               <span v-else-if="isRoute(Route.ACCOUNT)" class="text-subtitle-1">{{ pageName }}</span>
               <span v-else-if="isRoute(Route.ADD_ITEM)">Add Item</span>
               <span v-else-if="isRoute(Route.EDIT_ITEM)">Edit Item</span>
            </div>
         </ion-title>
         <!-- top right icons -->
         <ion-buttons slot="end">
            <!-- top right icon for mobile -->
            <div>
               <span v-if="inRoutes(Route.HOME, Route.USER)" style="white-space: nowrap">
                  <!-- <Icon icon="mdi-dice-multiple" @click="toRoute(Route.RANDOM)"/> -->
                  <!-- <ShakeIcon v-if="activeNotificationsExist" icon="mdi-bell-ring" size="small" @click="toRoute(Route.MESSAGE)" class="mr-n1"/> -->
                  <DarkButton class="mr-n2"/>
               </span>
               <span v-else-if="isRoute(Route.GALLERIES)" class="text-no-wrap">
                  <ThumbSizeButton :thumbType="ThumbType.GALLERY"/>
                  <GalleryThumbConfig/>
               </span>
               <span v-else-if="inRoutes(Route.GALLERY, Route.GROUP, Route.RECENT, Route.SEARCH, Route.FAVORITES)" class="text-no-wrap"> 
                  <ThumbSizeButton/>
                  <ItemThumbConfig/>
               </span>
               <span v-else-if="inRoutes(Route.VIEWED)" class="text-no-wrap"> 
                  <ViewedSortButton class="mr-2"/>
                  <ThumbSizeButton/>
               </span>
               <span v-else-if="inRoutes(Route.ITEM, Route.ITEM_CHILD)">
                  <ToggleIcon icon="mdi-gesture-swipe" :state="viewStore.isMobileSwipe" @click="viewStore.toggleMobileSwipe()"/>
               </span>
               <span v-else-if="isRoute(Route.ADD_ITEM)">
                  <Icon icon="mdi-close" @click="router.back()"/>
               </span>
            </div>
         </ion-buttons>
      </ion-toolbar>
   </ion-header>

   <ion-content class="app">
      <!-- <RouterView/> -->
      <ion-router-outlet />
 
      <div v-if="isRoute(Route.HOME)" class="small">
         {{ version }}<span v-if="appEnv.length"> - {{ appEnv }}</span>
      </div>
      <div v-else-if="isRoute(Route.ABOUT)" class="small">
         <div>{{ version }} ({{ windowSize.width }} x {{ windowSize.height }})</div>
         <div>User Agent: {{ userAgent }}</div>
         <div>Max Touch Points: {{ maxTouchPoints }}</div>
         <div v-if="isStandalone">Standalone</div>
      </div>
   </ion-content>

   <!-- <v-bottom-navigation v-model="navIndex" color="primary" grow> -->
         <!-- <v-bottom-navigation v-model="navIndex" color="primary" style="min-height:60px" grow> -->
            <!-- <v-btn @click="toRoute(Route.HOME)">
               <Icon icon="mdi-home"/>
               <span class="nav-text"></span>
            </v-btn>
            <v-btn @click="toSiteRoute(Route.GALLERIES)">
               <Icon icon="mdi-image-multiple"/>
               <span class="nav-text">Galleries</span>
            </v-btn>
            <v-btn @click="toRoute(Route.SEARCH)">
               <Icon icon="mdi-magnify"/>
               <span class="nav-text">&nbsp;</span>
            </v-btn>
            <v-btn @click="toSiteRoute(Route.RECENT)">
               <Icon icon="mdi-history"/>
               <span class="nav-text">Updates</span>
            </v-btn>   
            <v-btn v-if="userExists" @click="router.push(isRoute(Route.USER) ? Route.ACCOUNT.url : Route.USER.url + userId)"> 
               <Icon :icon="isRoute(Route.USER) ? 'mdi-cog' : 'mdi-account'"/>
               <span class="nav-text"></span>
            </v-btn>
            <v-btn v-else @click="toRoute(Route.LOGIN)">
               <Icon icon="mdi-account"/>
               <span class="nav-text">Login</span>
            </v-btn>
         </v-bottom-navigation> -->
   <!-- <ion-footer class="ion-no-border">
      <ion-toolbar color="surface">
         <div class="footer-nav">
            <ion-button fill="clear" @click="toRoute(Route.HOME)" :class="{ active: navIndex === 0 }">
               <Icon icon="mdi-home"/>
            </ion-button>
            <ion-button fill="clear" @click="toSiteRoute(Route.GALLERIES)" :class="{ active: navIndex === 1 }">
               <Icon icon="mdi-image-multiple"/>
            </ion-button>
            <ion-button fill="clear" @click="toRoute(Route.SEARCH)" :class="{ active: navIndex === 2 }">
               <Icon icon="mdi-magnify"/>
            </ion-button>
            <ion-button fill="clear" @click="toSiteRoute(Route.RECENT)" :class="{ active: navIndex === 3 }">
               <Icon icon="mdi-history"/>
            </ion-button>
            <ion-button v-if="userExists" fill="clear" @click="router.push(isRoute(Route.USER) ? Route.ACCOUNT.url : Route.USER.url + userId)" :class="{ active: navIndex === 4 }">
               <Icon :icon="isRoute(Route.USER) ? 'mdi-cog' : 'mdi-account'"/>
            </ion-button>
            <ion-button v-else fill="clear" @click="toRoute(Route.LOGIN)">
               <Icon icon="mdi-account"/>
            </ion-button>
         </div>
      </ion-toolbar>
   </ion-footer> -->

   <ion-footer class="ion-no-border">
      <ion-tab-bar>
         <ion-tab-button @click="toRoute(Route.HOME)" :class="{ 'tab-selected': navIndex === 0 }">
            <Icon icon="mdi-home" />
         </ion-tab-button>
         <ion-tab-button @click="toSiteRoute(Route.GALLERIES)" :class="{ 'tab-selected': navIndex === 1 }">
            <Icon icon="mdi-image-multiple" />
         </ion-tab-button>
         <ion-tab-button @click="toRoute(Route.SEARCH)" :class="{ 'tab-selected': navIndex === 2 }">
            <Icon icon="mdi-magnify" />
         </ion-tab-button>
         <ion-tab-button @click="toSiteRoute(Route.RECENT)" :class="{ 'tab-selected': navIndex === 3 }">
            <Icon icon="mdi-history" />
         </ion-tab-button>
         <ion-tab-button v-if="userExists" @click="router.push(isRoute(Route.USER) ? Route.ACCOUNT.url : Route.USER.url + userId)" :class="{ 'tab-selected': navIndex === 4 }">
            <Icon :icon="isRoute(Route.USER) ? 'mdi-cog' : 'mdi-account'" />
         </ion-tab-button>
         <ion-tab-button v-else @click="toRoute(Route.LOGIN)" :class="{ 'tab-selected': navIndex === 4 }">
            <Icon icon="mdi-account" />
         </ion-tab-button>
      </ion-tab-bar>
   </ion-footer>

   </ion-page>
   </ion-app>
</template>

<script setup>
   import { computed, ref, onMounted } from 'vue'
   import { useRoute, useRouter } from 'vue-router'
   import { Head } from '@unhead/vue/components'
   import { useDark, useToggle } from '@vueuse/core'
   import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGroupStore }   from '@/stores/groupStore'
   // import { useGroupMgr }     from '@/stores/groupMgr'
   // import { useNotificationStore } from '@/stores/notificationStore'
   import { useHitStore }     from '@/stores/hitStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { useLocalStore }   from '@/stores/localStore'
   import GalleryThumbConfig  from '@/components/gallery/thumb/GalleryThumbConfig.vue'
   import ItemThumbConfig     from '@/components/item/thumb/ItemThumbConfig.vue'
   import DarkButton          from '@/components/util/DarkButton.vue'
   import Icon                from '@/components/util/icon/Icon.vue'
   import ThumbSizeButton     from '@/components/util/ThumbSizeButton.vue'
   import ToggleIcon          from '@/components/util/icon/ToggleIcon.vue'
   import IconButton          from '@/components/util/IconButton.vue'
   import ShakeIcon          from '@/components/util/icon/ShakeIcon.vue'
   import ViewedSortButton    from '@/views/viewed/ViewedSortButton.vue'
   import { handleError }     from '@/utils/utils'
   import { daysOld }         from '@/utils/dateUtils'
   import { Defaults, Route, ThumbType } from '@/utils/constants'
   import { versions }   from '@/version'

   const route  = useRoute()
   const router = useRouter()
   const userStore    = useUserStore()
   const itemStore    = useItemStore()
   const galleryStore = useGalleryStore()
   const groupStore   = useGroupStore()
   // const groupMgr  = useGroupMgr()
   // const notificationStore = useNotificationStore()
   const hitStore     = useHitStore()
   const viewStore  = useViewStore()
   const viewMgr    = useViewMgr()
   const localStore = useLocalStore()
   const windowSize = ref({})
   // useNotificationStore() // instantiated ahead of time for messages/onMounted
   
   onMounted(async() => {
      // console.log("App.onMounted")
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {     
         // console.log("onAuthStateChanged") 
         if (user) { userStore.userId = user.uid } 
         else { 
            userStore.userId = "" 
            localStore.setSoloMode(false) // in case user had solo set
         }

         if (userStore.userId) {
            setTimeout(() => {
               if (userStore.user && (!userStore.user.dateVisited || daysOld(userStore.user.dateVisited))) {
                  userStore.updateDateVisited(userStore.userId)
               }
            }, 2000)
         }
         viewStore.resetView()
      })

      console.log("window.location.hostname", window.location.hostname)

      await Promise.allSettled([
         itemStore.addListener().catch(err    => console.error("itemStore init error:",    err)),
         galleryStore.addListener().catch(err => console.error("galleryStore init error:", err)),
         groupStore.addListener().catch(err   => console.error("groupStore init error:",   err)),
         hitStore.addListener().catch(err     => console.error("hitStore init error:",     err))
      ])

      setWindowSize()
      window.addEventListener('resize', setWindowSize)
   })

   router.beforeEach((to, from) => {
      if (to.name == Route.ACCOUNT.name && !userStore.userExists) { return {name: Route.LOGIN.name} }
   })

   const setWindowSize = () => { windowSize.value = { width: window.innerWidth, height: window.innerHeight }}
   const pageName = computed(() => viewStore.pageName)
   const currentRoute     = computed(() => router.currentRoute.value ? router.currentRoute.value : {})
   const currentRouteName = computed(() => router.currentRoute.value ? router.currentRoute.value.name : "")
   const isMyUserPage     = computed(() => currentRouteName.value == Route.USER.name && route.params.id == userStore.userId)

   const isRoute     = (route)     => { return currentRouteName.value == route.name }
   const inRoutes    = (...routes) => { return routes.map(route => route.name).includes(currentRouteName.value) }  
   const toRoute     = (route)     => { router.push(route.url) }
   const toSiteRoute = (route)     => { router.push(route.url + Defaults.SITE_ID) }

   const user = computed(() => { 
      const currUser = userStore.userExists ? userStore.user : null 
      const soloMode = currUser?.settings?.soloMode ? true : false
      if (localStore.soloMode != soloMode) { localStore.setSoloMode(soloMode) }
      return currUser
   })
   const userExists  = computed(() => userStore.userExists)
   const userId      = computed(() => userStore.userId)
   // const userOwnerId = computed(() => userStore.user.ownerId) 
   
   // const activeNotificationsExist = computed(() => notificationStore.myActiveNotifications.length)

   const displayName = computed(() => {
      const currUser = user.value // ugly - check user, which drives update of localStore.soloMode
      return localStore.soloMode ? "Solo" : (currUser ? currUser.firstName : "")
   })

   const homeTitle = computed(() => 
      viewMgr.solo && user.value ? (user.value.displayName ?? user.value.username) : "Hell-No Gallery")

   const version = computed(() => { return versions[0][0] })
   const userAgent = computed(() => navigator.userAgent)
   const maxTouchPoints = computed(() => navigator.maxTouchPoints)  
   const isStandalone = computed(() => window.matchMedia('(display-mode: standalone)').matches)
   const appEnv = computed(() => { 
      // logStore.jsonInfo("navigator", 
         // { maxTouchPoints: navigator.maxTouchPoints, platform: navigator.platform, userAgent: navigator.userAgent })
      
      const installed = isStandalone.value ? "Installed" : ""
      const iosDevice = navigator.userAgent.match(/iPhone|iPad|iPod/) // ipad no longer matches
      return installed + (installed.length && iosDevice ? " on " : "") + (iosDevice ? iosDevice : "")
   })

   // used by mobile to indicate which, if any, bottom nav option the current page is
   const navIndex = computed({ 
      get() { 
         if (currentRouteName.value == Route.HOME.name)           { return 0 }
         else if (currentRouteName.value == Route.GALLERIES.name) { return 1 }
         else if (currentRouteName.value == Route.SEARCH.name)    { return 2 }
         else if (currentRouteName.value == Route.RECENT.name)    { return 3 }
         else if (inRoutes(Route.ACCOUNT, Route.LOGIN))           { return 4 }
         else return null
       },
      set(index) {} 
   })

   const username = computed(() => {
      let owner = userStore.getUser(route.params.id)
      return owner ? owner.username : "User" 
   })
   
   const toggleSoloMode = () => {   
      const settings = { ...user.value.settings }
      settings.soloMode = settings.soloMode ? false : true 
      userStore.updateSettings(settings)
      toRoute(Route.HOME)
   }

   const logout = () => { viewMgr.logout() }
</script>

<style>
ion-header {
  background-color: var(--v-theme-surface, #ffffff);
}
ion-toolbar {
  --min-height: 44px;
}



ion-footer {
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  background-color: var(--v-theme-surface, #ffffff);
}

/* Tab bar configuration inside footer */
ion-footer ion-tab-bar {
  --background: var(--v-theme-surface, #ffffff);
  --border: none;
  height: 50px;
}

ion-tab-button {
  --color: #757575;
  --color-selected: var(--ion-color-primary, #1976d2);
}

/* Force custom Icon wrapper components inside tab buttons to match header scale */
ion-tab-button > * {
  font-size: 24px !important;
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}


.app { 
   /* height: inherit; */
   width: 100%;
   text-align: center; 
}
.title { 
   font-size: 35px;
   padding-top: 0;
   padding-bottom: 0;
   margin-top: 0;
   margin-bottom: 0;
   line-height: 1;
 }
.title-sm { font-size: 16px; }
.edit-dialog {
   min-width: 500px;  
}
.float-bottom {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 5;
} 
.hand {
   cursor: pointer;
}
.nav-left {
   display: flex;
   justify-content: left;
   align-items: center;
}
.nav-right { 
   display: flex;
   justify-content: right;
   align-items: center;
}
.nav-text {
   min-height:25px
}
.pointer {
   cursor: pointer;
}
.small {
   font-size: 10px;
   margin: 40px;
}
.tight-checkbox { 
   max-height: 30px;
}
.horizontal-container {
  display: flex; /* align children horizontally by default */
}
.walldiv {
  width: 100%;
  position: relative;
}
.width-100 { 
   min-width: 100%; 
   max-width: 100%; 
}
@keyframes icon-wiggle {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-15deg); }
  30% { transform: rotate(12deg); }
  45% { transform: rotate(-10deg); }
  60% { transform: rotate(8deg); }
  75% { transform: rotate(-4deg); }
}
.icon-wiggle-on-load {
  animation: icon-wiggle 0.8s ease-in-out;
  animation-iteration-count: 3; 
  transform-origin: center; 
}
</style>


