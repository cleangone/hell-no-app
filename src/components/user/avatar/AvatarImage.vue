<template>
   <CachedImg v-if="url" :src="url" class="image-circle" :style="style"/>
</template>

<script setup>
   import { computed } from 'vue'
   import CachedImg from '@/components/image/CachedImg.vue'
   
   const props = defineProps({ image: Object, size: Number })
   
   const url   = computed(() => props.image?.thumbUrl)
   const size  = computed(() => props.size ?? 60)
   const style = computed(() =>  "width:" + size.value + "px; height:" + size.value + "px;")
</script>

<style>
</style>
