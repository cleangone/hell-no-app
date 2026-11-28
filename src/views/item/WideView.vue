<template>
<ion-page>
<ion-content> 
   <Header>
      <template #left><BackButton class="ml-n1"/></template>
      <template #title>{{ itemName }}</template>
      <template #right><span class="mr-8"></span></template>
   </Header>
   <WidePanel :item="item" :origin="origin" :nav="nav" :child="child" @item="onItemSwipe"/>
</ion-content>
</ion-page>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import WidePanel  from './WidePanel.vue'
   import BackButton from '@/components/util/BackButton.vue'  
   import Header     from '@/components/util/Header.vue'
   
   const currItem  = ref(null)

   const props = defineProps({ item: Object, origin: String, nav: String, child: String })

   const itemName = computed(() => currItem.value?.name ?? props.item.name)
   const onItemSwipe = async (item) => { currItem.value = item }
</script>

<style>
</style>
