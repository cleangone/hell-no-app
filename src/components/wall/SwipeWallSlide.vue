<template>
   <v-card :width="wallItem.wallImageWidth" ref="cardRef" color="transparent" flat class="d-flex flex-column text-center">
      <div v-if="topRow" class="position-relative">
         <v-card class="mt-7 bg-black">
            <div class="ma-1">
               <RouterLink :to="itemURL">
                  <v-img :src="wallItem.wallImageUrl"/>
               </RouterLink>
               <div class="text-white">{{ wallItem.title }}</div>  
            </div> 
         </v-card>
         <UserLinkAvatar v-if="showAvatar" :user="user" class="position-absolute left-0 ml-2"  style="top: -10px;"/>
      </div>
      <div v-else class="bg-black">
         <div class="ma-1">
            <RouterLink :to="itemURL">
               <v-img :src="wallItem.wallImageUrl"/>
            </RouterLink>
         </div> 
      </div>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useItemMgr }    from '@/stores/itemMgr'
   import { useSwipeStore } from './SwipeStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import UserLinkAvatar    from '@/components/user/avatar/UserLinkAvatar.vue'
   import { objAspectRatio } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ wallItem:Object, origin:String, row:Number, showAvatar:Boolean })
   // const emit  = defineEmits([ Emit.POPUP ])

   const userStore  = useUserStore()
   const itemMgr    = useItemMgr()
   // const swipeStore = useSwipeStore()
   // const viewMgr    = useViewMgr()
   // const cardRef = ref(null)
   // const mouseleaveTime = ref(Date.now())   

   const topRow  = computed(() => props.wallItem.wallRow == 1)
   const itemURL = computed(() => itemMgr.itemURL(props.wallItem.itemId, props.origin, props.wallItem.childNum))
   const userId  = computed(() => props.wallItem.userId ?? null)
   const user    = computed(() => userId.value ? userStore.getUser(userId.value) : null)
</script>

<style>
</style>
