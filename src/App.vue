<template>
   <!-- <Head>
      <title>App title</title>
      <meta property="og:title" content="OG Title"/>
      <meta property="og:description" content="OG description of the page."/>
   </Head> -->
   <div class="app">  
      <!-- <YouTubeAudio/> -->
      <v-row no-gutters class="flex-nowrap">
         <v-col :cols="sideCols" class="flex-grow-0 flex-shrink-0 nav-left" style="white-space:nowrap">
            <!-- top left icon for mobile -->
            <nav v-if="viewMgr.isMobile">
               <v-menu v-if="isRoute(Route.HOME)">
                  <template v-slot:activator="{ props }">
                     <v-btn v-bind="props" icon="mdi-menu" class="icon-btn" size="medium" variant="text"></v-btn>
                  </template>
                  <v-list>
                     <!-- <v-list-item @click="toggleDark()">
                        <template v-slot:prepend>
                           <v-icon :icon="isDark?'mdi-brightness-5':'mdi-brightness-3'" class="menu-icon"></v-icon>
                        </template>
                        <v-list-item-title>{{isDark ? "Light mode" : "Dark mode"}}</v-list-item-title>
                     </v-list-item> -->
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
                     <!-- <v-list-item @click="toRoute(Route.ACCOUNT)">
                        <template v-slot:prepend>
                           <v-icon icon="mdi-cog" class="menu-icon"></v-icon>
                        </template>
                        <v-list-item-title>Settings</v-list-item-title>
                     </v-list-item> -->
                  </v-list>
               </v-menu>
               <Icon v-if="currentRouteName!=Route.HOME.name" icon="mdi-chevron-left" @click="router.back()"/>
            </nav>
            <!-- top left links for desktop -->
            <nav v-else>
               <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.HOME"/>
               <span v-if="!inRoutes(Route.ACCOUNT, Route.ADMIN, Route.REGISTER)">
                  | <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.GALLERIES" :targetId="Defaults.SITE_ID" :url="Route.GALLERIES.url + Defaults.SITE_ID"/>
                  <span v-if="userExists && !viewMgr.solo && groupMgr.myThumbGroupsExist">
                     | <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.GROUPS"/>
                  </span> 
                  | <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.SEARCH"/>
                  <span v-if="userExists && !viewMgr.solo">
                     | <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.MESSAGE"/>
                  </span> 
                  | <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.ABOUT"/>
               </span> 
            </nav>
         </v-col>
         <!-- top center title for mobile -->
         <v-col cols="2" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isMobile" class="text-h6"> 
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
               <span v-else-if="isRoute(Route.ADMIN)"   class="text-subtitle-1">{{ Route.ADMIN.display }}</span>
               <span v-else-if="isRoute(Route.ADD_ITEM)">Add Item</span>
               <span v-else-if="isRoute(Route.EDIT_ITEM)">Edit Item</span>
            </div>
            <nav v-else>
               <!-- <span v-if="currentRoute == Route.MESSAGE.name" class="text-h6">Messages</span> -->
               <span v-if="isRoute(Route.ACCOUNT)" class="title-sm">{{ pageName }}</span>
               <span v-if="isRoute(Route.ADMIN)"   class="text-subtitle-1">{{ Route.ADMIN.display }}</span>
            </nav>
         </v-col>
         <!-- top right icons -->
         <v-col :cols="sideCols" class="flex-grow-0 flex-shrink-0 nav-right">
            <!-- top right icon for mobile -->
            <div v-if="viewMgr.isMobile">
               <span v-if="inRoutes(Route.HOME, Route.USER)" style="white-space: nowrap">
                  <!-- <Icon icon="mdi-dice-multiple" @click="toRoute(Route.RANDOM)"/> -->
                  <ShakeIcon v-if="activeNotificationsExist" icon="mdi-bell-ring" size="small" @click="toRoute(Route.MESSAGE)" class="mr-n1"/>
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
            <!-- top right icon for desktop -->
            <div v-else-if="userExists">
               <SearchBox class="mr-2"/>
               <RouterLink :to="isMyUserPage ? Route.ACCOUNT.url : Route.USER.url + userId">{{ displayName }}</RouterLink>
               <ShakeIcon v-if="activeNotificationsExist" icon="mdi-bell-ring" size="small" @click="toRoute(Route.MESSAGE)" class="mx-1"/>
               <v-menu>
                  <template v-slot:activator="{ props }">
                     <v-btn v-bind="props" icon="mdi-account" size="medium" variant="text" class="icon-btn"/>
                  </template>
                  <v-list>
                     <v-list-item @click="toggleSoloMode()">
                        <v-list-item-title>{{ viewMgr.solo ? "Exit " : "" }}Solo Mode</v-list-item-title>
                     </v-list-item>
                     <v-list-item @click="toRoute(Route.ACCOUNT)">
                        <v-list-item-title>My Account</v-list-item-title>
                     </v-list-item>
                     <v-list-item v-if="userIsAdmin" @click="toRoute(Route.ADMIN)">
                        <v-list-item-title>Admin</v-list-item-title>
                     </v-list-item>
                     <v-list-item v-for="profile in myProfiles" @click="swapToUser(profile.id)">
                        <v-list-item-title>Swap to profile {{ profile.username }}</v-list-item-title>
                     </v-list-item>
                     <v-list-item v-if="userOwnerId" @click="swapBack">
                        <v-list-item-title>Swap Back from Profile</v-list-item-title>
                     </v-list-item>
                     <v-list-item v-else @click="logout">
                        <v-list-item-title>Logout</v-list-item-title>
                     </v-list-item>
                  </v-list>
               </v-menu>
            </div>
            <div v-else>
               <SearchBox class="mr-2"/>
               <LinkOrText :currentRoute="currentRoute" :targetRoute="Route.LOGIN"/>
            </div> 
         </v-col>
      </v-row>
  
      <RouterView/>
 
      <div v-if="isRoute(Route.HOME)" class="small">
         {{ version }}<span v-if="appEnv.length"> - {{ appEnv }}</span>
      </div>
      <div v-else-if="isRoute(Route.ABOUT)" class="small">
         <div>{{ version }} ({{ windowSize.width }} x {{ windowSize.height }})</div>
         <div>User Agent: {{ userAgent }}</div>
         <div>Max Touch Points: {{ maxTouchPoints }}</div>
         <div v-if="isStandalone">Standalone</div>
      </div>

      <!-- Bottom nav for mobile -->
      <v-layout v-if="viewMgr.isMobile" style="height:60px">
         <v-bottom-navigation v-model="navIndex" color="primary" style="min-height:60px" grow>
            <v-btn @click="toRoute(Route.HOME)">
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
         </v-bottom-navigation>
      </v-layout>
   </div>
