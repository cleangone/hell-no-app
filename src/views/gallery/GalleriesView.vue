<template>
<ion-page>
<ion-content>      
   <div v-if="viewMgr.isMobile && username" class="mt-n2">
      <RouterLink :to="Route.USER.url + route.params.id">{{ username }}</RouterLink>
   </div>
   <v-container v-if="!viewMgr.isMobile" class="pa-0 mt-1 pb-3 mb-2 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="1" class="d-flex justify-start flex-grow-0 flex-shrink-0">
            <UserLinkAvatar v-if="user" :user="user"/>  
         </v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div class="title">Galleries</div>
            <RouterLink v-if="username" :to="Route.USER.url + route.params.id" class="mt-n10">{{ username }}</RouterLink>
            <!-- <div v-else-if="viewMgr.solo" class="text-subtitle-1 mt-n2 mb-2">Solo Mode</div> -->
         </v-col>      
         <v-col cols="1" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ThumbSizeButton :thumbType="ThumbType.GALLERY"/>
            <SortButton :sortByDate="sortByDate" @click="sortByDate=!sortByDate" class="mx-2"/>
            <ChildGalleriesButton v-if="childGalleriesExist" class="mr-2"/>
            <GalleryThumbConfig class="mr-2"/>
            <ToolTip location="bottom" iconClass="mx-n2">
               <div>
                  <div><v-icon icon="mdi-image-size-select-large"/> Image size</div>
                  <div><v-icon icon="mdi-sort-calendar-ascending"/> / <v-icon icon="mdi-sort-alphabetical-ascending"/> 
                     Sort by Date/Name</div>
                  <div v-if="childGalleriesExist">
                     <v-icon icon="mdi-folder-multiple-image"/> / <v-icon icon="mdi-folder-image"/> 
                     Show/Hide Child Galleries</div>
                  <div><v-icon icon="mdi-image-edit"/> Additional Config</div>
               </div>
            </ToolTip>   
         </v-col>
      </v-row>
   </v-container>
   <div style="clear:both"></div>
   <v-container style="margin-bottom: auto;">
      <!-- users -->
      <!-- <div v-if="showAvatars" class="bg-shade border-md fill-height pa-3">
         <UserThumbSwiper :users="avatarUsers" @userId="selectUser"/>
      </div> -->
      <!-- galleries -->
      <!-- <v-row justify="space-around"  density="compact" class="mt-5 mb-md-4" > -->
      <v-row align="start" align-content="start" justify="space-around" density="compact" class="mt-5 mb-md-4">
         <GalleryThumb v-for="gallery in selectedGalleries" :key="gallery.id" :gallery="gallery" 
            :bypassShowUser="bypassShowUser" :showChildImages="!showChildGalleries" 
            :parentIcon="getElderIcon(gallery)" @toggle="toggleExpandedId(gallery.id)"
            :childIcon="getChildIcon(gallery)"  @close="closeChild(gallery)"/>
      </v-row>
   </v-container>
</ion-content>
</ion-page>
</template>

