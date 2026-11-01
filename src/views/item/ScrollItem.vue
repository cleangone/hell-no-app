<template>
   <CachedImg :src="imageUrl(props.item.primaryImage)" contain class="no-pointer-events"/>
   <div class="text-left mt-2">
      <ItemArtistYear :item="props.item" />
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemMgr } from '@/stores/itemMgr'
   import ItemArtistYear from '@/components/item/ItemArtistYear.vue'
   import CachedImg      from '@/components/image/CachedImg.vue'

   const props = defineProps({ item: Object })

   const itemMgr = useItemMgr()

   const imageUrl = (image) => { return itemMgr.mobileImageUrl(image) }
</script>

<style>

.no-pointer-events {
   pointer-events: none;
}
</style>
