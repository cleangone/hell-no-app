<template>
   <!-- buttonClass was used to identify the button pressed in the ItemView arrow logic  -->
   <IconButton @click="showFullscreen=true" icon="mdi-arrow-expand" sm :class="buttonClass"/> 
   
   <FullscreenItems v-if="showFullscreen" :items="items" :item="item" :backgroundImage="backgroundImage" @done="done()"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import FullscreenItems from './FullscreenItems.vue'
   import IconButton      from '@/components/util/IconButton.vue'
   
   const props = defineProps({ items:Array, item:Object, backgroundImage:Object, buttonClass:String })   

   const showFullscreen = ref(false)
   const buttonClass = computed(() => props.buttonClass ? props.buttonClass : "")
   const done = () => { showFullscreen.value = false }
</script>

<style>
</style>
