<template>
   
   <!-- <v-card :width="cardWidth" ref="cardRef"  -->
   
   <v-card :width="cardWidth" @click="toGallery" class="position-relative d-flex flex-column text-center thumb-link" 
         :class="cardMargin" :style="backgroundStyle" style="z-index: 1">
         <v-carousel v-if="galleryImages.length>1" cycle :interval="carouselInterval" :height="carouselHeight"
            hide-delimiters :show-arrows="false" v-on:update:modelValue="setGalleryImageIndex">
            <v-carousel-item v-for="image in galleryImages" :key="image.id">
               <v-img :src="image.thumbUrl" class="pointer"/>
            </v-carousel-item>
         </v-carousel>
         <v-img v-else :src="galleryImage.thumbUrl"/>

      <div v-if="showText" :class="textMargin">
         <div class="text-body-2">
            <span class="font-weight-bold">{{ gallery.name }}</span>
            <span v-if="visibleItemCount" class="ml-1">({{ visibleItemCount }})</span>
         </div>
         <UserDateText :user="fromUser" :date="showDateModified ? gallery.dateContentModified : null" class="text-body-2"/>
      </div>
      <div v-if="addIconRow">&nbsp;</div>
      <div v-if="showIcons" class="position-absolute bottom-0 right-0 hand blue-dk">
         <v-icon v-if="parentIcon" :icon="parentIcon" @click.stop="$emit(Emit.TOGGLE)"/>
         <v-icon v-if="childIcon"  :icon="childIcon"  @click.stop="$emit(Emit.CLOSE)"/>
      </div>
   </v-card>

   <v-dialog v-model="showEditDialog" width="auto">
      <EditGallery :gallery="gallery" @done="showEditDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useWindowSize } from '@vueuse/core'
   import { useIonRouter } from '@ionic/vue'
   import EditGallery  from '@/components/gallery/EditGallery.vue'
   import UserDateText from '@/components/util/UserDateText.vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { thumbBackgroundColorStyle } from '@/utils/utils'
   import { Emit, GalleryThumbMaxWidths as MaxWidths, GalleryThumbOptions, ImageType, Route, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object, showChildImages:Boolean, bypassShowUser:Boolean, 
       parentIcon:String, childIcon:String, size:String, dense:Boolean })
   const emit = defineEmits([ Emit.CLOSE, Emit.TOGGLE ])
   
   const { width: windowWidth } = useWindowSize()
   const ionRouter    = useIonRouter()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const showEditDialog = ref(false)
   const galleryImageIndex = ref(0)

   const thumbSize  = computed(() => props.size ?? (viewMgr.isXs ? viewStore.thumbSize.galleryXsSize : viewStore.thumbSize.gallerySize))
   const showText   = computed(() => thumbSize.value != ThumbSize.IMG)
   const showIcons  = computed(() => showText.value && (props.parentIcon || props.childIcon))
   const addIconRow = computed(() => viewMgr.isXs && showIcons.value)
   const cardWidth = computed(() => viewMgr.isXs ? 
      windowWidth.value * MaxWidths.xsSizes.get(thumbSize.value) :
      MaxWidths.sizes.get(thumbSize.value)
   )
   
   const toGallery = () => { 
      const galleryUrl = Route.GALLERY.url + props.gallery.id
      console.log("toGallery", galleryUrl)
      ionRouter.push(galleryUrl, 'forward')
   }

   const cardMargin  = computed(() => viewMgr.isXs ? "mb-2" : "mb-5")
   const textMargin  = computed(() => props.dense || viewMgr.isXs ? "my-1" : "my-3")

   const carouselHeight   = computed(() => cardWidth * 9 / 16)
   const carouselInterval = computed(() => 4000 + Math.floor(Math.random() * 4000)) // random bet 4-8 secs 
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
</style>
