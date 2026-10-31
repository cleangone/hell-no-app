<template>
<ion-page>
<ion-content ref="contentRef" :fullscreen="true">
   <Header>
      <template #left><BackButton class="mr-8"/></template>
      <template #title>{{ artistFullName }}</template>
      <template #right>
         <!-- <PlayItems :items="searchItems" buttonClass="mr-1"/> -->
         <ThumbSizeButton class="mr-1"/>
         <ItemThumbConfig/> 
      </template>
   </Header>
   <v-container style="width: 100%">
      <v-row justify="space-around">
         <ItemThumb v-for="item in artistItems" :key="item.id" :item="item" :origin="ItemOrigin.ARTIST" :tight="viewMgr.isMobile"/>
      </v-row>
   </v-container>
</ion-content>  
</ion-page>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRoute } from 'vue-router'
   import { useUserStore }   from '@/stores/userStore'
   import { useArtistStore } from '@/stores/artistStore'
   import { useItemStore }   from '@/stores/itemStore'
   import { useItemMgr }     from '@/stores/itemMgr'
   import { useViewStore }   from '@/stores/viewStore'
   import { useViewMgr }     from '@/stores/viewMgr'
   import PlayItems          from '@/components/item/PlayItems.vue'
   import ItemThumb          from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig    from '@/components/item/thumb/ItemThumbConfig.vue'
   import Header             from '@/components/util/Header.vue'
   import ThumbSizeButton    from '@/components/util/ThumbSizeButton.vue'
   import { isOwned }     from '@/utils/utils'  
   import { ItemOrigin, Route } from '@/utils/constants'
   
   const route = useRoute()
   const userStore   = useUserStore()
   const artistStore = useArtistStore()
   const itemStore   = useItemStore()
   const itemMgr     = useItemMgr()
   const viewStore   = useViewStore()
   const viewMgr     = useViewMgr()
   
   const artistFullName = computed(() => {
      const artistName = artistStore.getFullName(route.params.id)
      viewStore.setPageName(artistName)
      return artistName
   })

   const artistItems = computed(() => {
      // needed to drive the viewStore for mobile (not reactive in onMounted?)
      artistFullName.value 

      const allArtistIds = artistStore.getAllArtistIds(route.params.id) // all artists related by aka

      let items = [ ...itemStore.getArtistPublicItems(allArtistIds) ]
      if (viewMgr.solo) { items = items.filter(item => isOwned(item, userStore.userId)) }
      else { items = items.filter(item => !itemMgr.isInvisible(item)) }

      // console.log("itemMgr", itemMgr) // todo - seems like this is needed to force itemMgr instantiation
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      ungroupedItems.sort((a, b) => a.name.localeCompare(b.name))
      return viewStore.setVisibleItems(ItemOrigin.ARTIST, "Artist", Route.ARTIST.url + route.params.id, ungroupedItems)
   })
</script>

<style>
</style>
