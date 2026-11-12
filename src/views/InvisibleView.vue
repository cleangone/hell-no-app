<template>
<ion-page>
<ion-content :fullscreen="true">
   <Header>
      <template #left><BackButton class="mr-8"/></template>
      <template #title>My Invisible Items</template>
      <template #right>
         <ThumbSizeButton class="mr-1"/>
         <ItemThumbConfig/> 
      </template>
   </Header>
   <v-container class="mt-3 ml-1 mr-5 w-100">
      <v-row justify="space-around">
         <ItemThumb v-for="item in invisibleItems" :key="item.id" :item="item" :origin="ItemOrigin.INVISIBLE" bypassShowUser :tight="viewMgr.isMobile"/>
      </v-row>
    </v-container>
</ion-content>  
</ion-page>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemThumb        from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig  from '@/components/item/thumb/ItemThumbConfig.vue'
   import BackButton       from '@/components/util/BackButton.vue'  
   import Header           from '@/components/util/Header.vue'
   import ThumbSizeButton  from '@/components/util/ThumbSizeButton.vue'
   import { ItemOrigin, Route } from '@/utils/constants'
   
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const invisibleItems = computed(() => {
      const items = [...itemMgr.myInvisibleItems] 
      items.sort(function(a, b){return b.dateContentModified - a.dateContentModified})    
      
      const itemViewItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      viewStore.setVisibleItems(ItemOrigin.INVISIBLE, "Invisible Items", Route.INVISIBLE.url, itemViewItems)
      return items
   })
</script>

<style>
</style>
