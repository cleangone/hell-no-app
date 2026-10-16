import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore"
// import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from '../userStore'
import { useReplyAccess } from '@/stores/access/chat/replyAccess'
import { dateUuid } from '@/utils/utils'

/* 
   ChatReply
      id
      postId
      userId
      text
      dateCreated
      dateModified
*/

const TABLE = 'chat-replies'

export const useReplyStore = defineStore('replyStore', () => {
   const replyAccess = useReplyAccess() 
   const userStore = useUserStore()
   const replyCollection = collection(db, TABLE)
   function replyDoc(id) { return doc(db, TABLE, id) }

   const addListener    = async () => { return replyAccess.addListener() } 
   const removeListener = async () => { return replyAccess.removeListener() } 
   const replies = computed(() => replyAccess.records)

   // const replies = useFirestore(replyCollection, [])
   const postIdToReplies = computed(() => {
      const map = new Map()
      for (const reply of replies.value) { 
         if (!map.has(reply.postId) ) { map.set(reply.postId, []) }
         map.get(reply.postId).push(reply)
      }
      return map
   })
   
   function getReplies(postId) { 
      return postIdToReplies.value.has(postId) ? postIdToReplies.value.get(postId) : [] }

   function addReply(reply) {
      const replyToAdd = { 
         ...reply, 
         id: dateUuid(), 
         userId: userStore.userId,
         dateCreated: serverTimestamp(), 
         dateModified: serverTimestamp() }
      setDoc(replyDoc(replyToAdd.id), replyToAdd)
   }

   function updateReply(reply) {
      updateDoc(replyDoc(reply.id), { ...reply, dateModified: serverTimestamp() })
   }
   
   function deleteReply(id) { deleteDoc(doc(replyCollection, id)) }

   function deleteReplies(ids) {
      const batch = writeBatch(db)
      for (const id of ids) {
         batch.delete(doc(replyCollection, id))
      }
      batch.commit()
   }

   return { addListener, removeListener, getReplies, addReply, updateReply, deleteReply, deleteReplies }
})
