<template>
   <v-card title="Update Password" class="edit-dialog">
      <v-form v-model="dataValid">
         <div class="pa-md-4">
            <v-text-field v-model="password" :type="showPassword?'text':'password'" label="Password" :rules="minRule"
               :append-inner-icon="showPassword?'mdi-eye-off':'mdi-eye'" @click:append-inner="showPassword=!showPassword"></v-text-field>
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
   import { ref } from 'vue'
   // import { auth } from '@/firebase' 

   // TODO - will have to be updated for ion/firebase 
   import { updatePassword  } from "firebase/auth"
   import { minRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ userId: String })
   const emit = defineEmits([Emit.DONE])
   const password = ref('')
   const showPassword = ref(false)
   const dataValid = ref(true)
   const errorMsg = ref("")

   const save = () => {
      // updatePassword(auth.currentUser, password.value)
      //    .then(() => { 
      //       console.log("Password updated")
      //       emit(Emit.DONE)
      //    })
      //    .catch((error) => {
      //       console.log("Error updating password", error.message)
      //       if (error.code == "auth/user-not-found") { errorMsg.value = "User not found" }
      //       else if (error.code == "auth/operation-not-allowed") { errorMsg.value = "Must verify new email before changing" }
      //       else if (error.code == "auth/requires-recent-login") { errorMsg.value = "Must login recently to update password" }
      //       else { errorMsg.value = "Error updating email" }
      //    })
   }
</script>

<style>
</style>
