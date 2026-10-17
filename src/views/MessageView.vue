<template>
<ion-page>
<ion-content ref="contentRef" :fullscreen="true">
   <!-- header -->
   <div class="scrolling-header-container">
      <ion-toolbar class="custom-scrolling-toolbar">
         <ion-buttons slot="start"><BackButton/></ion-buttons>
         <ion-title class="text-center text-h6">{{ Route.MESSAGE.display }}</ion-title>
         <ion-buttons slot="end"/>
      </ion-toolbar>
   </div>

   <v-card>
      <v-tabs v-model="tab" bg-color="primary">
         <v-tab :value="TABS.email">Emails</v-tab>
         <v-tab :value="TABS.chat">Chats</v-tab>
         <v-tab :value="TABS.notification">Notifications</v-tab>
      </v-tabs>
      <v-card-text>
         <v-window v-model="tab">
            <v-window-item :value="TABS.email"><Emails/></v-window-item>
            <v-window-item :value="TABS.chat"><Chats :state="State.PUBLIC" @select="onChatSelected"/></v-window-item>
            <v-window-item :value="TABS.notification"><Notifications/></v-window-item>
         </v-window>
      </v-card-text>
  </v-card>
</ion-content>  
</ion-page>
</template>

<script setup>
   import { onMounted, ref, nextTick } from 'vue'
   import { useNotificationStore } from '@/stores/notificationStore'
   import { useViewMgr } from '@/stores/viewMgr'
   import Emails         from '@/components/email/Emails.vue'
   import Chats          from '@/components/chat/Chats.vue'
   import Notifications  from '@/components/notification/Notifications.vue'
   import BackButton     from '@/components/util/BackButton.vue'    
   import { Route, State }  from '@/utils/constants'

   const TABS = { email: "email", chat: "chat", notification: "notification" }
   
   const notificationStore = useNotificationStore()
   const viewMgr = useViewMgr()
   const tab = ref(TABS.email)
   const contentRef = ref(null)

   onMounted(async() => {
      if (notificationStore.myActiveNotifications.length) { tab.value = TABS.notification }
   })

   const onChatSelected = async () => { 
      if (contentRef.value && viewMgr.isXs) {
         await nextTick()
         contentRef.value.$el.scrollToBottom(300) // 300 ms animation
      }
   }
</script>

<style>
</style>
