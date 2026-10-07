import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, deleteDoc, arrayRemove, arrayUnion, serverTimestamp } from "firebase/firestore" 
import { useUserStore }  from './userStore'
import { useGroupStore } from '@/stores/groupStore'
import { useItemAccess } from './access/itemAccess'
import { getMapObjsById, isGroup, isPublic, randomPlate } from '@/utils/utils'
import { ItemType, State } from '@/utils/constants'
    
/*
   Item
      id
      name
      alternateName
      userId
      type: ItemType: SINGLE, GROUP
      state: State: PUBLIC, GROUP, PRIVATE, HIDDEN 
      yearCreated: optional user visible text field
      childNum - transient, populated in ungrouped items, 1-n (for zero-based truthieness)
      extractedFromId - transient, populated in extracted items
      groupIds[]
      galleryIds[]
      subTitle
      desc
      primaryImage 
         id
         imageType: Primary, Crop, Gallery, Header
         dimensions
            width
            height
         filePath
         thumbFilePath (cut down to fit in a 300x300 box)
         largeThumbFilePath (600x600)
         mobileFilePath (1500x1500)
         url
         thumbUrl
         largeThumbUrl
         mobileUrl
      otherImages[]
         ...primaryImage
         name
         showWithItem: boolean - image is shown as one of item's images
      allArtistNames - populated by backend
      primaryArtist
         id
         name
         fullName
         shortName
      otherArtists []
      parentItemIds[] - itemGroups this item is part of
      childItems[] - items this itemGroup holds
      contributingGalleryOwnerIds[] - for access rules to allow gallery owner to update item      
      onUserWall
      versionTag: 6 digit alphanumeric tag that changs with every update - for cache control
      dateCreated
      dateModified
      dateContentModified
*/

const TABLE = 'items'

