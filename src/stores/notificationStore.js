import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore"
import { useUserStore } from './userStore'
import { useNotificationAccess } from './access/notificationAccess'
import { dateUuid, toSortedDateCreatedDesc } from '@/utils/utils'
import { NotificationStatus } from '@/utils/constants'

/*
   Notification
      id
      status: NotificationStatus: READ, UNREAD
      notificationType: NotificationType: GROUP_ITEM, GROUP_CHAT
      userId
      groupId 
      itemId
      text
      url
      dateCreated
*/

const TABLE = 'notifications'

export const useNotificationStore = defineStore('notification', () => {
   const notificationAccess = useNotificationAccess() 
   const userStore = useUserStore()
   const notificationCollection = collection(db, TABLE)
   function notificationDoc(id) { return doc(db, TABLE, id) }

   const init = async () => { notificationAccess.addListener() } 
   const notifications = computed(() => notificationAccess.records)
    
   const userIdToNotifications = computed(() => {
      const map = new Map()
      for (const notification of notifications.value) {
         if (!map.has(notification.userId)) { map.set(notification.userId, []) }
         map.get(notification.userId).push(notification)
      }
      return map
   })

   const myNotifications = computed(() => toSortedDateCreatedDesc(
      notifications.value.filter(notification => notification.userId == userStore.userId)))
   const myActiveNotifications = computed(() => myNotifications.value.filter(notification => notification.status == NotificationStatus.ACTIVE))

   function addNotification(notification) {
      const notificationToSet = { ...notification, id: dateUuid(), status: NotificationStatus.ACTIVE, dateCreated: serverTimestamp() } 
         
      const existingNotifications = userIdToNotifications.value.get(notification.userId)
      const duplicates = existingNotifications ? 
         existingNotifications.filter(existing => 
            existing.notificationType == notificationToSet.notificationType &&
            existing.status           == notificationToSet.status &&
            existing.userId           == notificationToSet.userId &&
            existing.groupId          == notificationToSet.groupId &&
            existing.text             == notificationToSet.text)
         : []

      if (duplicates.length) { console.log("Bypassing duplicate notification") }
      else { setDoc(notificationDoc(notificationToSet.id), notificationToSet) }
   }

   // function setInactive(id) { updateDoc(notificationDoc(id), { status: NotificationStatus.INACTIVE }) }
   function setInactive(id) { 
      console.log("notificationStore.setInactive", id)
      notificationAccess.update(id, { status: NotificationStatus.INACTIVE }) }

   function deleteNotification(id) { deleteDoc(doc(notificationCollection, id)) }

   function deleteNotifications(ids) {
      const batch = writeBatch(db)
      for (const id of ids) {
         batch.delete(doc(notificationCollection, id))
      }
      batch.commit()
   }

   return { init, myNotifications, myActiveNotifications, addNotification, setInactive, deleteNotification, deleteNotifications }
})

