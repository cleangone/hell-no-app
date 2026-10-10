<template>
<ion-page>
   <ion-content>  
      <DefineTemplate>
         <v-container style="width: 100%" class="mt-3">
            <v-row v-if="descExists && !descInHeader" cols="6" class="d-flex flex-grow-1 flex-shrink-1">
               <div v-html="gallery.desc" class="mb-1 text-left desc-div bg-white"></div>   
            </v-row>
            <v-row v-if="hasChildGalleries" justify="space-around" class="mt-1"> 
               <GalleryThumb v-for="gallery in childThumbGalleries" :key="gallery.id" :gallery="gallery"/>
            </v-row>
            <v-row justify="space-around" class="pt-4">
               <ItemThumb v-for="item in galleryItems" :key="item.id" :item="item" :origin="ItemOrigin.GALLERY"
                  :useAltName="gallery.useAltItemName" :useLocalName="gallery.useLocalItemName" :tight="viewMgr.isMobile"/>
            </v-row>
         </v-container>
      </DefineTemplate>

      <!-- header -->
      <div class="scrolling-header-container">
         <ion-toolbar class="custom-scrolling-toolbar">
            <ion-buttons slot="start"><BackButton/></ion-buttons>
            <ion-title class="text-center text-h6">{{ galleryName }} Gallery</ion-title>
            <ion-buttons slot="end">
               <ThumbSizeButton/>
               <ItemThumbConfig/>
            </ion-buttons>
         </ion-toolbar>
      </div>
      <div v-if="viewMgr.isMobile">
         <div class="content-wrapper mt-1" :style="contentStyle">
            <img v-if="backgroundImage" :src="backgroundImage.url" class="background" :style="backgroundStyle"/>
            <div class="content">
               <div style="clear:both"></div>
               <PlayItems v-if="!viewMgr.isXs" :items="galleryItems"/>
               <GalleryParentLink :gallery="gallery" style="text-align: center; display: block; width: 100%;"/>
               <ReuseTemplate/>
            </div>
         </div>
      </div>
      <div v-else> 
         <div class="content-wrapper mt-1" :style="contentStyle">
            <img v-if="backgroundImage" :src="backgroundImage.url" class="background" :style="backgroundStyle"/>
            <div class="content">
               <div style="clear:both"></div>
               <!-- title -->
               <v-container class="pa-0 width-100">
                  <v-row no-gutters class="d-flex align-center flex-nowrap">
                     <v-col cols="2" class="d-flex justify-start flex-grow-0 flex-shrink-0">
                        <UserLinkAvatar v-if="!isSolo" :user="user"/>
                     </v-col>
                     <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
                        <div class="title">{{ galleryName }} Gallery</div>
                        <GalleryParentLink :gallery="gallery" style="text-align:center"/>
                     </v-col>
                     <v-col cols="2" class="d-flex justify-end align-center flex-grow-0 flex-shrink-0 ">
                        <PlayItems :items="galleryItems" :backgroundImage="backgroundImage" buttonClass="mr-2"/>
                        <ThumbSizeButton class="mx-n1"/>
                        <CopyLink :route="Route.GALLERY.name" :id="galleryId"/>
                        <ItemThumbConfig/>
                        <EditButton v-if="canEdit" @click="showEditGalleryDialog=true" class="mx-n2"/>
                     </v-col>
                  </v-row>
               </v-container>
               <!-- header and content below or beside -->
               <div v-if="headerImage" :class="verticalHeader?'horizontal-container':''">
                  <div class="bg-white mb-20">
                     <RouterLink :to="itemMgr.itemURL(headerImage.itemId, ItemOrigin.GALLERY)">
                        <!-- no description in vertical headers  -->
                        <v-img v-if="verticalHeader" :src="headerImage.url" width="400"/>
                        <v-img v-else :src="headerImage.url" cover max-height="300" class="mb-5">
                           <div v-if="descExists && descInHeader" class="pa-1 d-flex fill-height align-end justify-end">
                              <div v-html="gallery.desc" class="text-left desc-header-div" :style="headerDescStyle"></div>   
                           </div>
                        </v-img>
                     </RouterLink>
                  </div> 
                  <div><ReuseTemplate/></div>
               </div>
               <!-- content w/o header -->
               <div v-else>
                  <ReuseTemplate/>
               </div>
            </div>
         </div>
      </div>
   

   <v-dialog v-model="showEditGalleryDialog" width="75%" height="90%">
      <EditGalleryCard :gallery="gallery" @done="showEditGalleryDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showAddItemDialog" width="auto">
      <AddItemDialog :gallery="gallery" @done="showAddItemDialog=false"/>
   </v-dialog>
