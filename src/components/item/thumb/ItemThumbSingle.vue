<template>
   <v-card :width="cardWidth" @click="toItem" style="z-index: 1" :style="cardStyle" 
         :class="cardClass" class="d-flex flex-column text-center thumb-container thumb-link">
      <!-- <RouterLink :to="itemURL"> -->
         <v-img :src="thumbUrl"/>
      <!-- </RouterLink> -->
      <ItemThumbText v-if="showText" :item="item" :origin="origin" :useAltName="useAltName" :useLocalName="useLocalName" 
         :bypassShowUser="bypassShowUser" :showDateViewed="showDateViewed"/>
   </v-card>
   
   <!-- <ItemPopup v-if="popup" :popupImage="popup"/> -->
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useIonRouter } from '@ionic/vue'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   // import ItemPopup        from '@/components/item/ItemPopup.vue'
   import ItemThumbText    from './ItemThumbText.vue'
   import { thumbBackgroundColorStyle } from '@/utils/utils'
   import { ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ 
      item: Object, origin: String, size: String, useAltName: Boolean, useLocalName: Boolean, 
      bypassShowUser:Boolean, showDateViewed:Boolean, emitPopup: Boolean })
   
   const ionRouter = useIonRouter()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   // const cardRef = ref(null)
   // const popup = ref(null)

   const item    = computed(() => props.item)
   const itemURL = computed(() => {   
      const id = props.item.linkId ? props.item.linkId : props.item.id
      return itemMgr.itemURL(id, props.origin, props.item.childNum)
   })
   const thumbUrl    = computed(() => item.value.primaryImage.thumbUrl)
   // const artist      = computed(() => item.value.primaryArtist ? item.value.primaryArtist.fullName : null)
   const thumbSize   = computed(() => props.size ?? (viewMgr.isXs ? viewStore.thumbSize.xsSize : viewStore.thumbSize.size))
   const showText    = computed(() => thumbSize.value != ThumbSize.IMG)
   const cardClass   = computed(() => (showText.value ? "mb-5" : "mb-2") + (thumbSize.value == ThumbSize.IMG ? "" : " pa-1")) 
   const cardStyle   = computed(() => thumbBackgroundColorStyle(props.item))
   const cardWidth   = computed(() => itemMgr.getItemWidth(item.value, 
                                          viewMgr.getTargetThumbHeight(thumbSize.value), 
                                          viewMgr.getItemMaxLandscapeWidth(thumbSize.value))) 
                                          
   const toItem = () => { 
      console.log("toItem", itemURL.value)
      ionRouter.push(itemURL.value, 'forward')
   }
</script>

<style>
.thumb-container {
   position: relative;
}
</style>
