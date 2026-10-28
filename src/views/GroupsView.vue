<template>
<ion-page>
<ion-content :fullscreen="true">
   <!-- header -->
   <!-- <div class="scrolling-header-container">
      <ion-toolbar class="custom-scrolling-toolbar">
         <ion-buttons slot="start"><BackButton/></ion-buttons>
         <ion-title class="text-center text-h6">{{ Route.GROUPS.display }}</ion-title>
         <ion-buttons slot="end"/>
      </ion-toolbar>
   </div> -->

   <Header>
      <template #left><BackButton/></template>
      <template #title>{{ Route.GROUPS.display }}</template>
      <template #right><span class="mr-8"></span></template>
   </Header>
   <v-container v-if="!viewMgr.isMobile" class="pa-0 mt-1 ml-1 mr-5 pb-3 w-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="1" class="d-flex justify-start flex-grow-0 flex-shrink-0">
            <UserLinkAvatar :v-if="user" :user="user"/>  
         </v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div class="title">Groups</div>
         </v-col>      
         <v-col cols="1" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
         </v-col>
      </v-row>
   </v-container>

   <v-container class="mr-6">
      <div v-for="group in thumbGroups" :key="group.id">
         <GroupThumb :group="group" class="mb-3"/>
      </div>
   </v-container>
</ion-content>  
</ion-page>
</template>

<script setup>
   import { computed, onMounted, ref, watch } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useUserMgr }   from '@/stores/userMgr'
   import { useGroupMgr }  from '@/stores/groupMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import GroupThumb       from '@/components/group/thumb/GroupThumb.vue'
   import Avatar           from '@/components/user/avatar/Avatar.vue'
   import UserLinkAvatar   from '@/components/user/avatar/UserLinkAvatar.vue'
   import Header           from '@/components/util/Header.vue'
   import BackButton       from '@/components/util/BackButton.vue'  
   import HorizontalDiv    from '@/components/util/HorizontalDiv.vue'
   import SortButton       from '@/components/util/SortButton.vue'
   import ThumbSizeButton  from '@/components/util/ThumbSizeButton.vue'
   import ToolTip          from '@/components/util/ToolTip.vue'
   import { handleError, isPrivate } from '@/utils/utils'
   import { Defaults, GalleryThumbOptions, Route } from '@/utils/constants'
  
   const userStore    = useUserStore()
   const userMgr      = useUserMgr()
   const groupMgr     = useGroupMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const sortByDate   = ref(true)
   const selectedUserId = ref(null)
   const expandedElderIds = ref(new Set()) // elder is the top level parent 
   const elderIdToFamilyGalleries = ref(new Map())
   
   onMounted(async() => {
      if (!viewStore.isInitialized) { viewMgr.init() }
   })

   const user        = computed(() => userStore.user)
   const thumbGroups = computed(() => groupMgr.myThumbGroups)
      

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
   const avatarUsers = computed(() => userMgr.avatarUsers)
   const selectUser = (user) => { selectedUserId.value = selectedUserId.value == user.id ? null : user.id }
   
  
   
</script>

<style>
</style>
