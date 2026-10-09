<template>
   <Icon icon="mdi-chevron-left" @click="router.back()"/>
</template>

<script setup>
   import Icon from './icon/Icon.vue'
   import { useRouter } from 'vue-router'

   const router = useRouter()
</script>