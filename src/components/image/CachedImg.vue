<template>
   <img :src="displaySrc" v-bind="$attrs"/>
</template>

<script setup>
   import { ref, watch } from 'vue'
   import { useCacheStore } from '@/stores/cacheStore'
   import { Defaults } from '@/utils/constants'   

   const props = defineProps({ src: String })

   const cacheStore = useCacheStore()
   const displaySrc = ref("")

   watch(() => props.src, async (newVal) => {
      // Await the cache disk lookup
      const cachedSrc = await cacheStore.getCachedUrl(newVal)
      displaySrc.value = cachedSrc ?? Defaults.IMAGE_FALLBACK
   }, { immediate: true })
</script>

<style>
</style>