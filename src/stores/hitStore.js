import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { doc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore"
import { useHitAccess } from './access/hitAccess'
import { toSortedDateModifiedDesc } from '@/utils/utils'

/*
   Hit
      id (item id)
      views: integer
      dateCreated
      dateModified
*/

const TABLE = 'hits'

export const useHitStore = defineStore('hit', () => {
   const hitAccess = useHitAccess()
   function hitDoc(id) { return doc(db, TABLE, id) }
   
   const addListener    = async () => { hitAccess.addListener() } 
   const removeListener = async () => { hitAccess.removeListener() }
   const rawHits = computed(() => hitAccess.hits)

   // const rawHits = useFirestore(hitCollection)   
   const hits = computed(() => rawHits.value ? toSortedDateModifiedDesc(rawHits.value) : [])
   const idToHit = computed(() => { return rawHits.value ? new Map(rawHits.value.map((obj) => [obj.id, obj])) : new Map() })
   function getHit(id) { return idToHit.value ? idToHit.value.get(id) : null } 

   // assume update, add if error
   function addHit(id) { 
      updateDoc(hitDoc(id), { id:id, views: increment(1), dateModified:serverTimestamp() })
         .catch((error) => {
            setDoc(hitDoc(id), {
               id: id,
               views: 1,
               dateCreated:  serverTimestamp(),
               dateModified: serverTimestamp()
            })
         })
   }

   return { 
      hits, addListener, removeListener, getHit, addHit
   }
})
