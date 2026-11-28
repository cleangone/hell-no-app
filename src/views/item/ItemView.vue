<template>
<ion-page>
<ion-content> 
   <div v-if="viewMgr.isWide">
      <WideView :item="paramItem" :origin="props.origin" :nav="props.nav" :child="props.child"/>   
   </div>
   <div v-else-if="paramItem">
      <MobileView :item="mobileItem" :origin="props.origin" :nav="props.nav"/>
   </div>
</ion-content>
</ion-page>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemStore } from '@/stores/itemStore'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewMgr }   from '@/stores/viewMgr'
   import MobileView       from './MobileView.vue'
   import WideView         from './WideView.vue'

   const itemStore = useItemStore()
   const itemMgr   = useItemMgr()
   const viewMgr   = useViewMgr()

   const props = defineProps({ origin: String, nav: String, id: String, child: String })

   const paramItem = computed(() => { 
      console.log("paramItem id", props.id)
      // console.log("paramItem origin", props.origin)
      // console.log("paramItem nav",    props.nav)
      
      let item = itemStore.getItem(props.id)
      if (!item) { return null } 
      
      viewMgr.addHit(item.id)
      return item 
   })

   const mobileItem = computed(() => { 
       if (isItemGroup(paramItem.value)) { 
         const itemGroup = { ...item, childNum: props.child ?? "1" }
         return itemMgr.extractFromItemGroup(itemGroup) 
      }
      else { return paramItem.value }
   })

   const isItemGroup  = (item) => { return itemMgr.isItemGroup(item) }
</script>

<style>
</style>
