<template>
   <div class="text-left">
      <div class="text-h6">
         Email <TextButton v-if="!emailContext" @click="emailContext={}" text="Send Email"/>
      </div>
      <div v-if="emailContext">
         <SendEmail :emailContext="emailContext" @done="emailContext=null"/>
      </div>
      <div v-else v-if="visibleThreadsExist">
         <v-card v-for="thread in visibleEmailThreads" class="bg-blue-lighten-5 mb-2">
            <v-card-item class="pa-0">
               <!-- title -->
               <div @click="toggleEmailThread(thread)" class="px-2 py-0 pointer"> 
                  <!-- mobile -->
                  <div v-if="viewMgr.isMobile"> 
                     <v-row class="d-flex align-center text-subtitle-1 mx-0 mt-0">
                        <RouterLink v-for="contact in getEmailContacts(thread)" :to="Route.USER.url + contact.userId" class="admin-link mr-2">{{contact.username }}</RouterLink>
                        {{ thread.name }} {{ getEmailCountText(thread) }}
                     </v-row>
                     <v-row class="d-flex justify-end text-overline mx-0 mt-n2 mb-0">
                        {{ getEmailThreadDate(thread.dateModified) }} 
                     </v-row>
                  </div>
                  <!-- desktop -->
                  <div v-else class="d-flex align-center">  
                     <v-row class="d-flex align-center text-subtitle-1">
                        <v-col cols="8" class="text-subtitle-1">
                           <RouterLink v-for="contact in getEmailContacts(thread)" :to="Route.USER.url + contact.userId" class="mr-2">{{contact.username }}</RouterLink>
                           {{ thread.name }}  {{ getEmailCountText(thread) }}
                        </v-col>
                        <v-col class="d-flex justify-end text-overline">
                           {{ getEmailThreadDate(thread.mostRecentEmailDate) }}
                        </v-col>
                     </v-row>
                  </div>
               </div>
               <!-- selected emails -->
               <div v-if="isSelected(thread)" v-for="email in thread.visibleEmails" class="mx-2 mb-2 pt-1 bg-white">
                  <!-- mobile -->
                  <div v-if="viewMgr.isMobile" class="mx-2">
                     <v-row class="d-flex align-center">
                        <v-col class="flex-grow-1 flex-shrink-0">
                           <span class="text-subtitle-1">{{ email.subject }}</span>
                           <v-icon icon="mdi-email-arrow-left" @click="reply(thread, email)" color="blue-darken-2" size="small" class="ml-2 pb-1 pointer"/> 
                        </v-col>
                        <v-col class="d-flex flex-grow-0 flex-shrink-1 justify-end mx-1">
                           <v-icon icon="mdi-trash-can" @click="deleteEmail(thread, email)" color="blue-darken-2" size="small" class="ml-2 pb-1 pointer"/> 
                        </v-col>
                     </v-row>
                     <v-row class="mx-0 mt-0 mb-1">{{ getEmailDate(email.dateCreated) }}</v-row>
                  </div>
                  <!-- desktop -->
                  <div v-else class="mx-2">
                     <v-row class="d-flex align-center">
                        <v-col class="flex-grow-1 flex-shrink-0">
                           <span class="text-subtitle-1">{{ email.subject }}</span>
                           <span class="text-overline ml-2">{{ getEmailDate(email.dateCreated) }}</span>
                           <v-icon icon="mdi-email-arrow-left" @click="reply(thread, email)" color="blue-darken-2" size="small" class="ml-2 pb-1 pointer"/> 
                        </v-col>
                        <v-col class="d-flex flex-grow-0 flex-shrink-1 justify-end mx-1">
                           <v-icon icon="mdi-trash-can"  @click="deleteEmail(thread, email)" color="blue-darken-2" size="small" class="ml-2 pb-1 pointer"/> 
                        </v-col>
                     </v-row>
                  </div>
                  <div class="horizontal-container pt-2 mb-2">
                     <div v-if="email.itemId" class="pt-2 mb-2">
                        <ItemThumb :item="getItem(email.itemId)" :origin="ItemOrigin.EXTERNAL"/>
                     </div>
                     <div class="ml-2">
                        <div>To: <RouterLink :to="Route.USER.url + email.toContact.userId" class="admin-link ml-2">{{ email.toContact.username }}</RouterLink></div>
                        <div>From: <RouterLink :to="Route.USER.url + email.fromContact.userId" class="admin-link ml-2">{{ email.fromContact.username }}</RouterLink></div>
                        <div>{{ email.content }}</div>
                     </div>
                  </div>
               </div>
            </v-card-item>
         </v-card>
      </div>
   </div>

   <v-dialog v-model="showDeleteEmail" width="auto">
      <DeleteEmail :emailThread="selectedEmailThread" :email="selectedEmail" @done="showDeleteEmail=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useEmailStore } from '@/stores/emailStore'
   import { useItemStore }  from '@/stores/itemStore'
   import { useViewStore }  from '@/stores/viewStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import SendEmail   from './SendEmail.vue'
   import DeleteEmail from './DeleteEmail.vue'
   import ItemThumb   from '@/components/item/thumb/ItemThumb.vue'
   import TextButton  from '@/components/util/TextButton.vue'
   import { emailThreadDate, emailDate } from '@/utils/dateUtils'
   import { ItemOrigin, Route } from '@/utils/constants'
   
   const userStore  = useUserStore()
   const emailStore = useEmailStore()
   const itemStore  = useItemStore()
   const viewStore  = useViewStore()
   const viewMgr    = useViewMgr()
   const emailContext = ref(null)
   const selectedEmailThreadIds = ref(new Set())
   const showDeleteEmail = ref(false)
   const selectedEmailThread = ref(null)
   const emailThreadItems = new Map()
   const selectedEmail = ref(null)
   
   onMounted(() => {
      if (viewStore.emailContext) {
         emailContext.value = { ...viewStore.emailContext }
         viewStore.resetEmailContext()
      }
   })

   const visibleThreadsExist = computed(() => visibleEmailThreads.value.length)
   const visibleEmailThreads = computed(() => { 
      const threads = []
      for (const thread of emailStore.myEmailThreads) {
         const displayThread = { ...thread, visibleEmails: [] }
         for (const email of displayThread.emails) {
            if (email.visibleToUserIds.includes(userStore.userId) ) { 
               if (!displayThread.mostRecentEmailDate || email.dateCreated > displayThread.mostRecentEmailDate) {
                  displayThread.mostRecentEmailDate = email.dateCreated
               }
               displayThread.visibleEmails.push(email) 
            }
         }
         if (displayThread.visibleEmails.length) { threads.push(displayThread) }
      }

      threads.sort(function(a, b) { return b.mostRecentEmailDate - a.mostRecentEmailDate })
      return threads
   })

   const getEmailCountText = (thread) => { return thread.visibleEmails.length > 1 ? "(" + thread.visibleEmails.length + ")" : "" }
   const getEmailContacts  = (thread) => { 
      const contacts = new Map()
      for (const email of thread.emails) {
         const contact = getOtherContact(email)
         if (!contacts.has(contact.userId)) { contacts.set(contact.userId, contact) }
      }
      return Array.from(contacts.values())
   }

   const myContact = computed(() => { return getEmailContact(userStore.user) })
   const getOtherContact = (email) => { return email.fromContact.userId == myContact.value.userId  ? email.toContact : email.fromContact }
   const getEmailContact = (user)  => { return { userId: user.id, username: user.username, email: user.email }}
   const getEmailThreadDate = (timestamp) => { return timestamp ? emailThreadDate(timestamp.toDate()) : "" }
   const getEmailDate       = (timestamp) => { return timestamp ? emailDate(timestamp.toDate()) : "" }
   const getItem = (itemId) => { return emailThreadItems.get(itemId) }
   const isSelected = (thread) => { return selectedEmailThreadIds.value.has(thread.id) }   
   const toggleEmailThread = (thread) => { 
      if (isSelected(thread)) { selectedEmailThreadIds.value.delete(thread.id) }
      else { 
         for (const email of thread.emails) {
            if (email.itemId && !emailThreadItems.has(email.itemId)) { 
               emailThreadItems.set(email.itemId, itemStore.getItem(email.itemId)) }
         }
         selectedEmailThreadIds.value.add(thread.id) 
      }
   }

   const reply = (thread, email) => { emailContext.value = { reply: { thread: thread, email: email }}} 

   // delete email by removing user from email.visibleToUserIds 
   // backend will clean up emails and threads once they are no longer visible to anyone
   const deleteEmail = (thread, email) => { 
      selectedEmailThread.value = thread
      selectedEmail.value = email
      showDeleteEmail.value = true
   }
</script>

<style>
</style>