</ion-content>
</ion-page>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useRoute, useRouter } from 'vue-router'
   import { onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue'
   import { createReusableTemplate, useWindowSize } from '@vueuse/core'   
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import GalleryParentLink   from './GalleryParentLink.vue'
   import GalleryThumb        from '@/components/gallery/thumb/GalleryThumb.vue'
   import EditGalleryCard     from '@/components/gallery/EditGalleryCard.vue'
   import PlayItems           from '@/components/item/PlayItems.vue'
   import AddItemDialog       from '@/components/item/crud/AddItemDialog.vue'
   import ItemThumb           from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig     from '@/components/item/thumb/ItemThumbConfig.vue'
   import UserLinkAvatar      from '@/components/user/avatar/UserLinkAvatar.vue'
   import EditButton          from '@/components/util/EditButton.vue'
   import CopyLink            from '@/components/util/CopyLink.vue'
   import ThumbSizeButton     from '@/components/util/ThumbSizeButton.vue'
   import { objAspectRatio } from '@/utils/utils'
   import { ImageType, ItemOrigin, Route } from '@/utils/constants'
  
   const route = useRoute()
   const router = useRouter()
   const { height: windowHeight } = useWindowSize()
   const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const isPageActive          = ref(false)
   const showEditGalleryDialog = ref(false)
   const showAddItemDialog     = ref(false)

   onMounted(async() => {
      // console.log("GalleryView.onMounted")
      if (!viewStore.isInitialized) {
         console.log("GalleryView - external/direct link")
         viewMgr.init()
      }
   })

   onIonViewWillEnter(() => {
      console.log("galleryView onIonViewWillEnter")
      isPageActive.value = true
   })
   onIonViewWillLeave(() => {
      console.log("galleryView onIonViewWillLeave")
      isPageActive.value = false
   })

   const props = defineProps({ id: String })
   
   const gallery = computed(() => { 
      const gallery = galleryStore.getGallery(props.id) 
      // console.log("GalleryView - gallery", gallery)
      if (!gallery) { return null }  // galleryStore has not intiailized yet

      if (!viewMgr.galleryIsVisibleToUser(gallery)) { router.push(Route.HOME.url) }
      return gallery 
   })
      
   const contentStyle      = computed(() => "min-height:" + windowHeight.value + "px;")
   const galleryId         = computed(() => gallery.value ? gallery.value.id : "")
   const galleryName       = computed(() => gallery.value ? gallery.value.name : "")
   const descExists        = computed(() => gallery.value?.desc?.length > 0)
   const descInHeader      = computed(() => gallery.value?.descInHeader)
   const headerDescStyle   = computed(() => "width:" + (gallery.value.descHeaderPct ? gallery.value.descHeaderPct : "60") + "%")
   const hasChildGalleries = computed(() => gallery.value?.childGalleryIds?.length > 0)

   const childThumbGalleries = computed(() => { 
      const galleries = []
      for (const childGalleryId of gallery.value.childGalleryIds) {
         const childGallery = galleryStore.getGallery(childGalleryId)
         if (viewMgr.galleryIsVisibleToUser(childGallery) && childGallery.images.length ) { galleries.push(childGallery) }
      }
      return galleries
   })

   const isSolo          = computed(() => viewMgr.solo)
   const userId          = computed(() => gallery.value ? gallery.value.userId : null)
   const user            = computed(() => userId.value ? userStore.getUser(userId.value) : null)
   const canEdit         = computed(() =>  userStore.userId && userStore.userId == userId.value)
   const backgroundStyle = computed(() => "opacity: .05;") // make this configurable?
   const backgroundImage = computed(() => getImage(ImageType.BACKGROUND))
   const verticalHeader  = computed(() => headerImage.value?.dimensions && objAspectRatio(headerImage.value.dimensions) < 1)
   const headerImage     = computed(() => getImage(ImageType.HEADER))
   const getImage = (imageType)  => {
      // if (viewMgr.isMobile || !gallery.value) { return null } // gallery may not be populated yet
      if (!gallery.value) { return null } // gallery may not be populated yet
      for (const image of gallery.value.images) {
         if (image.active && image.imageType == imageType) { return image }
      }
      return null
   }
   
   const galleryItems = computed(() => { 
      console.log("galleryItems", props.id)
      if (!isPageActive.value) {
         console.log("page inactive", props.id)
         return []
      }

      const displayItems = []
      const galleryItemIds = gallery.value?.itemIds ?? []
      for (const item of itemStore.getGalleryItems(galleryId.value)) {
         if (viewMgr.itemThumbVisibleToUser(item)) {
            const displayItem = { ...item, position: galleryItemIds.indexOf(item.id) + 1 }  
            setLocalName(displayItem) 
            displayItems.push(displayItem) 
         }
      }
   
      displayItems.sort(function(a, b) {return a.position - b.position}) 
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(displayItems) : displayItems
      viewStore.setVisibleItems(ItemOrigin.GALLERY, galleryName.value + " Gallery", Route.GALLERY.url + props.id, ungroupedItems, props.id)
      
      return displayItems
   })

   const setLocalName = (displayItem) => { 
      if (gallery.value.useLocalItemName) {
         displayItem.localName = gallery.value.useAltItemName && displayItem.alternateName?.length ? displayItem.alternateName : displayItem.name
         if (gallery.value.itemThumbPrefix?.length && displayItem.localName.startsWith(gallery.value.itemThumbPrefix)) {
            displayItem.localName = displayItem.localName.substring(gallery.value.itemThumbPrefix.length)
            if (gallery.value.itemThumbPrefixReplace?.length) {
               displayItem.localName = gallery.value.itemThumbPrefixReplace + displayItem.localName 
            }
            else { // capitalize first letter
               displayItem.localName = displayItem.localName.charAt(0).toUpperCase() + displayItem.localName.slice(1)
            }
         }
      }     
   }
</script>

<style>
.desc-div {
   border: 2px solid rgb(179, 177, 177);
   border-radius: 5px;
   padding: 10px; 
   width: 100%;
}

.desc-header-div {
   border: 2px solid rgb(179, 177, 177);
   border-radius: 5px;
   padding: 10px; 
   background-color: var(--color-header-text-background);
   color: black;
}
.content-wrapper {
  overflow: hidden;
  position: relative;
}
.background {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
}
.content {
  position: relative;
}
</style>
