<template>
   <DefineTemplate> <!-- item info beside or below image -->
      <div class="text-left mt-2">
         <ItemArtistYear :item="props.item"/>
      </div>
      <div v-html="props.item.desc" class="mr-3"></div>
   </DefineTemplate> 

   <div v-if="!viewMgr.isXs">
      <IconButton :icon="descBeside?'mdi-image':'mdi-image-text'" @click="toggleDescBeside()"/>
      <ExpandItems :item="props.item" :items="props.items" buttonClass="ExpandItems"/>    
   </div>     
   <div class="w-100 mx-1">
      <v-row v-if="descBeside">
         <v-col cols="8"> 
            <CachedImg :src="imageUrl(props.item.primaryImage)" @click="toggleDescBeside()" contain/>
         </v-col>
         <v-col><ReuseTemplate/></v-col>
      </v-row>
      <div v-else>
         <CachedImg :src="imageUrl(props.item.primaryImage)" @click="toggleDescBeside()" contain/>
         <ReuseTemplate/>
      </div>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { createReusableTemplate } from '@vueuse/core'
   import { useItemMgr } from '@/stores/itemMgr'
   import { useViewMgr } from '@/stores/viewMgr'
   import CachedImg      from '@/components/image/CachedImg.vue'
   import ExpandItems    from '@/components/item/ExpandItems.vue'
   import ItemArtistYear from '@/components/item/ItemArtistYear.vue'
   import IconButton     from '@/components/util/IconButton.vue'

   const props = defineProps({ item: Object, items: Array })

   const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
   const itemMgr    = useItemMgr()
   const viewMgr    = useViewMgr()
   const descBeside = ref(false) 
   
   const imageUrl = (image) => { return itemMgr.mobileImageUrl(image) }
   const toggleDescBeside = () => { descBeside.value = !descBeside.value }
</script>

<style>
</style>
