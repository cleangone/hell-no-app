import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useWindowSize } from '@vueuse/core'
import { useItemStore }  from '@/stores/itemStore'
import { useHitStore }   from '@/stores/hitStore'
import { objAspectRatio, randomizeArray, toSortedDateContentModifiedDesc, toSortedDateViewedDesc } from '@/utils/utils'
import { Defaults, ImageType, ItemNavAction, ItemType, Route } from '@/utils/constants'
   
export const useItemMgr = defineStore('itemMgr', () => {   
   const { width: windowWidth, height: windowHeight } = useWindowSize()
   const itemStore = useItemStore()   
   const hitStore  = useHitStore()
   
   const myItemIdToItem = computed(() => { 
      return itemStore.myItems ? new Map(itemStore.myItems.map((obj) => [obj.id, obj])) : new Map() 
   })

   const myInvisibleItems = computed(() => { return itemStore.myItems ? itemStore.myItems.filter(item => isInvisible(item)) : [] })
   function isInvisible(item) { return !item.galleryIds.length }
   
   const artistIdToMyItemIds = computed(() => { 
      const artistIdToItemIds = new Map() 
      if (itemStore.myItems) {
         for (const item of itemStore.myItems) { 
               if (item.primaryArtist) {
                  const itemIds = artistIdToItemIds.get(item.primaryArtist.id)
                  if (itemIds) { itemIds.push(item.id) }
                  else { artistIdToItemIds.set(item.primaryArtist.id, [ item.id ]) } 
               }
         }
      }
      return artistIdToItemIds
   })

   const recentPublicItems      = computed(() => { return extractRecentItems(itemStore.publicItems) })
   const recentGroupMemberItems = computed(() => { return extractRecentItems(itemStore.myGroupMemberItems) })
   const myRecentItems          = computed(() => { return extractRecentItems(itemStore.myItems) })
   function getRecentItems(userId)               { return extractRecentItems(itemStore.getUserItems(userId)) }
   function getRecentPublicItems(userId)         { return extractRecentItems(itemStore.getUserPubicItems(userId)) }
   
   function extractRecentItems(items) { 
      if (!items) { return [] }
      let sortedItems = []
      for (const item of items) { 
         if (item.dateContentModified) { sortedItems.push(item) } // work around for old items w/o dateContentModified
      }
      sortedItems = toSortedDateContentModifiedDesc(sortedItems)
      
      // return items less than 2 months old or at least 20 items
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - 2)
      const recentItems = []
      for (const item of sortedItems) { 
         if (item.dateModified.toDate() > cutoffDate || recentItems.length < 20) { recentItems.push(item) }
         else { break }
      }

      return recentItems
   }
   
   function getItems(itemIds) { 
      if (!itemIds || !itemIds.length) { return [] }
      const items = []
      for (const itemId of itemIds) { 
         const item = itemStore.itemIdToItem.get(itemId)
         if (item) { items.push(item) }
      }
      return items
   }

   const recentViewedPublicItems = computed(() => { 
      const itemIdToDateViewed = new Map(hitStore.hits.map(hit => [ hit.id, hit.dateModified ]))

      let items = itemStore.publicItems.map(item => ({
          ...item, 
          dateViewed: itemIdToDateViewed.get(item.id) ?? item.dateModified 
      }))
      items = items.filter(item => !isInvisible(item))
      return toSortedDateViewedDesc(items)
   })

   function getRandomItems() { 
      const items = [ ...itemStore.publicItems ]
      const random = randomizeArray(ungroupAndExtractItems(items))
      return random.slice(0, 50)
   }

   function getPublicGalleryThumbUrls(userId) { return getPublicGalleryThumbs(userId).map(thumb => thumb.url) }
   function getPublicGalleryThumbs(userId) {
      const thumbs = []
      for (const item of itemStore.getUserPubicItems(userId)) {
         const images = item.primaryImage ? [ item.primaryImage ] :  []
         if (item.otherImages?.length) { images.push(...item.otherImages) }
         for (const image of images) {
            if (image.imageType == ImageType.GALLERY) { thumbs.push(image) }
         }   

      }
      return thumbs
   }
  
   function mobileImageUrl(image) { 
      return image.mobileUrl && (image.dimensions?.height > 1500 || image.dimensions?.width > 1500) ? 
         image.mobileUrl : image.url 
   }

   function isItemGroup(item) { return item.type == ItemType.GROUP }
   function itemAspectRatio(item) { 
      // console.log("itemAspectRatio", item)
      if (item.childItems) {
         let totalWidth = 0
         let totalHeight = 0
         for (const childItem of item.childItems) { 
            totalWidth += childItem.primaryImage.dimensions.width
            totalHeight += childItem.primaryImage.dimensions.height
         }
         return totalWidth / (totalHeight / item.childItems.length)  // totalWidth/avgHeight
      }
      else { return objAspectRatio(item.primaryImage.dimensions) }
   }

   function ungroupItems(items) { 
      const ungroupedItems = []
      for (const item of items) { 
        ungroupedItems.push(...ungroupItem(item))
      }    
      return ungroupedItems
   }

   // an ungrouped item uses its parent's id and adds a childNum
   // it still has all childItems, and can be displayed as a groupItem
   function ungroupItem(item) { 
      const ungroupedItems = []
      if (isItemGroup(item)) { 
         if (item.childNum) { ungroupedItems.push(item) }
         else {
            for (let i=0; i<item.childItems.length; i++) {
               ungroupedItems.push({ ...item, childNum: i + 1 })
            }
         }
      } 
      else { ungroupedItems.push(item) }

      return ungroupedItems
   }

   function ungroupAndExtractItems(items) { 
      // console.log("ungroupAndExtractItems", items)
      const extractedItems = []
      for (const item of ungroupItems(items)) {
         extractedItems.push(extractFromItemGroup(item))
      }
      return extractedItems
   }
   
   // an extracted item has a unique coumpound id and linkId
   // it functions like a single item, with a primaryImage
   function extractFromItemGroup(item) { 
      // console.log("extractFromItemGroup", item)
      if (!isItemGroup(item)) { return item }
      const childNum = item.childNum ? item.childNum : 1
      if (childNum > item.childItems.length) { 
         console.log("extractFromItemGroup error - childNum (" + childNum + ") exceeds childItems length", item)
         return {} 
      }
      
      const extractedItem = { ...item.childItems[childNum - 1] }
      extractedItem.id            = "ex-" + item.id + "-" + extractedItem.id
      extractedItem.linkId        = item.id
      extractedItem.userId        = item.userId
      extractedItem.childNum      = item.childNum
      extractedItem.state         = item.state
      extractedItem.primaryArtist = item.primaryArtist
      extractedItem.yearCreated   = item.yearCreated
      extractedItem.groupIds      = item.groupIds
      extractedItem.galleryIds    = item.galleryIds
      extractedItem.onUserWall    = item.onUserWall
      extractedItem.dateContentModified = item.dateContentModified
      if (item.isFeedItem) {
         extractedItem.isFeedItem = item.isFeedItem
         extractedItem.parentFeed = item.parentFeed
         extractedItem.groups     = item.groups
         extractedItem.username   = item.username
      }
      
      return extractedItem
   }

   function itemNavURL(itemId, origin, navAction, childNum) { 
      return Route.ITEM.url + origin + '/' + navAction + '/' + itemId + (childNum ? '/' + childNum : '') }
   function itemURL(itemId, origin, childNum) { return itemNavURL(itemId, origin, ItemNavAction.EXTERNAL, childNum) }
   
   function getPopupImage(imageName, artistName, url, boundingRect, aspectRatio, settings = {}) {
      const offset = 25
      const name = imageName + (artistName ? " - " + artistName : "")

      let popupWidth = aspectRatio < 1 ? 350 : 550 
      if (settings.smallThumb) { popupWidth = aspectRatio < 1 ? 250 : 350 }
      const popupHeight = Math.round(popupWidth / aspectRatio) + (name.length ? 35 : 0)  
      const popup = { name: name, url: url, width: popupWidth, height: popupHeight}
   
      if (settings.overlayThumb) { return { ...popup, x: boundingRect.left, y: boundingRect.top } }
     
      const x = boundingRect.left < windowWidth.value / 2 ? 
         boundingRect.right + offset : 
         boundingRect.left - popupWidth - offset 
      const y = boundingRect.top + popupHeight < windowHeight.value ? 
         boundingRect.top - offset : 
         boundingRect.bottom - popupHeight + offset

      return { ...popup, x: x, y: y }
   }

   function getItemWidth(item, targetHeight, itemMaxLandscapeWidth) {
      const aspectRatio = itemAspectRatio(item)
      let targetWidth = Math.round(targetHeight * aspectRatio)
      if (targetWidth > Defaults.MAX_THUMB_SIDE) { targetWidth = Defaults.MAX_THUMB_SIDE}
      
      if (aspectRatio > 2 && targetWidth == Defaults.MAX_THUMB_SIDE) {
         targetWidth = itemMaxLandscapeWidth
      }
      return targetWidth
   }

   function getGroupWidth(item, targetHeight) { return getGroupWidthObj(item, targetHeight).targetWidth }
   function getGroupWidthObj(item, targetHeight) {
      let totalWidth = 0
      let totalHeight = 0
      for (const childItem of item.childItems) {
         totalWidth += childItem.primaryImage.dimensions.width
         totalHeight += childItem.primaryImage.dimensions.height
      }

      // does not address landscape images becasue they are not grouped
      const avgHeight = totalHeight/item.childItems.length
      const aspectRatio = totalWidth / avgHeight
      const targetWidth = Math.round(targetHeight * aspectRatio)
      
      return { totalWidth: totalWidth, targetWidth: targetWidth, cardWidth: targetWidth.toString()}
   }

   return { 
      myItemIdToItem, myInvisibleItems, artistIdToMyItemIds, isInvisible,
      getItems, getRandomItems, getPublicGalleryThumbs, getPublicGalleryThumbUrls,
      recentPublicItems, recentGroupMemberItems, myRecentItems, getRecentItems, getRecentPublicItems, 
      recentViewedPublicItems,
      mobileImageUrl, isItemGroup, ungroupItems, ungroupItem, ungroupAndExtractItems, extractFromItemGroup,
      itemAspectRatio, itemNavURL, itemURL, getPopupImage, 
      getItemWidth, getGroupWidth, getGroupWidthObj }
})
