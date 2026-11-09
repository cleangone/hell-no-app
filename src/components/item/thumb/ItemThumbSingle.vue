<template>
   <v-card :width="cardWidth" @click="toItem" style="z-index: 1" :style="cardStyle" 
         :class="cardClass" class="d-flex flex-column text-center thumb-container thumb-link">
      <div ref="imageEleRef" class="image-wrapper">
         <CachedImg :src="thumbUrl" class="target-image"/>
      </div>
      <ItemThumbText v-if="showText" :item="item" :origin="origin" :useAltName="useAltName" :useLocalName="useLocalName" 
         :bypassShowUser="bypassShowUser" :showDateViewed="showDateViewed"/>
      <teleport to="body">
         <transition name="fade">
            <div v-if="showInfoBox" @click.stop class="global-floating-info-box" 
                  :style="{ top:infoRect.top + 'px', left:infoRect.left + 'px', width:'200px' }">
               <div class="info-content-card">
                  <div class="text-center font-weight-bold">{{ item.name }}</div>
                  <p>{{ item.primaryArtist?.fullName }}</p>
                  <p>{{ item.yearCreated }}</p>
               </div>
            </div>
         </transition>
      </teleport>
   </v-card>
</template>

<script setup>
   import { computed, onUnmounted, ref, watch } from 'vue'
   import { useWindowSize } from '@vueuse/core'
   import { createGesture, useIonRouter } from '@ionic/vue'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemThumbText    from './ItemThumbText.vue'
   import CachedImg        from '@/components/image/CachedImg.vue'
   import { thumbBackgroundColorStyle } from '@/utils/utils'
   import { ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ 
      item: Object, origin: String, size: String, useAltName: Boolean, useLocalName: Boolean, 
      bypassShowUser:Boolean, showDateViewed:Boolean, emitPopup: Boolean })
   
   const { width: windowWidth } = useWindowSize()
   const ionRouter = useIonRouter()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const imageEleRef = ref(null)
   const showInfoBox = ref(false)
   const infoRect    = ref({ top: 0, left: 0 })

   let gesture = null
   let pressTimer = null
   watch(imageEleRef, (el) => {
      if (!el) return
      if (gesture) gesture.destroy()
      gesture = createGesture({
         el: el,
         gestureName: 'image-long-press',
         threshold: 0,
         onStart: () => {
            pressTimer = setTimeout(() => {
               if (imageEleRef.value) {
                  const imageRect = imageEleRef.value.getBoundingClientRect()
                  infoRect.value = { 
                     top: imageRect.top + 20, 
                     left: imageRect.right<windowWidth.value/2 ? imageRect.right + 20 : imageRect.left - 220
                  }
               }
               showInfoBox.value = true
            }, 500)
         },
         onMove: (ev) => {
            if (Math.abs(ev.deltaX) > 10 || Math.abs(ev.deltaY) > 10) {
               clearTimeout(pressTimer)
            }
         },
         onEnd: () => {
            clearTimeout(pressTimer)
            showInfoBox.value = false
         }
      })

      gesture.enable(true)
   }, { immediate: true })

   onUnmounted(() => {
      clearTimeout(pressTimer)
      if (gesture) gesture.destroy()
   })

   const item    = computed(() => props.item)
   const itemURL = computed(() => {   
      const id = props.item.linkId ? props.item.linkId : props.item.id
      return itemMgr.itemURL(id, props.origin, props.item.childNum)
   })
   const thumbUrl  = computed(() => item.value.primaryImage.thumbUrl)
   const thumbSize = computed(() => props.size ?? (viewMgr.isXs ? viewStore.thumbSize.xsSize : viewStore.thumbSize.size))
   const showText  = computed(() => thumbSize.value != ThumbSize.IMG)
   const cardClass = computed(() => (showText.value ? "mb-5" : "mb-2") + (thumbSize.value == ThumbSize.IMG ? "" : " pa-1")) 
   const cardStyle = computed(() => thumbBackgroundColorStyle(props.item))
   const cardWidth = computed(() => itemMgr.getItemWidth(item.value, 
                                       viewMgr.getTargetThumbHeight(thumbSize.value), 
                                       viewMgr.getItemMaxLandscapeWidth(thumbSize.value))) 
                                          
   const toItem = () => { ionRouter.push(itemURL.value) }
</script>

<style>
.thumb-container {
   position: relative;
}

.image-wrapper {
   width: 100%;
   touch-action: pan-y;
   -webkit-touch-callout: none;
   user-select: none;
}
.target-image {
   width: 100%;
   display: block;
}
.global-floating-info-box {
   position: fixed;
   z-index: 99999;
   pointer-events: none; /* Lets clicks pass through blank space */
}
.info-content-card {
   pointer-events: auto; /* Re-enables clicks for buttons inside */
   background: rgba(0, 0, 0, 0.9);
   color: #ffffff;
   padding: 16px;
   border-radius: 8px;
   box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
   backdrop-filter: blur(4px);
}

.fade-enter-active, .fade-leave-active {
   transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
   opacity: 0;
}
</style>
