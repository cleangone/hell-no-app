<template>
   <v-card :width="cardWidth" @click="toGallery" class="position-relative d-flex flex-column text-center thumb-link" 
         :class="cardMargin" :style="backgroundStyle" style="z-index: 1">
      <div :style="{height:`${carouselHeight}px`}" class="position-relative">
         <v-carousel v-if="galleryImages.length>1" cycle :interval="carouselInterval" :height="carouselHeight"
               hide-delimiters :show-arrows="false" v-on:update:modelValue="setGalleryImageIndex">
            <v-carousel-item v-for="image in galleryImages" :key="image.id">
               <CachedImg :src="image.thumbUrl" class="h-100 w-100"/>
            </v-carousel-item>
         </v-carousel>
         <CachedImg v-else :src="galleryImage.thumbUrl" class="h-100 w-100"/>
            
         <div v-if="isParent || isChild" class="position-absolute bottom-0 right-0">
            <v-icon v-if="isParent" icon="mdi-folder-image" @click.stop="$emit(Emit.TOGGLE)" 
               style="background-color:white" class="icon-rounded admin-link mr-1 mb-1"/>
            <v-icon v-if="isChild"  icon="mdi-close-circle"  @click.stop="$emit(Emit.CLOSE)" 
               style="background-color:white" class="icon-circle admin-link mr-1 mb-1"/>
         </div>
      </div>
      <div v-if="showText" :class="textMargin">
         <div class="text-body-2">
            <span :class="nameClass">{{ name }}</span>
            <span v-if="visibleItemCount" class="ml-1">({{ visibleItemCount }})</span>
         </div>
         <UserDateText :user="fromUser" :date="showDateModified ? gallery.dateContentModified : null" class="text-body-2"/>
      </div>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useWindowSize } from '@vueuse/core'
   import { useIonRouter } from '@ionic/vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import UserDateText from '@/components/util/UserDateText.vue'
   import CachedImg    from '@/components/image/CachedImg.vue'
   import { thumbBackgroundColorStyle } from '@/utils/utils'
   import { Emit, GalleryThumbMaxWidths as MaxWidths, GalleryThumbOptions, ImageType, Route, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ 
      gallery: Object, showChildImages: Boolean, bypassShowUser: Boolean, 
      isParent: Boolean, isChild: Boolean, size: String })
   const emit = defineEmits([ Emit.CLOSE, Emit.TOGGLE ])
   
   const { width: windowWidth } = useWindowSize()
   const ionRouter    = useIonRouter()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const galleryImageIndex = ref(0)

   const thumbSize  = computed(() => props.size ?? (viewMgr.isXs ? viewStore.thumbSize.galleryXsSize : viewStore.thumbSize.gallerySize))
   const showText   = computed(() => thumbSize.value != ThumbSize.IMG)
   const cardWidth  = computed(() => viewMgr.isXs ? 
      windowWidth.value * MaxWidths.xsSizes.get(thumbSize.value) :
      MaxWidths.sizes.get(thumbSize.value)
   )
   
   const toGallery = () => { 
      const galleryUrl = Route.GALLERY.url + props.gallery.id
      ionRouter.push(galleryUrl)
   }

   const smallThumb       = computed(() => thumbSize.value == ThumbSize.SM)
   const cardMargin       = computed(() => viewMgr.isXs ? "mb-2" : "mb-4")   
   const textMargin       = computed(() => viewMgr.isXs && smallThumb.value ? "my-1" : "my-2")
   const carouselHeight   = computed(() => cardWidth.value * 9 / 16)
   const carouselInterval = computed(() => 4000 + Math.floor(Math.random() * 4000)) // random bet 4-8 secs 
   const name             = computed(() => smallThumb.value && props.gallery.shortName ? props.gallery.shortName : props.gallery.name)
   const nameClass        = computed(() => smallThumb.value ? "text-caption" : "font-weight-bold")
   const visibleItemCount = computed(() => viewMgr.galleryItemCount(props.gallery))
   const showUser         = computed(() => !props.bypassShowUser && viewStore.galleryThumbOptions.includes(GalleryThumbOptions.USER))
   const showDateModified = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.UPDATED))
  
   const fromUser = computed(() => { 
      return showUser.value ? { id: props.gallery.userId, name: userStore.getUsername(props.gallery.userId) } : null
   }) 

   // todo - this only goes down one level
   const childGalleryImages = computed(() => { 
      const images = []
      for (const childGalleryId of props.gallery.childGalleryIds) {
         const childGallery = galleryStore.getGallery(childGalleryId)
         if (childGallery.images.length && viewMgr.galleryIsVisibleToUser(childGallery)) { images.push(...childGallery.images) }
      }
      return images
   })

   const galleryImages = computed(() => { 
      const images = []
      const allImages = [ ...props.gallery.images ]
      if (props.showChildImages) { allImages.push(...childGalleryImages.value) }
      for (const image of allImages) {
         if (image.active && (!image.imageType || image.imageType == ImageType.GALLERY)) { images.push(image) }
      }
      if (!images.length) images.push(props.gallery.images[0]) 
      return images
   })

   const setGalleryImageIndex = (index) => { galleryImageIndex.value = index }
   const galleryImage = computed(() => { 
      // galleryImageIndex can be invalid if showChildImages toggle reduces number of images
      if (galleryImageIndex.value > galleryImages.value.length-1) { galleryImageIndex.value = 0 }
      return galleryImages.value[galleryImageIndex.value]
   })

   const backgroundStyle = computed(() => thumbBackgroundColorStyle(props.gallery))
</script>

<style>
.icon-rounded {
  border-radius: 3px;
  padding: 4px;
}
.icon-circle {
  border-radius: 50%;
  padding: 4px;
}
</style>
