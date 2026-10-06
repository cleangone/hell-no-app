import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, arrayRemove, arrayUnion, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from './userStore'
import { dateUuid, isPublic, toSortedNameAsc } from '@/utils/utils'
import { State } from '@/utils/constants'
   
/*
   Group
      id
      name
      ownerId (userId)
      state: State: PUBLIC, PRIVATE
      userIds[] 
      moderatorIds[] - ids also in userIds
      invitedIds[]
      images[]
         id
         itemId 
         imageType: GalleryImageTypes: ImageType: GROUP, HEADER, BACKGROUND
         name
         active 
         url
         thumbUrl 
         dimensions
         originalDimensions
         originalLargeThumbUrl
      dateCreated
      dateModified
*/

const TABLE = 'groups'

export const useGroupStore = defineStore('group', () => {
   const userStore = useUserStore()
   const groupCollection = collection(db, TABLE)
   function groupDoc(id) { return doc(db, TABLE, id) }
   
   const groups = useFirestore(groupCollection)   
   const groupIdToGroup = computed(() => { return groups.value ? new Map(groups.value.map((obj) => [obj.id, obj])) : new Map() })
   function getGroup(id) { return groupIdToGroup.value.get(id) }

   const myGroupsQuery    = computed(() => userStore.userId && query(groupCollection, where('userIds', "array-contains", userStore.userId)))
   const myRawGroups      = useFirestore(myGroupsQuery, [])
   const myGroups         = computed(() => toSortedNameAsc(myRawGroups.value))
   const myGroupIds       = computed(() => { return myGroups.value.map((obj) => obj.id) })
   const myGroupIdToGroup = computed(() => { return new Map(myGroups.value.map((obj) => [obj.id, obj])) })
   function getMyGroup(id) { return myGroupIdToGroup.value.get(id) }

   const myInvitedGroupsQuery = computed(() => userStore.userId && query(groupCollection, where('invitedIds', "array-contains", userStore.userId)))
   const myInvitedGroups = useFirestore(myInvitedGroupsQuery, [])

   function getUserGroups(userId) {
      // todo: replace with query
      const userGroups = []
      if (groups && groups.value) {  
         for (const group of groups.value) {
            if (group.userIds.includes(userId) || group.invitedIds.includes(userId)) { userGroups.push(group) }
         }
      }
      return userGroups
   }

   function getUserGroupsMap(userId) {
      const groupIdToGroup = new Map()
      for (const group of getUserGroups(userId)) { groupIdToGroup.set(group.id, group) }
      return groupIdToGroup
   }

   function getGroup(groupId) { return groupIdToGroup.value ? groupIdToGroup.value.get(groupId) : {} }

   // get all the userIds in any of the groupIds
   // todo - only use is single groupId 
   // function getUserIds(groupIds) {
   //    const userIds = new Set()
   //    if (groupIdToGroup.value) { 
   //       for (const groupId of groupIds) { 
   //          const group = groupIdToGroup.value.get(groupId)
   //          if (group && isPublic(group)) { group.userIds.forEach(userId => userIds.add(userId)) }
   //       }
   //    } 
   //    return Array.from(userIds)
   // }

   function getUserIds(groupId) {
      const group = groupIdToGroup.value ? groupIdToGroup.value.get(groupId) : null
      return isPublic(group) ? group.userIds : []
   }

   function addGroup(name, desc, ownerId) {
      console.log("addGroup", name)
      const id = dateUuid()
      setDoc(groupDoc(id), {
         id: id,
         name: name,
         desc: desc,
         ownerId: ownerId,
         state: State.PRIVATE,
         userIds: [ownerId],
         moderatorIds: [],
         invitedIds: [],
         images: [],
         dateCreated:  serverTimestamp(),
         dateModified: serverTimestamp()
      })
   }

   function updateGroup(group)                 { update(group.id, group) }
   function addUserId(groupId, userId)         { update(groupId, { userIds:      arrayUnion(userId) }) }
   function addUserIds(groupId, userIds)       { update(groupId, { userIds:      arrayUnion(...userIds) }) }
   function addModeratorId(groupId, userId)    { update(groupId, { moderatorIds: arrayUnion(userId) }) } 
   function inviteUserIds(groupId, userIds)    { update(groupId, { invitedIds:   arrayUnion(...userIds) }) }
   function removeUserId(groupId, userId)      { update(groupId, { userIds:      arrayRemove(userId) }) }
   function removeModeratorId(groupId, userId) { update(groupId, { moderatorIds: arrayRemove(userId) }) } 
   function removeInvitedId(groupId, userId)   { update(groupId, { invitedIds:   arrayRemove(userId) }) }
   function acceptInvite(groupId, userId)      { update(groupId, { userIds:      arrayUnion(userId), invitedIds: arrayRemove(userId) }) }
   function declineInvite(groupId, userId)     { update(groupId, { invitedIds:   arrayRemove(userId) }) }
   function addImage(groupId, image)           { update(groupId, { images:       arrayUnion(image) }) }
   function deleteImage(groupId, image)        { update(groupId, { images:       arrayRemove(image) }) }

   function updateImage(groupId, updatedImage) {
      const images = []
      const group = myGroupIdToGroup.value.get(groupId)
      if (group) {
         for (const image of group.images) {
            images.push(image.id == updatedImage.id ? updatedImage : image)
         }
         update(groupId, { images: images })
      }
      else { console.log("updateImage cannot find group", groupId)}
   }

   function update(groupId, group) { 
      updateDoc(groupDoc(groupId), { ...group, dateModified: serverTimestamp() }) 
   }

   function deleteGroup(id) {
      deleteDoc(doc(groupCollection, id))
   }

   return { 
      groups, groupIdToGroup, myGroups, myGroupIds, myGroupIdToGroup, myInvitedGroups,
      getGroup, getMyGroup, getUserGroups, getUserGroupsMap, getGroup, getUserIds, 
      addGroup, updateGroup, deleteGroup,
      addUserId, addUserIds, addModeratorId, removeModeratorId, inviteUserIds, removeUserId, acceptInvite, declineInvite, removeInvitedId,
      addImage, updateImage, deleteImage
   }
})
