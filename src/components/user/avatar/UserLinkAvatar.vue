<template>
   <Avatar v-if="user" :user="user" @click="toUser" class="mt-3 hand pa-1 bg-black"/>
</template>

<script setup>
   import { computed } from 'vue'
   import { useIonRouter } from '@ionic/vue'
   import Avatar           from './Avatar.vue'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ user: Object })

   const ionRouter = useIonRouter()

   const toUser = () => { 
      console.log("toUser", Route.USER.url + props.user.id)
      ionRouter.push(Route.USER.url + props.user.id, 'forward')
   }
</script>

<style>
</style>
