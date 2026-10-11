<template>
   <v-card title="Edit Email" class="edit-dialog">
      <v-form v-model="dataValid">
         <div class="pa-md-4">
            <v-text-field v-model="email" label="Email" :rules="emailRule"></v-text-field>
         </div>
      </v-form>

      <div class="error pa-4">{{ errorMsg }}</div>
      
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { auth } from '@/firebase' 
   import { updateEmail  } from "firebase/auth"
   import { useUserStore } from '@/stores/userStore'
   import { emailRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({user: Object})
   const emit = defineEmits([Emit.DONE])
   const userStore = useUserStore()
   const email = ref('')
   const dataValid = ref(true)
   const errorMsg = ref("")

   onMounted(() => {
      email.value = props.user.email
   })

   const save = () => {
      updateEmail(auth.currentUser, email.value)
         .then(() => { 
            // console.log("Auth email updated, updating user.email", email.value)
            userStore.updateUser({ id: props.user.id, email: email.value }) 
            emit(Emit.DONE)
         })
         .catch((error) => {
            console.log("Error updating email", error)
            if (error.code == "auth/invalid-email") { errorMsg.value = "Email invalid" }
            else if (error.code == "auth/user-not-found") { errorMsg.value = "User not found" }
            else if (error.code == "auth/operation-not-allowed") { errorMsg.value = "Must verify new email before changing" }
            else if (error.code == "auth/requires-recent-login") { errorMsg.value = "Must login recently to update email" }
            else { errorMsg.value = "Error updating email" }
         })
   }
</script>

<style>
</style>
