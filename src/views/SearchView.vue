<template>
<ion-page>
   <ion-content> 
      <!-- header -->
      <div class="scrolling-header-container">
         <ion-toolbar class="custom-scrolling-toolbar">
            <ion-buttons slot="start"><BackButton/></ion-buttons>
            <ion-title class="text-center text-h6">{{ Route.SEARCH.display }}</ion-title>
            <ion-buttons slot="end">
               <SortButton :sortByDate="sortByDate" @click="sortByDate=!sortByDate" class="mr-1"/>
               <ThumbSizeButton class="mr-1"/>
               <ItemThumbConfig class="mr-2"/>
            </ion-buttons>
         </ion-toolbar>
      </div>

      <v-row class="d-flex justify-start align-center mt-2 mx-1">
         <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" placeholder="Search" density="compact" @keyup.enter="search()" class="search"/>
         <BlueBtn text="Search" @click="search()" :disabled="!validQuery" class="ml-2 mb-4"/>
      </v-row>
      <v-container class="mt-4">
         <v-row justify="space-around">
            <GalleryThumb v-for="gallery in resultGalleries" :key="gallery.id" :gallery="gallery"/>
         </v-row>
         <v-row justify="space-around">
            <ItemThumb v-for="item in resultItems" :key="item.id" :item="item" :origin="ItemOrigin.SEARCH"/>
         </v-row>
      </v-container>
   </ion-content>
</ion-page>
</template>
 
<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useSearchMgr }    from '@/stores/searchMgr'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import GalleryThumb        from '@/components/gallery/thumb/GalleryThumb.vue'
   import ItemThumb        from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig  from '@/components/item/thumb/ItemThumbConfig.vue'
   import BackButton       from '@/components/util/BackButton.vue'  
   import BlueBtn          from '@/components/util/BlueBtn.vue'
   import SortButton       from '@/components/util/SortButton.vue'
   import ThumbSizeButton  from '@/components/util/ThumbSizeButton.vue'  
   import { isOwned, toSortedNameAsc } from '@/utils/utils'  
   import { ItemOrigin, Route } from '@/utils/constants'
   
   const userStore     = useUserStore()
   const searchMgr     = useSearchMgr()
   const itemMgr       = useItemMgr()
   const galleryStore  = useGalleryStore()
   const viewStore     = useViewStore()
   const viewMgr       = useViewMgr()
   const sortByDate    = ref(true)
   const resultGalleries = ref([])

   const searchQuery = computed({ 
      get() { return viewStore.searchQuery },
      set(query) { viewStore.setSearchQuery(query) }
   })

   const validQuery = computed(() => searchQuery.value?.length > 1)
  
   const search = () => { if (validQuery.value) { searchMgr.search(searchQuery.value) }}

   const resultItems = computed(() => {
      let items = [ ...viewStore.searchItems ]    
      if (viewMgr.solo) { items = items.filter(item => isOwned(item, userStore.userId)) }
      else { items = items.filter(item => !itemMgr.isInvisible(item)) }

      if (items.length) {
         if (sortByDate.value) { items.sort((a, b) => b.dateModified - a.dateModified) }
         else                  { items.sort((a, b) => a.name.localeCompare(b.name)) }
      }

      const galleryIdToGallery = new Map()
      for (const item of items) {
         if (item.galleryIds?.length) {
            for (const galleryId of item.galleryIds) {
               if (!galleryIdToGallery.has(galleryId)) {
                  const gallery = galleryStore.getGallery(galleryId)
                  galleryIdToGallery.set(galleryId, gallery) 
               }
            } 
         }
      }

      const galleries = [ ...galleryIdToGallery.values() ]
      resultGalleries.value = toSortedNameAsc(galleries)

      const itemViewItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      viewStore.setVisibleItems(ItemOrigin.SEARCH, "Search Results", Route.SEARCH.url, itemViewItems)
      return items
   })
</script>

<style>
.search {
   max-width: 400px;
}
</style>
