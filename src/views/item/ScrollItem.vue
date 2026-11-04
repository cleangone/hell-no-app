<template>
   <DefineTemplate> <!-- item info beside or below image -->
      <div class="text-left mt-2">
         <ItemArtistYear :item="props.item"/>
      </div>
      <div v-html="props.item.desc" class="mr-3"></div>
   </DefineTemplate> 

   <div v-if="!viewMgr.isXs">
      <IconButton :icon="descBeside?'mdi-image':'mdi-image-text'" @click="toggleDescBeside()"/>
      <ExpandItems :item="props.item" :items="props.items" buttonClass="ExpandItems"/>    
   </div>     
   <div class="w-100 mx-1">
      <v-row>
         <!-- complex layout becasue want one permanenet swipeEle -->
         <v-col :cols="descBeside ? 8 : 12"> 
            <CachedImg ref="swipeEle" :src="imageUrl(props.item.primaryImage)"  
               @click="toggleDescBeside()" contain/>
         </v-col>
         <v-col v-if="descBeside"><ReuseTemplate/></v-col>
      </v-row>
      <div v-if="!descBeside">
         <ReuseTemplate/>
      </div>
   </div>
</template>

<script setup>
   import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
   import { createReusableTemplate } from '@vueuse/core'
   import { createGesture } from '@ionic/vue'
   import { useItemMgr }    from '@/stores/itemMgr'
   import { useViewStore }  from '@/stores/viewStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import CachedImg         from '@/components/image/CachedImg.vue'
   import ExpandItems       from '@/components/item/ExpandItems.vue'
   import ItemArtistYear    from '@/components/item/ItemArtistYear.vue'
   import IconButton        from '@/components/util/IconButton.vue'

   const props = defineProps({ item: Object, items: Array, swipe: Boolean })

   const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const swipeEle  = ref(null)
   const gesture   = ref(null)

   onUnmounted(() => {
      if (gesture.value) { gesture.value.destroy() }
   })

   watch(swipeEle, (ele) => {
      if (ele && props.swipe) {
         if (gesture.value) { gesture.value.destroy() }

         gesture.value = createGesture({
            el: ele,
            gestureName: 'horizontal-swipe',
            direction: 'x',
            canStart: (detail) => { return Math.abs(detail.deltaX) > Math.abs(detail.deltaY) },
            // onStart: (detail) => { },
            // onMove: (detail) => { console.log("deltaX", detail.deltaX) },
            onEnd: (ev) => {
               if (ev.deltaX > 50) { prev() } 
               else if (ev.deltaX < -50) { next() }
            }
         })
         gesture.value.enable(true)
      }
   }, { immediate: true })

   const descBeside = computed(() => !viewMgr.isXs && viewStore.itemDescBesideImage)
   const imageUrl = (image) => { return itemMgr.mobileImageUrl(image) }
   const toggleDescBeside = () => { if (!viewMgr.isXs) { viewStore.toggleItemDescBesideImage() }}
</script>

<style>
.no-pointer-events {
   pointer-events: none;
}
.swipe-box {
  width: 100%;
  height: 150px;
  background: var(--ion-color-step-150, #f0f0f0);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
</style>
