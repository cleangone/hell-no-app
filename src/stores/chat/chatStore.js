import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useUserStore }  from '@/stores/userStore'
import { useChatAccess } from '@/stores/access/chat/chatAccess'
import { dateUuid, isGroup, isPublic } from '@/utils/utils'
import { ChatStatus }  from '@/utils/constants'

/* 
   Chat
      id
      name
      state: State: PUBLIC, GROUP, PRIVATE  
      status: ChatStatus: ACTIVE, ARCHIVED
      userId
      groupId
      description
      dateCreated
      dateModified
      dateContentModified
*/

const TABLE = 'chats'

export const useChatStore = defineStore('chatStore', () => {
   const chatAccess = useChatAccess() 
   const userStore  = useUserStore()
   const chatCollection = collection(db, TABLE)
   function chatDoc(id) { return doc(db, TABLE, id) }

   const init = async () => { chatAccess.addListener() } 
   const chats = computed(() => chatAccess.records)

   const publicChats = computed(() => { return chats.value.filter(chat => isPublic(chat)) })   
  
   const chatIdToChat = computed(() => new Map(chats.value.map((obj) => [obj.id, obj])))
   function getChat(id) { return chatIdToChat.value.get(id) }

   const groupIdToGroupChats = computed(() => chats.value.reduce((groupIdToChats, chat) => {
         if (isGroup(chat) && chat.groupId) {
            if (!groupIdToChats.has(chat.groupId)) { groupIdToChats.set(chat.groupId, []) }
            groupIdToChats.get(chat.groupId).push({ ...chat })
         }
         return groupIdToChats 
      }, new Map())
   )
   function getGroupChats(groupId) { 
      return groupIdToGroupChats.value.has(groupId) ? groupIdToGroupChats.value.get(groupId) : [] }

   function addChat(chat) {
      const chatToAdd = { 
         ...chat, 
         id: dateUuid(), 
         status: ChatStatus.ACTIVE,
         userId: userStore.userId,
         dateCreated: serverTimestamp(), 
         dateModified: serverTimestamp(),
         dateContentModified: serverTimestamp() }
      setDoc(chatDoc(chatToAdd.id), chatToAdd)
   }

   function updateChat(chat) {
      const chatToUpdate = { ...chat, dateModified: serverTimestamp() }
      updateDoc(chatDoc(chatToUpdate.id), chatToUpdate)
   }

   function updateChatContentModified(chatId) {
      updateDoc(chatDoc(chatId), { dateContentModified:serverTimestamp(), dateModified:serverTimestamp() })
   }

   function deleteChat(id) {
      deleteDoc(doc(chatCollection, id))
   }

   return { chats, init, publicChats, getChat, getGroupChats, 
            addChat, updateChat, updateChatContentModified, deleteChat }
})
