<template>
   <v-card class="text-left w-100 thumb-link">
      <div @click="toggleExpand()" :class="toggleClass">
          <span class="ml-3 text-h6">
            <ExpandIcon v-if="collapsible && chatsExist" :isExpanded="isExpanded" large iconClass="admin-link mx-n1"/>
            Chats
         </span>
         <span v-if="isExpanded">
            <TextButton v-if="canUpdate" @click.stop="showAddChatDialog=true" text="Add Chat"/>
            <span v-if="archivedChatsExist"> 
               <TextButton v-if="showArchived" @click.stop="showArchived=false" text="Hide Archived"/>
               <TextButton v-else @click.stop="showArchived=true" text="Show Archived"/>
            </span>
          </span>
          <span v-else-if="dateContentModified" class="text-overline ml-1 mb-1">{{ dateContentModified }}</span>
      </div>
      <div v-if="viewMgr.isXs && isExpanded" class="mx-2">
          <div v-for="chat in displayChats" :key="chat.id"  @click="selectChat(chat)" class="hand mb-2">
            <Chat :chat="chat" :postCount="postCount(chat)" :isSeleted="isSelected(chat)" :canUpdate="canUpdate"/> 
            <div v-if="selectedChat && selectedChat.id == chat.id" class="mb-2 flex-grow-1">
               <div><Posts :chat="chat" :group="group"/></div>
               <AddPost :chat="chat" :group="group"/>
            </div> 
         </div>
      </div>
      <HorizontalDiv v-else-if="isExpanded" class="mx-2 d-flex">
         <div class="mr-3 flex-shrink-0">
            <div v-for="chat in displayChats" :key="chat.id"  @click="selectChat(chat)" class="hand mb-2">
               <Chat :chat="chat" :postCount="postCount(chat)" :isSeleted="isSelected(chat)" :canUpdate="canUpdate"/> 
            </div>
         </div>
         <div class="mb-2 flex-grow-1">
            <div><Posts :chat="selectedChat" :group="group"/></div>
            <AddPost v-if="selectedChat && isActive(selectedChat)" :chat="selectedChat" :group="group"/>
         </div> 
      </HorizontalDiv>
    </v-card>

   <v-dialog v-model="showAddChatDialog" width="auto">
      <AddChat :state="state" :groupId="group.id" @done="showAddChatDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useChatStore }  from '@/stores/chat/chatStore'
   import { useChatMgr }    from '@/stores/chat/chatMgr'
   import { useAdminStore } from '@/stores/adminStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import Chat              from './Chat.vue'
   import AddChat           from './crud/AddChat.vue'
   import Posts             from './Posts.vue'
   import AddPost           from './crud/AddPost.vue'
   import TextButton        from '@/components/util/TextButton.vue'
   import ExpandIcon        from '../util/icon/ExpandIcon.vue'
   import HorizontalDiv     from '../util/HorizontalDiv.vue'
   import { toSortedDateContentModifiedDesc, toSortedNameAsc } from '@/utils/utils'
   import { chatDate } from '@/utils/dateUtils'
   import { ChatStatus, Emit, State } from '@/utils/constants'
   
   const props = defineProps({ state: String, group: Object, initialChatId: String, collapsible: Boolean })
   const emit  = defineEmits([ Emit.SELECT ])

   const userStore    = useUserStore()
   const chatStore    = useChatStore()
   const chatMgr      = useChatMgr()
   const adminStore   = useAdminStore()
   const viewMgr      = useViewMgr()
   const showArchived = ref(false)
   const selectedChat = ref(null)
   const isExpanded   = ref(false)
   const showAddChatDialog = ref(false)
   
   const allChats = computed(() => {
      // console.log("props.initialChatId", props.initialChatId)
      const chats = (props.state == State.GROUP && props.group?.id) ? 
         chatStore.getGroupChats(props.group.id)
         : props.state == State.PUBLIC ? chatStore.publicChats : []
      if (props.initialChatId) {
         for (const chat of chats) {
            if (chat.id == props.initialChatId) { selectedChat.value = chat }
         }
      }
      if (props.state == State.PUBLIC || props.initialChatId) { isExpanded.value = true }

      return chats
   })

   const chatsExist  = computed(() => allChats.value?.length)
   const activeChats = computed(() => allChats.value.filter(chat => chat.status == ChatStatus.ACTIVE))
   const archivedChatsExist = computed(() => allChats.value?.length > activeChats.value?.length)
   const displayChats = computed(() => {
      let chats = showArchived.value ? allChats.value : activeChats.value
     
      // null out selectedChat if that chat not in the curr list
      const chatIds = chats.map(chat => chat.id)
      if (selectedChat.value && !chatIds.includes(selectedChat.value.id)) { selectedChat.value = null }

      // always try to select a chat if not xs
      if (!viewMgr.isXs && !selectedChat.value) {
         let chatToSelect = null
         for (const chat of chats) {
            if (postCount(chat) && (!chatToSelect || chat.dateContentModified > chatToSelect.dateContentModified)) {
               chatToSelect = chat
            }
         }
         if (chatToSelect) { selectChat(chatToSelect) }
      }
      return toSortedNameAsc(chats)
   })

   const dateContentModified = computed(() => {
      const chats = toSortedDateContentModifiedDesc(displayChats.value)
      return chats.length ? chatDate(chats[0].dateContentModified?.toDate()) : ""
   })

   const canUpdate   = computed(() => adminStore.isAdmin || props.group?.moderatorIds.includes(userStore.userId))
   const toggleClass = computed(() => props.collapsible ? "hand" : "")
   const toggleExpand = () => { if (props.collapsible) { isExpanded.value = !isExpanded.value }}
   
   const isActive   = (chat) => { return chatMgr.isActive(chat) }
   const isSelected = (chat) => { return selectedChat.value?.id == chat.id }
   const postCount  = (chat) => { return chatMgr.getPostCount(chat.id) }   

   const selectChat = (chat) => {
      // xs toggles selectedChat so user can see a view of just chats
      if (viewMgr.isXs && isSelected(chat)) { selectedChat.value = null }
      else { selectedChat.value = chat }
      emit(Emit.SELECT, chat.id)
   }   
</script>

<style>
</style>
