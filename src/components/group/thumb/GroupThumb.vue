<template>
   <v-card :height="height" :class="cardMargin" class="group-card d-flex flex-column thumb-link">
      <HorizontalDiv>
         <div v-if="image" @click="router.push(groupUrl)"> 
            <!-- <v-img v-if="image" :src="image.thumbUrl" :width="width" :height="height" class="hand image-tails"/> -->
            <CachedImg v-if="image" :src="image.thumbUrl" :width="width" :height="height" class="hand image-tails"/>
         </div>
         <div class="mt-1 mr-3 d-flex flex-column justify-center">
            <div class="font-weight-bold">{{ group.name }}</div>        
            <UserDateText :date="group.dateModified" class="text-body-2"/>
         </div>
      </HorizontalDiv>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRouter }   from 'vue-router'
   import { useGroupMgr } from '@/stores/groupMgr'
   import { useViewMgr }  from '@/stores/viewMgr'
   import CachedImg       from '@/components/image/CachedImg.vue'
   import HorizontalDiv   from '@/components/util/HorizontalDiv.vue'
   import UserDateText    from '@/components/util/UserDateText.vue'
   import { Route, ThumbAspectRatio } from '@/utils/constants'
   
   const props = defineProps({ group: Object })
   
   const router   = useRouter()
   const groupMgr = useGroupMgr()
   const viewMgr  = useViewMgr()
   
   const height     = computed(() => viewMgr.isXs ? 60 : 90)
   const width      = computed(() => height.value * ThumbAspectRatio.GROUP)
   const cardMargin = computed(() => viewMgr.isXs ? "mb-2" : "mb-5")
   const groupUrl   = computed(() => Route.GROUP.url + props.group.id)
   const image      = computed(() => groupMgr.getGroupImage(props.group))
</script>

<style>
.group-card {
   border-radius: 60px 5px 5px 60px !important;
   overflow: hidden; 
}
.image-tails { 
   /* cuts right edge inward */
   clip-path: polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%) !important;
   -webkit-clip-path: polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%) !important;
}
</style>

