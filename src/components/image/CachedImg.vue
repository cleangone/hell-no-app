<template>
   <img :src="localSrc" v-bind="$attrs"/>
</template>

<script setup>
   import { ref, watchEffect } from 'vue'
   import { useCacheStore } from '@/stores/cacheStore'

   const props = defineProps({ src: String })

   const cacheStore = useCacheStore()
   const localSrc = ref('')

   watchEffect(async () => {
      if (props.src) {
         localSrc.value = await cacheStore.getCachedUrl(props.src)
      }
   })
</script>

<style>
</style>