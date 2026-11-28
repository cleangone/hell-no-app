<template>
   <IconButton icon="mdi-chevron-left" @click="ionRouter.back()" class="back-btn"/> 
</template>

<script setup>
   import { useIonRouter } from '@ionic/vue'
   
   const ionRouter = useIonRouter()
</script>

<style scoped>
.back-btn :deep(.v-icon) {
  font-size: 1.75rem; 
}
</style>