import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { PushNotifications } from '@capacitor/push-notifications'
import { Device }            from '@capacitor/device'
import { useUserStore } from './userStore'
import { useUserMgr }   from './userMgr'

export const usePushMessageMgr = defineStore('pushMessageMgr', () => {
   const userStore        = useUserStore()
   const userMgr          = useUserMgr()
   const fcmToken         = ref(null)
   const isRegistered     = ref(false)
   const lastNotification = ref(null)

   async function initPushMessages() {
      if (!userStore.userExists) { 
         console.log("No user - bypassing initPushMessages")
         return 
      }
      console.log("initPushMessages")
      
      let permStatus = await PushNotifications.checkPermissions()
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions()
      }

      if (permStatus.receive !== 'granted') {
        console.warn('User denied push notification permissions')
        return
      }

      await PushNotifications.register()
      registerListener()
    }

   function registerListener() {
      console.log("registerListener")
      
      // Registration Success
      PushNotifications.addListener('registration', async (token) => {
         fcmToken.value = token.value
         isRegistered.value = true
         console.log("Registering FCM Token", fcmToken.value)
         await saveToken(token.value)
      })

      // Registration Error
      PushNotifications.addListener('registrationError', (error) => {
         console.error('Error on push registration:', error);
      })

      // Foreground Notification Received
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
         lastNotification.value = notification
         console.log('Notification received while app open:', lastNotification.value);
      })

      // User Tapped Notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
         console.log('Notification action performed:', notification);
         // Handle deep-linking / routing here if needed
      })
    }

   async function saveToken(token) {
      console.log("saveToken", token)
      try {
         const deviceIdInfo = await Device.getId() 
         const deviceId = deviceIdInfo.identifier // Unique per device/app install
         
         const info = await Device.getInfo()
         let deviceType = info.model.toLowerCase().includes('ipad') ? "ipad" : "iphone"
         if (info.isVirtual) { deviceType += " simulator" }

         userMgr.addPushMessageToken(deviceId, token, deviceType)
         console.log('Device FCM token saved to Firestore')
      } 
      catch (error) {
        console.error('Failed to save FCM token', error)
      }
   }

   return { initPushMessages }
})