</template>

<script setup>
   import { computed, onErrorCaptured, onMounted, ref } from 'vue'
   import { useRoute, useRouter } from 'vue-router'
   import { Head } from '@unhead/vue/components'
   import { useDark, useToggle } from '@vueuse/core'
   import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
   import { useUserStore }    from '@/stores/userStore'
   import { useUserMgr }      from '@/stores/userMgr'
   import { useAdminStore }   from '@/stores/adminStore'
   import { useGroupMgr }     from '@/stores/groupMgr'
   import { useNotificationStore } from '@/stores/notificationStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { useLocalStore }   from '@/stores/localStore'
   import GalleryThumbConfig  from '@/components/gallery/thumb/GalleryThumbConfig.vue'
   import ItemThumbConfig     from '@/components/item/thumb/ItemThumbConfig.vue'
   import DarkButton          from '@/components/util/DarkButton.vue'
   import LinkOrText          from '@/components/util/LinkOrText.vue'
   import Icon                from '@/components/util/icon/Icon.vue'
   import SearchBox           from '@/components/util/SearchBox.vue'
   import ThumbSizeButton     from '@/components/util/ThumbSizeButton.vue'
   import ToggleIcon          from '@/components/util/icon/ToggleIcon.vue'
   import IconButton          from '@/components/util/IconButton.vue'
   import ShakeIcon          from '@/components/util/icon/ShakeIcon.vue'
   import YouTubeAudio        from '@/components/util/YouTubeAudio.vue'
   import ViewedSortButton    from '@/views/viewed/ViewedSortButton.vue'
   import { handleError }     from '@/utils/utils'
   import { daysOld }         from '@/utils/dateUtils'
   import { Defaults, Route, ThumbType } from '@/utils/constants'
   import { versions }   from '@/version'

   const route  = useRoute()
   const router = useRouter()
   const userStore  = useUserStore()
   const userMgr    = useUserMgr()
   const adminStore = useAdminStore()
   const groupMgr   = useGroupMgr()
   const notificationStore = useNotificationStore()
   const viewStore  = useViewStore()
   const viewMgr    = useViewMgr()
   const localStore = useLocalStore()
   const windowSize = ref({})
   useNotificationStore() // instantiated ahead of time for messages/onMounted
   
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

      setWindowSize()
      window.addEventListener('resize', setWindowSize)
   })

   onErrorCaptured((err) => { return handleError(err, "App") })

   const isDark = useDark()
   const toggleDark = useToggle(isDark)

   router.beforeEach((to, from) => {
      if (to.name == Route.ADMIN.name   && !adminStore.isAdmin)   { return {name: Route.HOME.name}  }
      if (to.name == Route.ACCOUNT.name && !userStore.userExists) { return {name: Route.LOGIN.name} }
   })

   const setWindowSize = () => { windowSize.value = { width: window.innerWidth, height: window.innerHeight }}
   const sideCols = computed(() => viewMgr.isMobile ? 1 : 5)
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
   const userIsAdmin = computed(() => adminStore.isAdmin)
   const userOwnerId = computed(() => userStore.user.ownerId) 
   const myProfiles  = computed(() => userMgr.myProfiles) 
   
   const activeNotificationsExist = computed(() => notificationStore.myActiveNotifications.length)

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
         if (currentRouteName.value == Route.HOME.name) { return 0 }
         else if (currentRouteName.value == Route.GALLERIES.name) { return 1 }
         else if (currentRouteName.value == Route.SEARCH.name)    { return 2 }
         else if (currentRouteName.value == Route.RECENT.name)    { return 3 }
         else if (currentRouteName.value == Route.ACCOUNT.name)   { return 4 }
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

   const swapBack = () => { if (userOwnerId.value) { swapToUser(userOwnerId.value) } }
   const swapToUser = (userId) => { 
      userStore.userId = userId
      router.push(Route.HOME.url)
   }
   const logout = () => { viewMgr.logout() }
</script>

<style >
.app { 
   height: inherit;
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


