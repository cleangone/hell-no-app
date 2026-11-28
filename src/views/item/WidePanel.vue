<template>
   <!-- item info beside or below image -->
   <DefineTemplate> 
      <div v-if="alternateName" class="mt-n2">
         also <span class="text-h5">{{ alternateName }}</span>
      </div>
      <div v-if="primaryArtist" class="text-h6 mt-n2">
         <RouterLink :to="Route.ARTIST.url + primaryArtist.id">
            {{ artistName(primaryArtist) }}<span class="text-subtitle-1">{{ artistRole(primaryArtist) }}</span>
         </RouterLink> 
      </div>
      <div v-if="otherArtists" class="text-h6">
         <v-row no-gutters>
            <span v-for="(artist, index) in otherArtists" :key="artist.id" class="mt-n2"> 
               <RouterLink :to="Route.ARTIST.url + artist.id">
                  {{ artistName(artist) }}<span class="text-subtitle-1">{{ artistRole(artist) }}</span>
               </RouterLink>
               <template v-if="index!=otherArtists.length-1">, </template>
            </span>
         </v-row>
      </div>
      <div v-if="paramItem.yearCreated" class="text-h6 mt-n2">{{ paramItem.yearCreated }}</div>
      <div v-if="populated(paramItem.subtitle)" class="font-weight-medium mb-1">{{ paramItem.subtitle }}</div>
      <div v-if="paramItem.size" class="mt-n2">{{ paramItem.size }}</div>
      <div v-if="itemUser" class="mt-n1">
         From <RouterLink :to="Route.USER.url + fromUser.id">{{ fromUser.username }}</RouterLink> 
         <EmailButton v-if="!isOwnedByUser" :user="itemUser" :item="paramItem"/>
      </div>
      <div v-if="!isPublic(paramItem)">
         <div v-if="isGroup(paramItem)">
            <span v-if="groups.length">via <GroupNameLinks :groups="groups"/></span>
         </div> 
         <span v-else>{{ paramItem.state }}</span>
      </div>
      <div v-html="paramItem.desc" class="mt-3 mb-1"></div>
   </DefineTemplate>

   <div class="content-wrapper mt-1">
      <img v-if="backgroundImage" :src="backgroundImage.url" class="background" :style="backgroundStyle"/>
      <div class="content">
         <div style="clear:both"></div>

         <!-- image with info beside or below-->
         <div style="position:relative" class="text-left w-100 mx-3">  
            <IconButton :icon="descBeside?'mdi-image':'mdi-image-text'" @click="viewStore.toggleItemDescBesideImage()" class="mx-n1"/>
            <ExpandItems :items="viewStoreItems" :item="paramItem" :backgroundImage="backgroundImage" :buttonClass="EXPAND_ITEMS_CLASS"/>
            <IconButton v-if="userStore.userExists" :icon="isUserFavorite?'mdi-heart':'mdi-heart-plus-outline'" @click="toggleUserFavorite()" class="mx-n2"/>
            <v-row class="w-100">
               <v-col :cols="descBeside ? 8 : 12">
                  <div v-if="isItemGroup(paramItem)" @click="viewStore.toggleItemDescBesideImage()" class="center d-flex justify-center" style="width: 100%">
                     <div class="d-flex align-center bg-black">
                        <img v-if="paramItem.childItems.length" :src="paramItem.childItems[0].primaryImage.url" 
                           :width="childItemTargetWidth(0)" class="first-image" :class="imageClass"/>
                        <img v-if="paramItem.childItems.length > 1" :src="paramItem.childItems[1].primaryImage.url" 
                           :width="childItemTargetWidth(1)" class="next-image" :class="imageClass"/> 
                        <img v-if="paramItem.childItems.length > 2" :src="paramItem.childItems[2].primaryImage.url" 
                           :width="childItemTargetWidth(2)" class="next-image" :class="imageClass"/>
                     </div>
                  </div>
                  <v-img v-else :src="paramItem.primaryImage.url" contain :max-width="imageWidth" 
                     @click="viewStore.toggleItemDescBesideImage()" :class="imageClass"/>
                  <div v-if="!descBeside" class="mt-5">
                     <div v-if="additionalImages.length" class="bg-shade mb-5">
                        <v-row class="mx-3">
                           <div v-for="additionalImage in additionalImages" :key="additionalImage.id" class="py-3 px-1">
                              <div class="text-center pointer">
                                 <v-img :src="additionalImage.url" @click="showAdditionalImages(additionalImage)" contain :width="75"/>
                                 {{ additionalImage.name }}
                              </div>
                           </div>
                        </v-row>
                     </div>
                     <div class="text-left">
                        <ReuseTemplate/>
                     </div>
                  </div>
               </v-col> 
               <v-col v-if="descBeside && additionalImages.length" cols="1" class="bg-shade my-3">
                  <div v-for="additionalImage in additionalImages" :key="additionalImage.id" class="pb-4 pointer text-center">      
                     <v-img :src="additionalImage.url" @click="showAdditionalImages(additionalImage)" contain :width="100"/>
                     {{ additionalImage.name }}
                  </div>    
               </v-col>
               <v-col v-if="descBeside">
                  <ReuseTemplate/>
               </v-col>
            </v-row>
         </div>
      </div>
   </div>
   
   <v-dialog v-model="showItemImagesDialog" width="auto">
      <ShowItemImages :initialImage="selectedImage" :item="selectedItem" @done="showItemImagesDialog=false"/>
   </v-dialog>   
   <v-dialog v-model="showItemGroupImagesDialog" width="auto">
      <ShowItemGroupImages :initialItem="selectedItem" :parentItem="paramItem" @done="showItemGroupImagesDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRouter } from 'vue-router'
   import { createReusableTemplate, onKeyStroke, useWindowSize } from '@vueuse/core'
   import { useUserStore }    from '@/stores/userStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGroupStore }   from '@/stores/groupStore'
   import { useWallStore }    from '@/stores/wallStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'

   import ItemGroupSmThumb    from '@/components/item/ItemGroupSmThumb.vue'
   import ExpandItems         from '@/components/item/ExpandItems.vue'
   import PlayItems           from '@/components/item/PlayItems.vue'
   import ShowItemImages      from '@/components/item/ShowItemImages.vue'
   import ShowItemGroupImages from '@/components/item/ShowItemGroupImages.vue'
   import EmailButton         from '@/components/email/EmailButton.vue'
   import GroupNameLinks      from '@/components/group/GroupNameLinks.vue'
   import UserLinkAvatar      from '@/components/user/avatar/UserLinkAvatar.vue'
   import BackButton          from '@/components/util/BackButton.vue'  
   import CopyLink            from '@/components/util/CopyLink.vue'
   import EditButton          from '@/components/util/EditButton.vue'
   import Header              from '@/components/util/Header.vue'
   import IconButton          from '@/components/util/IconButton.vue'
   import { isOwned, isGroup, isPublic, populated, toSortedNameAsc } from '@/utils/utils'
   import { ImageType, ItemNavAction, ItemOrigin, Route } from '@/utils/constants'

   const EXPAND_ITEMS_CLASS = "ExpandItems"
   const AdditionalImagesType = { ITEM: 'item', IMAGE: 'image' }
   const router = useRouter()
   const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
   const userStore    = useUserStore()
   const itemMgr      = useItemMgr()
   const galleryStore = useGalleryStore()
   const groupStore   = useGroupStore()
   const wallStore    = useWallStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const showNav = ref(true)
   const { width: windowWidth } = useWindowSize()
   const showItemImagesDialog      = ref(false)
   const showItemGroupImagesDialog = ref(false)
   const showEditDialog            = ref(false)
   const selectedItem  = ref(null)
   const selectedImage = ref(null)

   const props = defineProps({ item: Object, origin: String, nav: String, child: String })

   const paramItem = computed(() => props.item)
   const additionalImages = computed(() => {
      console.log("paramItem", paramItem.value)

      const images = []
      if (isItemGroup(paramItem.value)) { 
         for (const childItem of paramItem.value.childItems) {
            images.push({ id:childItem.id, type:AdditionalImagesType.ITEM, url:childItem.primaryImage.thumbUrl, item:childItem })
         }
      }
      else { 
         for (const image of paramItem.value.otherImages) {
            if (image.showWithItem) {
               const additionalImage = { 
                  id:image.id, type:AdditionalImagesType.IMAGE, url:image.thumbUrl, name:image.name, image:image }
               if (!additionalImage.name) {
                  additionalImage.name = wallStore.myWallIncludesImage(image.id) ? "Wall" : image.imageType 
               }
               images.push(additionalImage)
            }
         }
      }
      return images
   })

   const alternateName = computed(() => paramItem.value.alternateName?.length ? paramItem.value.alternateName : null)
   const itemUser      = computed(() => viewMgr.solo ? null : userStore.getUser(paramItem.value.userId)) 
   const descBeside    = computed(() => viewStore.itemDescBesideImage)
   const primaryArtist = computed(() => paramItem.value.primaryArtist) 
   const otherArtists  = computed(() => paramItem.value.otherArtists) 
   const groups        = computed(() => groupStore.myGroups.filter(group => paramItem.value.groupIds.includes(group.id)))

   const backgroundStyle = computed(() => "opacity: .05;") // make this configurable?
   const backgroundImage = computed(() => {
      let gallery = originGallery.value
      if (!gallery && singleOtherGallery.value) { gallery = otherGalleries.value[0] }
      if (gallery && gallery.shareBackground) {
         for (const image of gallery.images) {
            if (image.active && image.imageType == ImageType.BACKGROUND) { return image }
         }
      }
      return null
   })

   const fromUser = computed(() => {
      const from = { id: paramItem.value.userId, username: (itemUser.value ? itemUser.value.username : null) }
      return from
   })

   const originGalleryId = computed(() => originGallery.value ? originGallery.value.id : null)
   const originGallery = computed(() => {  
      let linkId = props.origin == ItemOrigin.GALLERY ? viewStoreVisibleItems.value?.linkId : null
      
      return linkId ? galleryStore.getGallery(linkId) : null
   })

   const singleOtherGallery     = computed(() => otherGalleries.value.length == 1)
   const multipleOtherGalleries = computed(() => otherGalleries.value.length > 1)
   const otherGalleries = computed(() => {  
      const galleries = []
      for (const galleryId of paramItem.value.galleryIds) {
         const gallery = galleryStore.getGallery(galleryId)
         if (gallery && gallery.id != originGalleryId.value && viewMgr.galleryThumbVisibleToUser(gallery)) { galleries.push(gallery) }
      }
      galleries.sort(function(a, b){return a.name.localeCompare(b.name)}) 
      return galleries
   })


   const showAdditionalImages = (additionalImage) => { 
      if (additionalImage.type == AdditionalImagesType.ITEM) { showItem(additionalImage.item) }
      else { showImage(additionalImage.image) }
   }

   const showItem  = (item)  => { showDialog(showItemGroupImagesDialog, item) }
   const showImage = (image) => { showDialog(showItemImagesDialog, paramItem.value, image) }
   const showDialog = (dialog, item, image) => { 
      selectedItem.value  = item 
      selectedImage.value = image 
      dialog.value = true
   }
   
   const viewStoreVisibleItems = computed(() => showNav.value ? viewStore.getVisibleItems(props.origin) : null)
   const viewStoreItems = computed(() => viewStoreVisibleItems.value ? viewStoreVisibleItems.value.items : [])
   
   const isItemGroup  = (item) => { return itemMgr.isItemGroup(item) }
   const isOwnedByUser = computed(() => isOwned(paramItem.value, userStore.userId))
   const prevItemUrl = computed(() => itemMgr.itemNavURL(linkId(navItems.value.prev), props.origin, ItemNavAction.PREV, navItems.value.prev.childNum))
   const nextItemUrl = computed(() => itemMgr.itemNavURL(linkId(navItems.value.next), props.origin, ItemNavAction.NEXT, navItems.value.next.childNum))
   const linkId     = (item)      => { return item.linkId ? item.linkId : item.id }
   const galleryUrl = (galleryId) => { return Route.GALLERY.url + galleryId }
   
   const imageWidth = computed(() => { return paramItem.value?.primaryImage?.dimensions ? paramItem.value.primaryImage.dimensions.width : 500 })
   const imageClass = computed(() => "pointer" )
   
   const artistName = (artist) => { return artist.fullName }
   const artistRole = (artist) => { return (artist.role ? " - " + artist.role : "") }
   
   const navItems = computed(() => { 
      for (let i=0; i<viewStoreItems.value.length; i++) {
         const viewStoreItem = viewStoreItems.value[i]
         // console.log("viewStoreItem", linkId(viewStoreItem), viewStoreItem.childNum)

         // can be a link to the groupItem
         if (viewStoreItem.id == props.item.id ||
             viewStoreItem.linkId == props.item.id && 
               (props.child == null || props.child == viewStoreItem.childNum)) 
         {
            let prev = i > 0 ? viewStoreItems.value[i-1] : null
            let next = i < viewStoreItems.value.length - 1 ? viewStoreItems.value[i+1] : null
         
            // preload next image (prev probably already been displayed)
            if (next) { 
               if (isItemGroup(next)) {
                  for (const childItem of next.childItems) {
                     viewStore.loadImage(childItem.primaryImage.url)
                  }
               }
               else { viewStore.loadImage(next.primaryImage.url) } 
            }
         
            return { prev: prev, next: next }
         } 
      }
      return { }
   })

   const navItemWidth = (item, targetHeight) => { 
      const aspectRatio = itemMgr.itemAspectRatio(item)
      const targetWidth = aspectRatio ? Math.round(targetHeight * aspectRatio) : 60 // get width for specified height
      return targetWidth.toString()
   }

   const childItemsTotalWidth = computed(() => { 
      let totalWidth = 0
      if (isItemGroup(paramItem.value)) {
         for (const childItem of paramItem.value.childItems) {
            totalWidth += childItem.primaryImage.dimensions.width
         }
      }
      return totalWidth
   })

   const childItemTargetWidth = (index) => {
      const pct = descBeside.value ? .65 : 1
      const totalTargetWidth = (windowWidth.value -100) * pct
      const childTargetWidth =  
         Math.round(totalTargetWidth * paramItem.value.childItems[index].primaryImage.dimensions.width / childItemsTotalWidth.value)
      return childTargetWidth
   }
</script>

<style>
.center {
   display: block;
   margin-left: auto;
   margin-right: auto;
}
.smThumbRow {
   height: 140px;
}
.first-image {
   border: 4px solid black; 
   float: left;
}
.next-image {
   border-top:    4px solid black; 
   border-bottom: 4px solid black; 
   border-right:  4px solid black; 
   float: left;
}
.prevLink {
   min-width: 5em;
   display: inline-block;
   text-align: right;
   margin-right: 3px;
}
.nextLink {
   min-width: 5em;
   display: inline-block;
   text-align: left;
   margin-left: 3px;
}
</style>