<script setup>
   import { computed, onErrorCaptured, onMounted, ref, watch } from 'vue'
   import { useSeoMeta } from '@unhead/vue'
   import { useRoute } from 'vue-router'
   import { useUserStore }    from '@/stores/userStore'
   import { useUserMgr }      from '@/stores/userMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import GalleryThumb        from '@/components/gallery/thumb/GalleryThumb.vue'
   import GalleryThumbConfig  from '@/components/gallery/thumb/GalleryThumbConfig.vue'
   import ChildGalleriesButton from '@/components/gallery/thumb/ChildGalleriesButton.vue'
   import UserThumbSwiper     from '@/components/user/thumb/UserThumbSwiper.vue'
   import UserLinkAvatar      from '@/components/user/avatar/UserLinkAvatar.vue'
   import SortButton          from '@/components/util/SortButton.vue'
   import ThumbSizeButton     from '@/components/util/ThumbSizeButton.vue'
   import ToolTip             from '@/components/util/ToolTip.vue'
   import { handleError, isPrivate, toSortedDateContentModifiedDesc, toSortedNameAsc, toSortedSortDesc } from '@/utils/utils'
   import { Defaults, GalleryThumbOptions, Route, ThumbType } from '@/utils/constants'
  
   const route = useRoute()
   const userStore    = useUserStore()
   const userMgr      = useUserMgr()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const sortByDate   = ref(true)
   const selectedUserId = ref(null)
   const expandedElderIds = ref(new Set()) // elder is the top level parent 
   const userIdToNumGalleries = ref(new Map())
   const elderIdToFamilyGalleries = ref(new Map())
   
   useSeoMeta({ title: "Hell-No Galleries" })
   onMounted(async() => {
      if (!viewStore.isInitialized) { viewMgr.init() }
   })

   onErrorCaptured((err) => { return handleError(err, "GalleriesView") })

   const isSiteGallery = computed(() => route.params.id == Defaults.SITE_ID)
   const user          = computed(() => isSiteGallery.value ? null : userStore.getUser(route.params.id) )
   const username      = computed(() => user.value ? user.value.username : null)
  
   const showMyPrivateGalleries = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SHOW_PRIVATE))
   const showChildGalleries     = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SHOW_CHILD))
   watch(showChildGalleries, (newValue, oldValue) => {
      if (newValue) {
         const elderIds = [ ...elderIdToFamilyGalleries.value.keys() ]
         elderIds.forEach((elderId) => { expandedElderIds.value.add(elderId) })
      }
      else { expandedElderIds.value.clear() }
   })

   const visibleGalleries = computed(() => { 
      if (isSiteGallery.value) {
         return viewMgr.solo ? galleryStore.myGalleries : galleryStore.publicGalleries 
      }

      const galleries = []
      if (user.value) { 
         const allGalleries = user.value.id == userStore.userId ? 
            galleryStore.myGalleries : galleryStore.getPublicGalleries(user.value.id)
         galleries.push(...allGalleries)
      }      

     return galleries.filter(gallery => viewMgr.galleryThumbVisibleToUser(gallery))
   })

   const thumbGalleries = computed(() => { 
      const galleries = []     
      const elderIdToFamily = new Map()
      const userIdToGalleries = new Map()
      for (const gallery of visibleGalleries.value) {
         if (galleryMgr.hasGalleryThumbImage(gallery)) {
            if (showMyPrivateGalleries.value || !isPrivate(gallery)) {
               if (!gallery.parentGalleryId) { galleries.push(gallery) }

               if (gallery.childGalleryIds) {
                  const elderId = getElderId(gallery)
                  let familyGalleries = elderIdToFamily.get(elderId)
                  if (!familyGalleries) {
                     familyGalleries = []
                     elderIdToFamily.set(elderId, familyGalleries)
                  }
                  for (const galleryId of gallery.childGalleryIds) {
                     familyGalleries.push(galleryStore.getGallery(galleryId))
                  }
               }

               let userGalleries = userIdToGalleries.get(gallery.userId)
               if (!userGalleries) {
                  userGalleries = []
                  userIdToGalleries.set(gallery.userId, userGalleries)
               }
               userGalleries.push(gallery)
            }
         }
      }  

      userIdToNumGalleries.value = new Map(
         Array.from(userIdToGalleries, ([userId, galleries]) => [userId, galleries.length]))
      elderIdToFamilyGalleries.value = elderIdToFamily // side-effect hack
      return galleries
   })

   // todo - extract to map - hit multiple times
   const getElderId = (gallery) => { 
      let parent = gallery
      while (parent.parentGalleryId) {
         parent = galleryStore.getGallery(parent.parentGalleryId)
      }
      return parent.id
    }

   const sortedGalleries = computed(() => sortByDate.value ? 
      toSortedDateContentModifiedDesc(thumbGalleries.value) : toSortedNameAsc(thumbGalleries.value))

   const selectedGalleries = computed(() => {
      const displayGalleries = []
      const topLevelGalleries = selectedUserId.value ?
         sortedGalleries.value.filter(gallery => gallery.userId == selectedUserId.value) : sortedGalleries.value
      for (const gallery of topLevelGalleries) {
         displayGalleries.push(gallery)
         if (expandedElderIds.value.has(gallery.id)) {
            for (const familyGallery of elderIdToFamilyGalleries.value.get(gallery.id)) {
                displayGalleries.push(familyGallery)
            }
         }
      }
      return displayGalleries
   })

   const showAvatars = computed(() => isSiteGallery.value && !viewMgr.solo)   
   const avatarUsers = computed(() => {
      const users = userMgr.avatarUsers.map((user) => {
         const numGalleries = userIdToNumGalleries.value.get(user.id)
         return { ...user,
            displayInfo: numGalleries ? "(" + numGalleries + ")" : null,
            sort: numGalleries ?? 0 }
      })
      return toSortedSortDesc(users)
   })
   
   const selectUser = (userId) => { selectedUserId.value = userId }
   
   const bypassShowUser = computed(() => username.value ? true : false)

   const childGalleriesExist = computed(() => elderIdToFamilyGalleries.value.size)

   const getChildIcon = (gallery) => { return gallery.parentGalleryId ? "mdi-close-circle" : null }
   const getElderIcon = (gallery) => { 
      if (!gallery.parentGalleryId && gallery.childGalleryIds?.length) { 
         return expandedElderIds.value.has(gallery.id) ? "mdi-folder-multiple-image" : "mdi-folder-image"
      }
      return null
   }
   
   const closeChild = (gallery) => { toggleExpandedId(getElderId(gallery)) }
   const toggleExpandedId = (galleryId) => {    
      if (expandedElderIds.value.has(galleryId)) { expandedElderIds.value.delete(galleryId) } 
      else { expandedElderIds.value.add(galleryId) }
   }
</script>

<style>
</style>
