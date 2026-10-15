<template>
<ion-page>
<ion-content :fullscreen="true">
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
            <v-window-item :value="TABS.chat"><Chats :state="State.PUBLIC"/></v-window-item>
            <v-window-item :value="TABS.notification"><Notifications/></v-window-item>
         </v-window>
      </v-card-text>
  </v-card>
</ion-content>  
</ion-page>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useNotificationStore } from '@/stores/notificationStore'
   import Emails         from '@/components/email/Emails.vue'
   import Chats          from '@/components/chat/Chats.vue'
   import Notifications  from '@/components/notification/Notifications.vue'
   import BackButton     from '@/components/util/BackButton.vue'    
   import { Route, State }  from '@/utils/constants'

   const TABS = { email: "email", chat: "chat", notification: "notification" }
   
   const notificationStore = useNotificationStore()
   const tab = ref(TABS.email)

   onMounted(async() => {
      if (notificationStore.myActiveNotifications.length) { tab.value = TABS.notification }
   })
</script>

<style>
</style>
