<template>
   <span v-if="!viewMgr.isMobile" class="title">Forgot Password</span>
   <div class="my-5 login text-left">
      <v-form v-model="dataValid">  
         <v-text-field v-model="email" label="Email" :rules="emailRule"></v-text-field>
      </v-form>
      <v-row justify="space-between">
         <v-btn @click="resetPassword()" :disabled="!dataValid" class="ml-3">Reset Password</v-btn>
      </v-row>
   </div>
   <div class="login-info  pt-4">{{ infoMsg }}</div>
   <div class="login-error pt-4">{{ errMsg }}</div>
</template>

<script setup>
   import { ref } from 'vue'
   import { sendPasswordResetEmail } from "firebase/auth"
   import { auth } from '@/firebase' 
   import { useViewMgr } from '@/stores/viewMgr'
   import { emailRule } from '@/utils/utils'
   
   const viewMgr = useViewMgr()
   const email = ref("")
   const dataValid = ref(true)
   const infoMsg = ref("")
   const errMsg  = ref("")

   const resetPassword = () => {
      infoMsg.value = ""
      errMsg.value = ""
      sendPasswordResetEmail(auth, email.value).then(() => {
         infoMsg.value = "Reset email sent"
      })
      .catch((error) => {
         console.error("sendPasswordResetEmail error", error.code, error.message)
         if (error.code == "auth/user-not-found") { errMsg.value = "Email not found" }
         else { errMsg.value = error.message }
      })
   }
</script>

<style>
</style>
