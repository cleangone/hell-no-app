import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore"
// import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore }  from '../userStore'
import { usePostAccess } from '@/stores/access/chat/postAccess'
import { dateUuid } from '@/utils/utils'

/* 
   ChatPost
      id
      chatId
      userId
      text
      itemId
      dateCreated
      dateModified
*/

const TABLE = 'chat-posts'

export const usePostStore = defineStore('postStore', () => {
   const postAccess = usePostAccess() 
   const userStore = useUserStore()
   const postCollection = collection(db, TABLE)
   function postDoc(id) { return doc(db, TABLE, id) }

   const addListener    = async () => { return postAccess.addListener() } 
   const removeListener = async () => { return postAccess.removeListener() }
   const posts = computed(() => postAccess.records)

   // const posts = useFirestore(postCollection, [])
   const chatIdToPosts = computed(() => {
      const map = new Map()
      for (const post of posts.value) { 
         if (!map.has(post.chatId) ) { map.set(post.chatId, []) }
         map.get(post.chatId).push(post)
      }
      return map
   })
   
   function getPosts(chatId) { return chatIdToPosts.value.has(chatId) ? chatIdToPosts.value.get(chatId) : [] }

   function addPost(post) {
      const postToAdd = { 
         ...post, 
         id: dateUuid(), 
         userId: userStore.userId,
         dateCreated: serverTimestamp(), 
         dateModified: serverTimestamp() }
      setDoc(postDoc(postToAdd.id), postToAdd)
   }

   function updatePost(post) {
      const postToUpdate = { ...post, dateModified: serverTimestamp() }
      updateDoc(postDoc(postToUpdate.id), postToUpdate)
   }
   
   // todo - orphans replies - have postMgr
   function deletePost(id) {
      deleteDoc(doc(postCollection, id))
   }

   function deletePosts(ids) {
      const batch = writeBatch(db)
      for (const id of ids) {
         batch.delete(doc(postCollection, id))
      }
      batch.commit()
   }

   // transient - should probably be in a postMgr/viewStore
   const postItem = ref(null)
   function setPostItem(item) { postItem.value = item }
   function clearPostItem()   { postItem.value = null }

   return { addListener, removeListener, 
            getPosts, addPost, updatePost, deletePost, deletePosts, 
            postItem, setPostItem, clearPostItem }
})
