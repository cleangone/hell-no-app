<template>
<ion-page>
<ion-content>  
   <v-container class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isDeskTop" class="title">{{ title }}</div>
            <RouterLink v-if="username" :to="Route.USER.url + route.params.id">{{ username }}</RouterLink>
         </v-col>
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ViewedSortButton class="mr-2"/>
            <ThumbSizeButton class="mr-2"/>
            <ItemThumbConfig/>
         </v-col>
      </v-row>
   </v-container>
   <div class="mt-3 w-100">
      <v-row justify="space-around">
         <ItemThumb v-for="item in displayItems" :key="item.id" :item="item" :origin="ItemOrigin.VIEWED" 
            showDateViewed :tight="viewMgr.isMobile"/>
      </v-row>
   </div>
</ion-content>
</ion-page>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRoute } from 'vue-router'
   import { useUserStore } from '@/stores/userStore'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemThumb        from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig  from '@/components/item/thumb/ItemThumbConfig.vue'
   import ThumbSizeButton  from '@/components/util/ThumbSizeButton.vue'  
   import ViewedSortButton from './ViewedSortButton.vue'  
   import { isOwned, toSortedDateViewedAsc } from '@/utils/utils'  
   import { Defaults, ItemOrigin, Route } from '@/utils/constants'
   
   const route     = useRoute()
   const userStore = useUserStore()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const title        = computed(() => viewStore.sortRecentViewed ? "Recent Viewed" : "Least Recent Viewed")
   const user         = computed(() => route.params.id == Defaults.SITE_ID ? null : userStore.getUser(route.params.id))
   const userId       = computed(() => user.value ? user.value.id : null )
   const username     = computed(() => user.value ? user.value.username : null)
   const displayItems = computed(() => viewStore.sortRecentViewed ? recentViewedItems.value : oldestViewedItems.value)
   
   const recentViewedItems = computed(() => {
      let items = itemMgr.recentViewedPublicItems
      if (viewMgr.solo)       { items = items.filter(item => isOwned(item, userStore.userId)) }
      else if (userId.value)  { items = items.filter(item => isOwned(item, userId.value)) }
      
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      return viewStore.setVisibleItems(ItemOrigin.VIEWED, "Recent Viewed", Route.VIEWED.url + route.params.id, ungroupedItems)
   })

   const oldestViewedItems = computed(() => toSortedDateViewedAsc(recentViewedItems.value))
</script>

<style>
</style>
