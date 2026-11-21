import { computed } from 'vue'
import { defineStore } from 'pinia'
import { arrayUnion, arrayRemove } from "firebase/firestore"
import { useUserStore }  from './userStore'
import { useGroupStore } from './groupStore'
import { useWallStore }  from '@/stores/wallStore'
import { useImageMgr }   from '@/stores/image/imageMgr'
import { useLocalStore } from '@/stores/localStore'
import { toSortedUsernameAsc } from '@/utils/utils'

export const useUserMgr = defineStore('userMgr', () => {
   const userStore  = useUserStore()
   const groupStore = useGroupStore()
   const wallStore  = useWallStore()
   const imageMgr   = useImageMgr()
   const localStore = useLocalStore()
   
   const otherUsers = computed(() => { 
      const users = []
      if (userStore.userExists) {
         for (const user of userStore.users) {
            if (user.id != userStore.userId) { users.push(user)}      
         }
      }
      return toSortedUsernameAsc(users)
   })  

   const avatarUsers = computed(() => 
      userStore.users ? toSortedUsernameAsc(userStore.users.filter(user => getAvatar(user))) : [])

   function getUsers(userIds) { return userIds ? userIds.map(id => userStore.getUser(id))  : []}

   const myKnownUserIds = computed(() => { 
      const knownUserIds = []
      for (const group of groupStore.myGroups) {
         knownUserIds.push( ...group.userIds )
      }
      let set = new Set(knownUserIds)
      set.delete(userStore.userId)

      return Array.from(set)
   })

   const myProfiles = computed(() => { 
      const profiles = []
      for (const user of userStore.users) {
         if (user.ownerId == userStore.userId) { profiles.push(user) }      
      }
      return profiles
   })

   function addProfileUser(user) {
      const newUser = userStore.addProfileUser(user)
      wallStore.addUserWall(newUser.id)
   }
   
   const myUserContacts = computed(() => getUserContacts(myKnownUserIds.value))

   const myAvatar = computed(() => getAvatar(userStore.user))

   function getAvatar(user) {
      if (user?.images) {
         for (const imageSet of user.images) {
            if (imageMgr.isActiveUserImage(imageSet)) { return imageSet }
         }
      }
      return null
   }

   // consolidate with myFullName
   function getFullName(user) {
      return user ? 
         (user.firstName ?? "") + (user.firstName && user.lastName ? " " : "") + (user.lastName ?? "") :
         ""
   }

   function getUserIdByEmail(email) {
      const userContact = getUserContactByEmail(email) 
      return userContact ? userContact.id : null
   }
   
   function getUserContactByEmail(email) {
      for (const user of userStore.users) { 
         if (user.email == email) { return getUserContact(user) }        
      }
      return null
   }

   function getUserContacts(userIds) {
      const userContacts = []
      for (const userId of userIds) { 
         const user = userStore.getUser(userId)
         if (user) { userContacts.push(getUserContact(user)) }
      }
      userContacts.sort((a, b) => a.lastName.localeCompare(b.lastName))

      return userContacts      
   }
   function getUserContact(user) {
      return { 
         id: user.id, 
         username: user.username, 
         email: user.email, 
         firstName: user.firstName, 
         lastName: user.lastName ? user.lastName : "",
         fullName: getFullName(user) 
      }         
   }

   function setItemHeaders(headers) {
      const settings = { ...userStore.mySettings }
      settings.itemHeaders = headers
      userStore.updateSettings(settings)
   }

   function setGalleryThumbOptions(options) {
      // console.log("updating user galleryThumbOptions")
      const settings = { ...userStore.mySettings }
      settings.galleryThumbOptions = options
      userStore.updateSettings(settings)
   }
   
   function setItemThumbOptions(options) {
      // console.log("updating user itemThumbOptions")
      const settings = { ...userStore.mySettings }
      settings.itemThumbOptions = options
      userStore.updateSettings(settings)
   }

   function setThumbSize(thumbSize) {
     const settings = { ...userStore.mySettings }
      settings.thumbSize = thumbSize
      userStore.updateSettings(settings)
   }
   
   function setShowHiddenItems(showHidden) {
      const settings = { ...userStore.mySettings }
      settings.showHiddenItems = showHidden
      userStore.updateSettings(settings)
   }

   function getUserContactsNotInGroup(group) {
      let userIds = new Set(myKnownUserIds.value)
      for (const groupUserId of group.userIds) {
         userIds.delete(groupUserId)
      }
         
      return getUserContacts(userIds)
   }
   
   function addFavoriteItem(itemId)    { userStore.updateUser({ id: userStore.userId, favoriteItems: arrayUnion(itemId) })}
   function removeFavoriteItem(itemId) { userStore.updateUser({ id: userStore.userId, favoriteItems: arrayRemove(itemId) })}

   function addPushMessageToken(deviceId, token, deviceType) {
      const user = userStore.user 
      if (user) {
         const appId = localStore.appId
         const existingMessageTokens = user.pushMessageTokens ?? []
         const updatedMessageTokens = []
         let existingAppIdToken = null
         let existingDeviceIdToken = null
         for (const messageToken of existingMessageTokens) {
            const existingMessageToken = { ...messageToken }
            updatedMessageTokens.push(existingMessageToken)
            if (existingMessageToken.appId == appId) { existingAppIdToken = existingMessageToken }
            if (existingMessageToken.deviceId == deviceId) { existingDeviceIdToken = existingMessageToken }
         }

         let tokenUpdated = true
         if (existingAppIdToken) { 
            if (existingAppIdToken == existingDeviceIdToken) {
               const oldToken = { ...existingAppIdToken }
               console.log("Found existing token by appId/deviceId", oldToken )
               if (existingAppIdToken.token == token && existingAppIdToken.deviceType == deviceType) {
                  console.log("Token unchanged")
                  tokenUpdated = false
               }
               else {
                  if (existingAppIdToken.token != token) { console.log("token changed") }
                  if (existingAppIdToken.deviceType != deviceType) { console.log("deviceType changed") }
                  existingAppIdToken.token = token
                  existingAppIdToken.deviceType = deviceType
                  console.log("Updating messsage token", existingAppIdToken)
               }
            }
            else {
               console.log("Found existing token by appId", existingAppIdToken)
               existingAppIdToken.deviceId = deviceId
               existingAppIdToken.token = token
               existingAppIdToken.deviceType = deviceType
               console.log("Updating messsage token", existingAppIdToken)
               
               if (existingDeviceIdToken) {
                  console.warn("Found additional token with deviceId", deviceId)
               }
            }
         }
         else if (existingDeviceIdToken) { 
            // did not find any token by appId - don't think this should happen
            console.log("Found existing token by deviceId, but different appId", existingDeviceIdToken)
            
            existingDeviceIdToken.appId = appId
            existingDeviceIdToken.token = token
            existingDeviceIdToken.deviceType = deviceType
            console.log("Updaing messaage token", existingToken)
         }
         else { 
            const newToken = { appId: appId, deviceId: deviceId, token: token, deviceType: deviceType }
            //  dateCreated: Timestamp.now() }
            console.log("Adding messaage token", newToken)
            updatedMessageTokens.push(newToken) 
         }  

         if (tokenUpdated) {
            console.log("Updating messaage tokens", updatedMessageTokens)
            userStore.updatePushMessageTokens(updatedMessageTokens)
         }
      }
      else {
         console.log("Cannot find user")
      }
   }

   return { 
      otherUsers, avatarUsers, getUsers, getFullName, getUserIdByEmail, getUserContactByEmail,
      setItemHeaders, setGalleryThumbOptions, setItemThumbOptions, setThumbSize, setShowHiddenItems, 
      myProfiles, myUserContacts, myAvatar, getAvatar, getUserContactsNotInGroup, 
      addProfileUser, addFavoriteItem, removeFavoriteItem, addPushMessageToken }
})
