<template>
<ion-page>
<ion-content>   
   <v-container class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isDeskTop" class="title">Recent Updates</div>
            <RouterLink v-if="username" :to="Route.USER.url + route.params.id">{{ username }}</RouterLink>
         </v-col>
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ThumbSizeButton class="mr-2"/>
            <ItemThumbConfig/>
         </v-col>
      </v-row>
   </v-container>
   <div class="mt-3 mx-3 w-100">
      <v-row justify="space-around">
         <ItemThumb v-for="item in recentItems" :key="item.id" :item="item" :origin="ItemOrigin.RECENT" 
            :bypassShowUser="bypassShowUser" :tight="viewMgr.isMobile"/>
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
   import { toSortedDateContentModifiedDesc } from '@/utils/utils'
   import { Defaults, ItemOrigin, Route } from '@/utils/constants'
   
   const route = useRoute()
   const userStore = useUserStore()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const user     = computed(() => route.params.id == Defaults.SITE_ID ? null : userStore.getUser(route.params.id))
   const username = computed(() => user.value ? user.value.username : null)

   const recentItems = computed(() => {
      let items = [] 
      if (viewMgr.solo) {  // param could be siteId but overridden by solo
         items.push(...itemMgr.myRecentItems)
      }
      else if (username.value) { 
         items.push(...itemMgr.getRecentItems(user.value.id))
      }
      else { items.push(...itemMgr.recentPublicItems) }

      items = items.filter(item => !itemMgr.isInvisible(item))
      items = toSortedDateContentModifiedDesc(items)

      // const displayItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      const visibleItems = []
      for (const item of items) {
         if (viewMgr.itemThumbVisibleToUser(item)) { visibleItems.push(item) }
      }

      const itemViewItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(visibleItems) : visibleItems
      viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates", Route.RECENT.url + route.params.id, itemViewItems)
      return visibleItems
   })

   const bypassShowUser = computed(() => username.value ? true : false)
</script>

<style>
</style>
