import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useHitStore } from './hitStore'
 
export const useHitMgr = defineStore('hitMgr', () => {   
   const hitStore = useHitStore()   
   const hitIds   = ref([])

   async function addHit(id) {
      console.log("hitMgr.addHit", id)    
      if (!hitIds.value.includes(id)) { hitIds.value.push(id) }
      if (hitIds.value.length > 5) {
         hitStore.addHits(hitIds.value)  
            .catch(err => {         
               console.log("Batch addHits failed", err)
               for (const id of hitIds.value) {
                  hitStore.addHit(id)
               }
            })
         hitIds.value = []
      }
   }
   
   return { addHit }
})
