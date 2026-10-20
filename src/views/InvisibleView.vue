<template>
<ion-page>
<ion-content :fullscreen="true">
   <!-- header -->
   <div class="scrolling-header-container">
      <ion-toolbar class="custom-scrolling-toolbar">
         <ion-buttons slot="start"><BackButton/></ion-buttons>
         <ion-title class="text-center text-h6">My Invisible Items</ion-title>
         <ion-buttons slot="end">
            <ThumbSizeButton/>
            <ItemThumbConfig/>
         </ion-buttons>
      </ion-toolbar>
   </div>
   <!-- <v-container class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isDeskTop" class="title">My Invisible Items</div>
         </v-col>
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ThumbSizeButton class="mr-2"/>
            <ItemThumbConfig/>
         </v-col>
      </v-row>
   </v-container> -->
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
