<template>
   <v-card title="Edit Artist" class="edit-dialog">
      <v-form v-model="dataValid">
         <v-container>
            <v-row>
               <v-col class="pl-4">
                  <v-text-field v-model="firstName" label="First name" />
                  <v-text-field v-model="middleName" label="Middle name/initial"/>
                  <v-combobox v-model="akaFor" label="AKA" :items="primaryArtists" clearable compact />
                </v-col>
               <v-col class="pr-4">
                  <v-text-field v-model="name" label="Last name/name" :rules="requiredRule"/>
                  <v-text-field v-model="shortName" label="Short name" :rules="requiredRule"/>
                  <v-text-field v-model="sortName" label="Sort name" :rules="requiredRule"/>
               </v-col>
            </v-row>
         </v-container>
      </v-form>
      <v-card-actions class="justify-end mt-5">
         <v-btn @click="save()" :disabled="!dataValid" color="primary">Save</v-btn>
         <v-btn @click="$emit(Emit.DONE)" color="primary">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useArtistStore } from '@/stores/artistStore'
   import { useArtistMgr }   from '@/stores/artistMgr'
   import { useItemStore }   from '@/stores/itemStore'
   import { requiredRule } from '@/utils/utils'
   import { ActionType, ArtistState, Emit } from '@/utils/constants'
   
   const props = defineProps({ artist: Object })
   const emit = defineEmits([Emit.DONE])

   const artistStore = useArtistStore()
   const artistMgr   = useArtistMgr()
   const itemStore   = useItemStore()   
   const firstName  = ref('')
   const middleName = ref('')
   const name       = ref('')
   const shortName  = ref('')
   const sortName   = ref('')
   const akaFor = ref()
   const dataValid = ref(true)
   
   onMounted(() => {
      firstName.value  = props.artist.firstName
      middleName.value = props.artist.middleName
      name.value       = props.artist.name
      shortName.value  = props.artist.shortName
      sortName.value   = props.artist.sortName

      if (props.artist.akaForId) {
         const akaArtist = artistStore.getArtist(props.artist.akaForId)
         akaFor.value = { title: akaArtist.fullName, value: akaArtist }
      }
   })
   
   const primaryArtists = computed(() => artistMgr.getPrimaryArtistsForAKA())

   const save = () => {
      const fullName = artistMgr.getFullName(firstName.value, middleName.value, name.value)
      const akaPrimaryId = akaFor.value ? akaFor.value.value.id : null

       artistStore.updateArtist({
         id: props.artist.id,
         firstName: firstName.value,
         middleName: middleName.value,
         name: name.value,
         fullName: fullName,
         shortName: shortName.value,
         sortName: sortName.value,
         state: akaPrimaryId ? ArtistState.AKA : ArtistState.PRIMARY,
         akaForId: akaPrimaryId ? akaPrimaryId : "",
         allNames: fullName,
         action: akaPrimaryId || artistMgr.hasAKAs(props.artist.id) ? ActionType.PROCESS : "" 
      })

      // ugly workaround - backend updates allNames of this artist and any related by aka 
      // item update eventually done by backend and incorporate otherArtists
      if (props.artist.fullName != fullName || props.artist.shortName != shortName.value) {
         setTimeout(() => { 
            const updatedArtist = artistStore.getArtist(props.artist.id) 
            const itemArtist = artistMgr.getItemArtist(updatedArtist)
            for (const item of itemStore.getArtistItems(props.artist.id) ) {
               if (item.primaryArtist.id == itemArtist.id) {
                  console.log("Updating artist for " + item.name)
                  itemStore.updateItem({ id: item.id, primaryArtist: itemArtist}, false)
               }
            }
         }, 30000) // 20 seconds - allows backend to update allNames
      }
   
      emit(Emit.DONE)
   }

</script>

<style>
</style>
