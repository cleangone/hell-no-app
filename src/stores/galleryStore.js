import { computed, ref, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { useUserStore }     from './userStore'
import { useGalleryAccess } from './access/galleryAccess'
import { dateUuid, getMapObjsById, isPublic } from '@/utils/utils'
import { ImageType, State } from '@/utils/constants'   
   

/*
   Gallery
      id
      name
      sortName - optional
      tag - unique across all galleries
      userId
      contributorIds[]
      state: State: PUBLIC, PRIVATE
      desc
      itemIds[]
      images[]
         id
         itemId 
         imageType: GalleryImageTypes: ImageType: GALLERY, HEADER, BACKGROUND
         name
         active 
         url
         thumbUrl 
         dimensions
         originalDimensions
         originalLargeThumbUrl
      parentGalleryId
      childGalleryIds[]
      useAltItemName
      useLocalItemName
      dateCreated
      dateModified
      dateContentModified
*/

const TABLE = 'galleries'

export const useGalleryStore = defineStore('gallery', () => {
   const userStore     = useUserStore()
   const galleryAccess = useGalleryAccess()
   const galleryCollection = collection(db, TABLE)

   const addListener    = async () => { await galleryAccess.addListener() } 
   const removeListener = async () => { galleryAccess.removeListener() }
   const galleries = computed(() => galleryAccess.galleries)

   function galleryDoc(galleryId) { return doc(db, TABLE, galleryId) }

   // const galleries = useFirestore(galleryCollection)      
   const galleryIdToGallery  = computed(() => { return galleries.value ? new Map(galleries.value.map((obj) => [obj.id, obj])) : new Map() })
   const galleryTagToGallery = computed(() => { 
      return galleries.value ? new Map(galleries.value.filter(obj => obj.tag).map(obj => [obj.tag, obj])) : new Map() 
   })
   
   function getGallery(galleryId) { return galleryIdToGallery.value ? galleryIdToGallery.value.get(galleryId) : null }
   function getGalleryByTag(tag)  { return galleryTagToGallery.value ? galleryTagToGallery.value.get(tag) : null }

   //
   // publicGalleries
   //
   const publicGalleries = computed(() => { return galleries.value.filter(gallery => isPublic(gallery)) })
      // const pub = galleries.value.filter(gallery => isPublic(gallery))
      // console.log("publicGalleries: " + pub.length)
      // return pub })
   
   const userIdToPublicGalleries = computed(() => {
      const galleryMap = new Map()
      for (const gallery of publicGalleries.value) {
         if (!galleryMap.has(gallery.userId)) { galleryMap.set(gallery.userId, []) }
         galleryMap.get(gallery.userId).push(gallery)
      }
      return galleryMap
   })
   const publicGalleryIdToChildGalleries = computed(() => {
      const galleryMap = new Map()
      for (const gallery of publicGalleries.value) {
         if (!galleryMap.has(gallery.id)) { galleryMap.set(gallery.id, []) }
         if (gallery.parentGalleryId) {
            if (!galleryMap.has(gallery.parentGalleryId)) { galleryMap.set(gallery.parentGalleryId, []) }
            galleryMap.get(gallery.parentGalleryId).push(gallery)
         }
      }
      return galleryMap
   })
   function getPublicGalleries(userId) {
      const userGalleries = userIdToPublicGalleries.value ? userIdToPublicGalleries.value.get(userId) : null
      return userGalleries ? userGalleries : []
   }
   
   function getUserGalleries(userId) { return getMapObjsById(userId, userIdToGalleries.value) }
   const userIdToGalleries = computed(() => {
      const galleryMap = new Map()
      for (const gallery of galleries.value) {
         if (!galleryMap.has(gallery.userId)) { galleryMap.set(gallery.userId, []) }
         galleryMap.get(gallery.userId).push(gallery)
      }
      return galleryMap
   })

   // myGalleries
   const myRawGalleries = computed(() => { return galleries.value.filter(gallery => gallery.userId == userStore.userId) })
   const myGalleriesExist = computed(() => myRawGalleries.value.length > 0 )
   const myGalleries = computed(() => {
      const sortedGalleries = [ ...myRawGalleries.value ]
      sortedGalleries.sort(function(a, b){return a.name.localeCompare(b.name)}) 
      return sortedGalleries
   })

   // myContributingGalleries
   const myRawContributingGalleries = computed(() => { 
      return galleries.value.filter(gallery => gallery.contributorIds?.includes == userStore.userId) })
   const myContributingGalleriesExist = computed(() => myRawContributingGalleries.value.length > 0 )
   const myContributingGalleries = computed(() => {
      const sortedGalleries = [ ...myRawContributingGalleries.value ]
      sortedGalleries.sort(function(a, b){return a.name.localeCompare(b.name)}) 
      return sortedGalleries
   })

   const myGalleryIdToGalleryMap = computed(() => {
      const galleryIdToGallery = new Map()
      for (const gallery of myRawGalleries.value) { galleryIdToGallery.set(gallery.id, gallery) }
      for (const gallery of myRawContributingGalleries.value) { galleryIdToGallery.set(gallery.id, gallery) }
      return galleryIdToGallery
   })
   function getMyGallery(galleryId) {return myGalleryIdToGalleryMap.value.get(galleryId) }

   //
   // CRUD
   //
   function addGallery(gallery) {
      const galleryToAdd = { ...gallery, id:dateUuid(), images:[], childGalleryIds:[], 
         dateCreated:serverTimestamp(), dateModified:serverTimestamp(), dateContentModified:serverTimestamp() }
      setDoc(galleryDoc(galleryToAdd.id), galleryToAdd)
      return galleryToAdd.id
   }

   function updateGallery(gallery) { updateGalleryDoc(gallery.id, gallery) }

   function addItem(galleryId, item) {
       // add item's gallery images
       const galleryImages = []
       for (const image of item.otherImages) {
         if (image.imageType == ImageType.GALLERY || image.imageType == ImageType.HEADER) {
            galleryImages.push({
               id:         image.id,
               imageType:  image.imageType,
               url:        image.url,
               thumbUrl:   image.thumbUrl,
               dimensions: image.dimensions,
               active: true, 
               itemId:                item.id, 
               name:                  item.name, 
               originalDimensions:    { ...item.primaryImage.dimensions },
               originalLargeThumbUrl: item.primaryImage.largeThumbUrl,
            })
         }
      }
      
      updateGalleryDoc(galleryId,
         { itemIds: arrayUnion(item.id), images:arrayUnion(...galleryImages), dateContentModified:serverTimestamp() })
   }

   function deleteGallery(galleryId) { deleteDoc(doc(galleryCollection, galleryId)) }

   function removeItemId(galleryId, itemId, dateContentModified = null) {
      // remove any gallery images associated with item
      
      //const gallery = myGalleryIdToGalleryMap.value.get(galleryId)
      const gallery = getGallery(galleryId)
      const imagesToRemove = []
      for (const image of gallery.images) {
         if (image.itemId == itemId) { imagesToRemove.push(image) }
      }

      const update = { itemIds:arrayRemove(itemId), images:arrayRemove(...imagesToRemove) }
      if (dateContentModified) { update.dateContentModified = dateContentModified }
      updateGalleryDoc(galleryId, update)
   }

   function addChildGalleryId(galleryId, childGalleryId) {
      updateGalleryDoc(galleryId, { childGalleryIds: arrayUnion(childGalleryId) })
   }
   
   function removeChildGalleryId(galleryId, childGalleryId) {
      updateGalleryDoc(galleryId, { childGalleryIds: arrayRemove(childGalleryId) })
   }
 
   //
   // Images
   //
   function addImage(galleryId, galleryImage) { updateGalleryDoc(galleryId, { images: arrayUnion(galleryImage) }) }

   function updateImage(galleryId, galleryImage) {
      // update image or add if it is not found
      const gallery = myGalleryIdToGalleryMap.value.get(galleryId)
      const updatedImages = []
      let imageUpdated = false
      for (const image of gallery.images) {
         if (image.id == galleryImage.id && !imageUpdated) { 
            updatedImages.push(galleryImage)
            imageUpdated = true 
         }
         else { updatedImages.push(image) }
      }

      if (!imageUpdated) { updatedImages.push(galleryImage) }
      updateGalleryDoc(galleryId, { images: updatedImages }) 
   }

   function removeImageId(galleryId, galleryImageId) {
      // console.log("removeImage", galleryId, galleryImageId) 
      // remove via update because arrayRemove will remove all instances of an image if duplicates exist
      const gallery = myGalleryIdToGalleryMap.value.get(galleryId)
      const updatedImages = []
      let imageToRemove = null
      for (const image of gallery.images) {
         if (image.id == galleryImageId && !imageToRemove) { imageToRemove = image }
         else { updatedImages.push(image) }
      }

      if (imageToRemove) { updateGalleryDoc(galleryId, { images: updatedImages }) }
   }

   function updateGalleryDoc(galleryId, galleryUpdates) {
      updateDoc(galleryDoc(galleryId), { ...galleryUpdates, dateModified:serverTimestamp() })
   }

   return { 
      galleries, addListener, removeListener,
      myGalleries, myGalleriesExist, myContributingGalleriesExist, myContributingGalleries, myGalleryIdToGalleryMap,
      getGallery, getGalleryByTag, getMyGallery, getUserGalleries,
      publicGalleries, getPublicGalleries, publicGalleryIdToChildGalleries, userIdToGalleries, 
      addGallery, updateGallery, deleteGallery,
      addItem, removeItemId, addChildGalleryId, removeChildGalleryId, 
      addImage, updateImage, removeImageId }
})
