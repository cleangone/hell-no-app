<template>
   <swiper slides-per-view="auto" :space-between="spaceBetweenSlides"
         :autoplay="{ delay:4000, pauseOnMouseEnter:true }" navigation loop @sliderMove="onSliderMove" 
         :modules="modules" :style="rowStyle" style="--swiper-navigation-size:20px;">
      <swiper-slide v-for="slideItem in wallRow.items" :key="slideItem.itemId" :width="slideItem.width" 
            class="swipe-slide py-4" :style="slideStyle"> 
         <SwipeWallSlide :wallItem="slideItem" :origin="ItemOrigin.WALL" :row=wallRow.index 
            :showAvatar="showAvatars"/>
      </swiper-slide>
   </swiper>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { Autoplay, Navigation, Pagination } from 'swiper/modules'
   import { useSwipeStore } from './SwipeStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import SwipeWallSlide    from './SwipeWallSlide.vue'
   import { ItemOrigin } from '@/utils/constants'
   import 'swiper/css' // needed for slides-per-view

   const props = defineProps({ wallRow:Object, rowHeight:Number, showAvatars:Boolean, linkUrl:String })

   const swipeStore = useSwipeStore()
   const viewMgr    = useViewMgr()
   const modules = ref([Autoplay, Navigation, Pagination])
   
   onMounted(() => {
      swipeStore.reset()
   })

   const spaceBetweenSlides = computed(() => viewMgr.isXs ? 10 : (props.wallRow.row ? 20 : 40) ) 
   const rowMargin          = computed(() => viewMgr.isXs ? 5 : 0) 
   const slideMargin        = computed(() => viewMgr.isXs ? 25 : 5) 
   const rowStyle   = computed(() => "min-height:" + (props.rowHeight + rowMargin.value)   + "px") 
   const slideStyle = computed(() => "height:"     + (props.rowHeight + slideMargin.value) + "px") 
</script>

<style>
.swipe-slide {
   display: flex;
   justify-content: center;
   align-items: center;
   width: fit-content;
   position: relative;
}
.swiper-button-prev ,
.swiper-button-next {
   background-color: white;
   background-position: center;
   background-size: 40px;
   background-repeat: no-repeat;
   padding: 15px 15px;
   border-radius: 100%;
   border: 2px solid black;
}
</style>
