import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { FirebaseMessaging } from '@capacitor-firebase/messaging'
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
         console.log("Bypassing pushMessages - user not set")
         return 
      }

      const deviceInfo = await Device.getInfo()
      if (deviceInfo.isVirtual) { 
         console.log("Bypassing pushMessages - virtual device")
         return 
      }
 
      const deviceType = deviceInfo.model.toLowerCase().includes('ipad') ? "ipad" : "iphone"
      console.log("initPushMessages", deviceType)
      
      const result = await FirebaseMessaging.requestPermissions()
      if (result.receive !== 'granted') {
         console.warn('User denied push notification permissions')
         return
      }

      await FirebaseMessaging.deleteToken()
      const tokenResult = await FirebaseMessaging.getToken()
      fcmToken.value = tokenResult.token
      isRegistered.value = true
      await saveToken(fcmToken.value, deviceType)

      // Listen for token refreshes
      FirebaseMessaging.addListener('tokenRefresh', async (event) => {
         fcmToken.value = event.token;
         await saveToken(event.token, deviceType)
      });

      // Listen for foreground notifications
      FirebaseMessaging.addListener('notificationReceived', (notification) => {
         lastNotification.value = notification;
         console.log('Notification received:', notification)
      })
    }

   async function saveToken(token, deviceType) {
      console.log("saveToken", token)
      try {
         const deviceIdInfo = await Device.getId() 
         const deviceId = deviceIdInfo.identifier // Unique per device/app install
         
         userMgr.addPushMessageToken(deviceId, token, deviceType)
         console.log('Device FCM token saved to Firestore')
      } 
      catch (error) {
        console.error('Failed to save FCM token', error)
      }
   }

   return { initPushMessages }
})

