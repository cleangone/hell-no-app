import { defineStore } from 'pinia'
import { useChatStore } from './chatStore'
import { usePostStore } from './postStore'
import { ChatStatus } from '@/utils/constants'
   
export const useChatMgr = defineStore('chatMgr', () => {
   const chatStore = useChatStore()
   const postStore = usePostStore()
   
   function getPostCount(chatId) { return postStore.getPosts(chatId).length }

   function deleteChat(chatId) {
      const posts = postStore.getPosts(chatId)
      if (posts.length) { 
         const postIds = posts.map(a => a.id)
         postStore.deletePosts(postIds)
       }

      chatStore.deleteChat(chatId)
   }

   function isActive(chat)   { return (chat?.status == ChatStatus.ACTIVE   ? true : false) }
   function isArchived(chat) { return (chat?.status == ChatStatus.ARCHIVED ? true : false) }
   function toggleArchive(chat) { 
      chatStore.updateChat({ id: chat.id, status: isArchived(chat) ? ChatStatus.ACTIVE : ChatStatus.ARCHIVED })
   }

   return { getPostCount, deleteChat, isActive, isArchived, toggleArchive }
})