export const useItemStore = defineStore('item', () => {
   const userStore  = useUserStore()
   const groupStore = useGroupStore()      
   const itemAccess = useItemAccess()      
   
   const itemCollection = collection(db, TABLE)
   function itemDoc(id) { return doc(db, TABLE, id) }

   const addListener    = async () => { await itemAccess.addListener() } 
   const removeListener = async () => { itemAccess.removeListener() }
   const items = computed(() => itemAccess.items)

   // const rawItems = useFirestore(itemCollection)   
   // const items = computed(() => { return rawItems.value ? rawItems.value : [] })
   
   const itemIdToItem = computed(() => { return new Map(items.value.map((obj) => [obj.id, obj])) })
   const childItemIds = computed(() => { 
      const ids = new Set()
      for (const item of items.value) {
         if (item.type == ItemType.GROUP) {
            for (const childItem of item.childItems) { ids.add(childItem.id) }
         }
      }
      return ids
   })

   // const groupItemsQuery = computed(() => query(itemCollection, where('state', '==', State.GROUP)))
   // const groupItems = useFirestore(groupItemsQuery, [])
   const groupItems = computed(() => { return items.value.filter(item => isGroup(item)) })

   // const myItemsQuery   = computed(() => userStore.userId && query(itemCollection, where('userId', '==', userStore.userId)))
   // const myItems        = useFirestore(myItemsQuery, null)
   const myItems = computed(() => { return items.value.filter(item => item.userId == userStore.userId) })
   const myItemIdToItem = computed(() => { return myItems && myItems.value ? new Map(myItems.value.map((obj) => [obj.id, obj])) : new Map() })
   
   // const publicItemsQuery = computed(() => query(itemCollection, where('state', '==', State.PUBLIC)))
   // const publicItems      = useFirestore(publicItemsQuery, [])
   const publicItems = computed(() => { return items.value.filter(item => isPublic(item)) })

   const myChildItemIds = computed(() => { 
      const childItemIds = new Set()
      for (const item of myItems.value) {
         if (item.type == ItemType.GROUP) {
            for (const childItem of item.childItems) { childItemIds.add(childItem.id) }
         }
      }
      return childItemIds
   })

   function getGalleryItems(galleryId) {
      // obviously inefficient
      const galleryItems = []
      if (items?.value) {  
         for (const item of items.value) {
            if (item.galleryIds.includes(galleryId)) { galleryItems.push(item) }
         }
      }
      return galleryItems
   }

   function getArtistItems(artistId) { return artistIdToItems.value.get(artistId) ?? [] }

   function getArtistPublicItems(artistIds) {
      const artistsItems = []
      for (const artistId of artistIds) {
         const artistItems = artistIdToPublicItems.value.get(artistId) 
         if (artistItems) { artistsItems.push(...artistItems) }
      }
      return artistsItems
   }

   const artistIdToItems       = computed(() => getArtistIdToItems(items.value))
   const artistIdToPublicItems = computed(() => getArtistIdToItems(publicItems.value))
   function getArtistIdToItems(itemArray) {
      const map = new Map()
      if (!itemArray) { return map }
      for (const item of itemArray) {
         if (item.primaryArtist?.id) { addItemToArtistMap(item.primaryArtist, item, map) }
         if (item.otherArtists) { 
            for (const artist of item.otherArtists) {
               addItemToArtistMap(artist, item, map) 
            }
         }
      }
      return map
   }

   function addItemToArtistMap(artist, item, artistIdToItem) { 
      let artistItems = artistIdToItem.get(artist.id)
      if (!artistItems) {
         artistItems = []
         artistIdToItem.set(artist.id, artistItems)
      }
      artistItems.push(item) 
   }  

   const userIdToItems       = computed(() => getUserIdMap(items.value))
   const userIdToPublicItems = computed(() => getUserIdMap(publicItems.value))
   function getUserIdMap(objects) {
      const map = new Map()
      if (objects) {  
         for (const obj of objects) {
            if (!map.has(obj.userId)) { map.set(obj.userId, []) }
            map.get(obj.userId).push(obj)
         }
      }
      return map
   }

   function getGroupItems(groupId) { return groupIdToItems.value?.has(groupId) ? groupIdToItems.value.get(groupId) : [] }
   const groupIdToItems = computed(() => {
      const map = new Map()
      for (const item of groupItems.value) {
         for (const groupId of item.groupIds) {
            if (!map.has(groupId)) { map.set(groupId, []) }
            map.get(groupId).push(item)
         }
      }
      return map
   })

   // const myGroupMemberItemsQuery = computed(() => 
   //    groupStore.myGroupIds?.length && 
   //    query(itemCollection, where('state', '==', State.GROUP), where('groupIds', 'array-contains-any', groupStore.myGroupIds)))
   // const myGroupMemberItems = useFirestore(myGroupMemberItemsQuery, [])

   function getUserItems(userId)      { return getMapObjsById(userId, userIdToItems.value) }
   function getUserPubicItems(userId) { return getMapObjsById(userId, userIdToPublicItems.value) }   
   function getItem(itemId) { return itemIdToItem.value ? itemIdToItem.value.get(itemId) : {} }

   function setItem(item) { 
      const itemToSet = { ...item, versionTag: randomPlate(), 
         dateCreated:serverTimestamp(), dateModified:serverTimestamp(), dateContentModified:serverTimestamp() }
      if (!itemToSet.groupIds)    { itemToSet.groupIds = [] }
      if (!itemToSet.galleryIds)  { itemToSet.galleryIds = [] }
      if (!itemToSet.otherImages) { itemToSet.otherImages = [] }

      setDoc(itemDoc(itemToSet.id), itemToSet) 
      return itemToSet
   }

   function updateItem(item, contentModified = true) { return updateItemDoc(item.id, item, contentModified) }
   function addOtherImage(itemId, image)       { silentUpdate(itemId, { otherImages: arrayUnion(image) }) }
   function removeOtherImage(itemId, image)    { silentUpdate(itemId, { otherImages: arrayRemove(image) }) }
   function removeGalleryId(itemId, galleryId) { silentUpdate(itemId, { galleryIds: arrayRemove(galleryId) }) }
   function updatePrimaryImage(itemId, image)  { updateItemDoc(itemId, { primaryImage: image }), true }
   function updateOtherImage(itemId, updatedImage) {
      const images = []
      const item = myItemIdToItem.value.get(itemId)
      if (item) {
         for (const image of item.otherImages) {
            images.push(image.id == updatedImage.id ? updatedImage : image)
         }
         silentUpdate(itemId, { otherImages: images })
      }
      else { console.log("updateOtherImage cannot find item", itemId)}
   }

   function deleteItem(id) {
      // console.log("deleteItem", id) 
      if (myChildItemIds.value.has(id)) { console.log("Cannot delete child item " + id) }
      else { deleteDoc(doc(itemCollection, id)) }
   }

   function silentUpdate(itemId, item) { updateItemDoc(itemId, item, false) }
   function updateItemDoc(itemId, item, contentModified = true) {
      const itemToUpdate = { ...item, versionTag: randomPlate(), dateModified: serverTimestamp() }
      if (contentModified && (item.primaryImage || item.primaryArtist || item.childItems)) { 
         itemToUpdate.dateContentModified = serverTimestamp() }
      // console.log("itemToUpdate", itemToUpdate)
      updateDoc(itemDoc(itemId), itemToUpdate)
      return itemToUpdate
   }

   return { 
      items, addListener, removeListener,
      publicItems, childItemIds, itemIdToItem, groupItems, groupIdToItems,
      myItems, myItemIdToItem, myChildItemIds,
      getGalleryItems, getGroupItems, getArtistItems, getArtistPublicItems, getItem, getUserItems, getUserPubicItems,
      setItem, updateItem, 
      addOtherImage, updatePrimaryImage, updateOtherImage, removeOtherImage, 
      removeGalleryId, deleteItem }
})
