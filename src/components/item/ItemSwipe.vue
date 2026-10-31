<template>
   <div ref="swipeEle" :style="{transform:transform, transition:transition, touchAction:'none'}">
      <v-img v-if="showImage" :src="imageUrl">
         <div v-if="isFavorite" class="pa-3 d-flex fill-height align-start justify-end">
             <Icon icon="mdi-heart" />
         </div>
      </v-img>
      <div v-if="showText" class="pb-16 mt-n2 pt-3 px-1 text-left swipe-container">
         <ItemArtistYear :item="props.item" />
         <div v-if="populated(props.item.subtitle)" class="font-weight-medium">{{ props.item.subtitle }}</div>
         <div v-html="props.item.desc" class="pb-16"></div>
         <!-- hack to ensure top slide covers bottom - issues w/ min-height -->
         <div v-if="props.item.isTop" v-for="i in 5" :key="i" class="pb-16"></div>
      </div>
   </div>
 </template>
 
 <script setup>
   import { computed, onUnmounted, onMounted, ref } from 'vue'
   import {useWindowSize } from '@vueuse/core'
   import interact from "interactjs"
   import { useItemMgr } from '@/stores/itemMgr'
   import ItemArtistYear from '@/components/item/ItemArtistYear.vue'
   import Icon           from '@/components/util/icon/Icon.vue'
   import { populated } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
  
   const TRANSITION = "transform 0.5s cubic-bezier(0.25, 0.75, 0.5, 1.25)"
   const THRESHOLD_X = 50
   const THRESHOLD_Y = 70
   const INFINITE_X = 500
   const INFINITE_Y = 900
 
   const props = defineProps({ item:Object, isFavorite:Boolean, canSwipeLeft:Boolean, canSwipeRight:Boolean, canSwipeUp:Boolean, canSwipeDown:Boolean })
   const emit  = defineEmits([ Emit.SWIPE_LEFT, Emit.SWIPE_RIGHT, Emit.SWIPE_UP, Emit.SWIPE_DOWN, Emit.DONE ])
   
   // const { height: windowHeight } = useWindowSize()
   const itemMgr = useItemMgr()
   const swipeEle = ref(null)
   const showImage = ref(false)
   const showText  = ref(false)
   // const slideStyle = ref("")
   const prevEmit = ref(null)
   const isDragging = ref(true)
   const position = ref({ x: 0, y: 0 })

   onMounted(async () => {
      // console.log(props.item.name + (props.item.isTop ? " top" : ""))
      if (props.item.isTop) { 
         // top slide displays the image first, and then the text 
         // otherwise the text will display first causing a flash when the image is displayed
         showImage.value = true 
         setTimeout(() => { showText.value  = true }, 500) 

         
         // console.log("min-height", props.item.name, windowHeight.value) 
         // top slide needs to fill the screen to keep the bot from showing behind a shorter top  
         // slideStyle.value = "min-height:" + windowHeight.value + "px;"
         // slideStyle.value = "padding-bottom: 200px;"
      }
      else {
         // bottom slide display delayed until after top
         setTimeout(() => { showImage.value = true }, 300) 
         
         // bottom text shows after image to prevent flashing during swipe
         setTimeout(() => { showText.value  = true }, 500) 
      }    

      const element = swipeEle.value
      interact(element).draggable({
         onstart: () => { 
            isDragging.value = true 
            prevEmit.value = null
         },
         onmove: (event) => {
            const x = position.value.x + event.dx
            const y = position.value.y + event.dy

            if (Math.abs(x) > Math.abs(y)) {
               if (props.canSwipeLeft && x < 0) { emitSwipe(Emit.SWIPE_LEFT) }
               else if (props.canSwipeRight && x > 0) { emitSwipe(Emit.SWIPE_RIGHT) }
            }
            else {
               if (props.canSwipeUp && y < 0) { emitSwipe(Emit.SWIPE_UP) }
               else if (props.canSwipeDown && y > 0) { emitSwipe(Emit.SWIPE_DOWN) }
            }
            setPosition({ x, y })
         },
         onend: () => {
            const { x, y } = position.value
            isDragging.value = false
   
            if (x < -THRESHOLD_X)      { onThresholdReached(Emit.SWIPE_LEFT) }
            else if (x >  THRESHOLD_X) { onThresholdReached(Emit.SWIPE_RIGHT) }
            else if (y < -THRESHOLD_Y) { onThresholdReached(Emit.SWIPE_UP) }
            else if (y >  THRESHOLD_Y) { onThresholdReached(Emit.SWIPE_DOWN) }
            else setPosition({ })
         }
      })
   })

   onUnmounted(() => { 
      unsetInteractElement()
   })
   
   const imageUrl = computed(() => itemMgr.mobileImageUrl(props.item.primaryImage))
   const artist   = computed(() => props.item.primaryArtist ? props.item.primaryArtist.fullName : null)
   
   const transform = computed(() => {
      const { x, y } = position.value
      return `translate3D(${x}px, ${y}px, 0) rotate(0deg)`
   })

   const transition = computed(() => isDragging.value ? "" : TRANSITION)

   const canSwipe = (swipeEmit) => { 
      if (swipeEmit == Emit.SWIPE_LEFT) { return props.canSwipeLeft }
      else if (swipeEmit == Emit.SWIPE_RIGHT) { return props.canSwipeRight }
      else if (swipeEmit == Emit.SWIPE_UP)    { return props.canSwipeUp }
      else if (swipeEmit == Emit.SWIPE_DOWN)  { return props.canSwipeDown }
      return false
   }

   // emit the swipe if the direction has changed
   const emitSwipe = (swipeEmit) => {
      if (prevEmit.value != swipeEmit) {
         prevEmit.value = swipeEmit
         emit(swipeEmit, props.item.name)
      }
   }

   const onThresholdReached = (swipeEmit) => {
      unsetInteractElement()
      if (swipeEmit == Emit.SWIPE_LEFT)       { setPosition({ x: canSwipe(swipeEmit) ? -INFINITE_X : 0 }) }
      else if (swipeEmit == Emit.SWIPE_RIGHT) { setPosition({ x: canSwipe(swipeEmit) ?  INFINITE_X : 0 }) }
      else if (swipeEmit == Emit.SWIPE_UP)    { setPosition({ y: canSwipe(swipeEmit) ? -INFINITE_Y : 0 }) }
      else if (swipeEmit == Emit.SWIPE_DOWN)  { setPosition({ y: canSwipe(swipeEmit) ?  INFINITE_Y : 0 }) }
      
      if (canSwipe(swipeEmit)) { emit(Emit.DONE, swipeEmit, props.item.name) }
   }
  
   const setPosition = (newPosition) => {
      const { x=0, y=0 } = newPosition
      position.value = { x, y }
   }

   const unsetInteractElement = () => {
      // console.log("unsetInteractElement")
   }
</script>

<style>
</style>
