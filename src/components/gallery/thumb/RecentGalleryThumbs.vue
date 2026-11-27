<template>
   <v-container ref="containerRef">
      <div class="mb-5">
         <span class="font-weight-bold">Galleries</span> |
         <RouterLink :to="Route.GALLERIES.url + toRouteId">View all</RouterLink>
      </div>
      <v-row justify="space-around">
         <GalleryThumb v-for="gallery in thumbGalleries" :key="gallery.id" :gallery="gallery" 
            :size="ThumbSize.MED" :bypassShowUser="bypassShowUser" showChildImages />
      </v-row>
   </v-container>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useElementSize } from '@vueuse/core'
   import { useViewMgr } from '@/stores/viewMgr'
   import GalleryThumb   from '@/components/gallery/thumb/GalleryThumb.vue'
   import { ThumbRow }   from '@/utils/utilClasses'
   import { Defaults, GalleryThumbMaxWidths as ThumbMaxWidths, Route, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ 
      galleries: Array, 
      toRouteId: { type: String, default: Defaults.SITE_ID }, 
      maxRows:   { type: Number, default: 1 },
      bypassShowUser: Boolean })
   
   const viewMgr = useViewMgr()
   const containerRef = ref(null)
   const { width: rowWidth } = useElementSize(containerRef)
   
   const thumbGalleries = computed(() => {   
      const thumbRow = new ThumbRow(props.maxRows, rowWidth.value)
      for (const gallery of props.galleries) {
         const thumbWidth = viewMgr.isXs ? 
            Math.floor(rowWidth.value * ThumbMaxWidths.xsSizes.get(ThumbSize.MED)) :  // xs is a pct
            ThumbMaxWidths.sizes.get(ThumbSize.MED)
         if (!thumbRow.addThumb(gallery, thumbWidth + 5)) { break }  
      } 
      return thumbRow.thumbs
   })
</script>

<style>
</style>
