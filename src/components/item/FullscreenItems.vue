<template>
   <div ref="fullscreenEle">
      <!-- fullscreen with background image -->
      <div v-if="isFullscreen" class="fullscreen-container">
         <img v-if="backgroundImage" :src="backgroundImage.url" class="fullscreen-dimmed"/>
         <div class="fullscreen-content">
            <!-- top row of controls -->
            <div v-if="multipleItems" class="text-center fullscreen-text">
               <v-row no-gutters class="d-flex align-center flex-nowrap pa-0 width-100">
                  <v-col cols="2" class="d-flex justify-start flex-grow-0 flex-shrink-0">
                  </v-col>
                  <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
                     <IconButton icon="mdi-chevron-left" @click="prev()" size="med"/>
                     <span class="mx-4">{{ currItem?.name }}</span>
                     <IconButton v-if="isPlaying" icon="mdi-pause" @click="pause()"/>
                     <IconButton v-else icon="mdi-play" @click="play()"/>
                     <IconButton icon="mdi-chevron-right" @click="next()" size="med"/>
                  </v-col>
                  <v-col cols="2" class="d-flex justify-end align-center flex-grow-0 flex-shrink-0 ">
                     <span v-if="isPlaying && countdown">{{ timerCurrSeconds }}</span>                  
                  </v-col>
               </v-row>
            </div>
            <div v-else class="text-center mx-4">{{ currItem?.name }}</div>
            <!-- image -->
            <v-container fluid class="pa-0 ma-0 fullscreen-slider">  
               <div class="slider-wrapper" ref="slideEle" :class="transition" >
                  <div @wheel="onWheel" class="swipe-box">
                     <transition name="slide">
                        <!-- div for smooth slide transition -->
                        <div :key="currItem.id" :style="{ backgroundImage: `url(${currItem.primaryImage.url})` }" 
                           class="fullscreen-image-slide"></div>
                     </transition>
                  </div>
               </div>
            </v-container>
         </div>
      </div>
   </div>
</template>

<script setup>
   import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
   import { onKeyStroke, useFullscreen } from '@vueuse/core'
   import { createGesture } from '@ionic/vue'
   import { useItemMgr } from '@/stores/itemMgr'
   import { useViewMgr } from '@/stores/viewMgr'  
   import IconButton     from '@/components/util/IconButton.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ items:Object, item:Object, backgroundImage:Object, play:Boolean })
   const emit = defineEmits([Emit.DONE])

   const Slide = { LEFT: "slide-left", RIGHT: "slide-right" }
   
   const fullscreenEle = ref(null)
   const { isFullscreen, toggle: fullscreenToggle } = useFullscreen(fullscreenEle)  
   const itemMgr     = useItemMgr()
   const viewMgr     = useViewMgr()
   const items       = ref([])
   const itemIndex   = ref(0)
   const isPlaying   = ref(false)
   const transition  = ref(Slide.LEFT)
   const swipeLocked = ref(false)
   const timer       = ref(null)
   const timerCurrSeconds = ref(0) 
   const slideEle    = ref(null)
   const gesture     = ref(null)

    onMounted(() => { 
      items.value = itemMgr.ungroupAndExtractItems(props.items)
      if (props.item) { itemIndex.value = getItemIndex() }
      fullscreenToggle()
      if (props.play) { play() }
   })

   onUnmounted(() => { 
      clearTimer() 
      if (gesture.value) { gesture.value.destroy() }
   })

   watch(isFullscreen, (newValue) => { if (!newValue) { emit(Emit.DONE) } })

   watch(slideEle, (ele) => {
      if (ele) {
         if (gesture.value) { gesture.value.destroy() }

         gesture.value = createGesture({
            el: ele,
            gestureName: 'horiz-swipe',
            direction: 'x',
            onEnd: (ev) => {
               if (ev.deltaX > 50) { prev() } 
               else if (ev.deltaX < -50) { next() }
            }
         })
         gesture.value.enable(true)
      }
   }, { immediate: true })

   const multipleItems = computed(() => items.value.length > 1)
   const currItem = computed(() => {
      const item = items.value.length ? items.value[itemIndex.value] : null      
      if (item) { viewMgr.addHit(item.linkId ? item.linkId : item.id) }
      return item
   })

   const getItemIndex = () => { 
      for (var i=0; i<items.value.length; i++) { 
         const item = items.value[i]
         const itemId = item.linkId ? item.linkId : item.id
         if (props.item.id == itemId) { return i } // will catch first child of a groupItem
      }
      return 0
   }

   const countdown = computed(() => timerCurrSeconds.value && timerCurrSeconds.value <= 3)
   
   const prev = () => { 
      isPlaying.value = false
      transition.value = Slide.RIGHT
      itemIndex.value = itemIndex.value ? itemIndex.value -1 : items.value.length - 1 
   }
   const next = () => { 
      isPlaying.value = false
      advance()
   }
   const advance = () => { 
      transition.value = Slide.LEFT 
      itemIndex.value = itemIndex.value == items.value.length - 1 ? 0 : itemIndex.value + 1 

      const nextIndex = itemIndex.value == items.value.length - 1 ? 0 : itemIndex.value + 1 
      // if (nextIndex) { viewStore.loadImage(items.value[itemIndex.value].primaryImage.url) }  
   }

   const clearTimer = () => { 
      if (timer.value) { 
         clearInterval(timer.value) 
         timer.value = null
      }
   }

   const play = () => { 
      isPlaying.value = true 
      clearTimer() 
      timerCurrSeconds.value = 10

      timer.value = setInterval(() => {
         if (!isPlaying.value) return
         if (timerCurrSeconds.value > 1) { timerCurrSeconds.value -= 1 } 
         else {
            advance()
            timerCurrSeconds.value = 10 
         }
      }, 1000)
   }

   const pause = () => { 
      isPlaying.value = false 
      clearTimer() 
   }

   const onWheel = (event) => {
      event.preventDefault()
      event.stopPropagation()

      if (swipeLocked.value)  { return }
      else {
         swipeLocked.value = true
         setTimeout(() => {
            swipeLocked.value = false
         }, 1500)
      }

      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
         if (event.deltaX > 0) { prev() } 
         else { next() }
      }
      else { emit(Emit.DONE) }
   }

   // dialog listeners added last and executed last - stopImmediatePropagation and return false doesn't stop previous listeners 
   onKeyStroke('ArrowLeft',  (e) => { prev() })
   onKeyStroke('ArrowRight', (e) => { next() })
   onKeyStroke('ArrowUp',    (e) => { emit(Emit.DONE) })
</script>

<style>
.fullscreen-container {
   position: relative;
   min-height: 100vh;
   overflow: hidden;
}
.fullscreen-dimmed {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   object-fit: cover;
   object-position: top; 
   filter: brightness(0.10); 
   z-index: -1;
}
.fullscreen-content {
   position: relative;
   z-index: 1;
   padding: 2rem;
}
.fullscreen-text {
   color: var(--c-link-light)  !important;
}
.fullscreen-text .v-btn {
   color: inherit;
}

.fullscreen-image {
   height: 95vh;
   width: auto;
}

.fullscreen-slider {
  height: 95vh;
  width: 100%;
  overflow: hidden;
}

.slider-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: pan-y; 
}

/* sliding replacement for v-img */
.fullscreen-image-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: contain;  
  background-position: center;
  background-repeat: no-repeat;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.5, 1), opacity 0.6s ease;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
.slide-left .slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left .slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right .slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right .slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
