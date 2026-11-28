<template>
   <Header>
      <template #left><BackButton class="ml-n1"/></template>
      <template #title>{{ itemName }}</template>
      <template #right><span class="mr-8"></span></template>
   </Header>
   <MobilePanel :item="item" :origin="origin" :nav="nav" @item="onItemSwipe"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import MobilePanel from './MobilePanel.vue'
   import BackButton  from '@/components/util/BackButton.vue'  
   import Header      from '@/components/util/Header.vue'
   
   const currItem  = ref(null)

   const props = defineProps({ item: Object, origin: String, nav: String })

   const itemName = computed(() => currItem.value?.name ?? props.item.name)
   const onItemSwipe = async (item) => { currItem.value = item }
</script>
