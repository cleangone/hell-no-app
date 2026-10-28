import { computed } from 'vue'
import { defineStore } from 'pinia'
import { FieldValue } from '@capacitor-firebase/firestore'
import { useHitAccess } from './access/hitAccess'
import { toSortedDateModifiedDesc } from '@/utils/utils'

/*
   Hit
      id (item id)
      views: integer
      dateCreated
      dateModified
*/

export const useHitStore = defineStore('hit', () => {
   const hitAccess = useHitAccess()
   
   const addListener = async () => { hitAccess.addListener() } 
   const rawHits = computed(() => hitAccess.records)  
   
   const hits = computed(() => rawHits.value ? toSortedDateModifiedDesc(rawHits.value) : [])
   const idToHit = computed(() => { return rawHits.value ? new Map(rawHits.value.map((obj) => [obj.id, obj])) : new Map() })
   function getHit(id) { return idToHit.value ? idToHit.value.get(id) : null } 

   async function addHit(id) {
      console.log("addHit", id)

      hitAccess.update(id, { views: FieldValue.increment(1) })
         .catch(err => {
            console.log(`Update failed, attempting create`, err)
            hitAccess.create(id, { id: id, views: 1 })
               .catch(createError => {
                  console.error(`Create failed`, createError)
               })
         })
      console.log("addHit done")
   }

   async function addHits(ids) {
      console.log("addHits", ids.length)
      const updates = []
      for (const id of ids) {
         updates.push({ id: id, data: { views: FieldValue.increment(1) }})
      }
      hitAccess.batchUpdate(updates)
   }

   return { hits, addListener, getHit, addHit, addHits }
})
