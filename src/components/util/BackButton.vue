<template>
   <IconButton icon="mdi-chevron-left" @click="ionRouter.back()" size="med"/> 
</template>

<script setup>
   import { useIonRouter } from '@ionic/vue'
   
   const ionRouter = useIonRouter()
</script>