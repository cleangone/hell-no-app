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
   import { useViewMgr } from '@/stores/viewMgr'
   import { useAuthMgr } from '@/stores/authMgr'
   import { emailRule } from '@/utils/utils'
   
   const authMgr = useAuthMgr()
   const viewMgr = useViewMgr()
   const email     = ref("")
   const dataValid = ref(true)
   const infoMsg   = ref("")
   const errMsg    = ref("")

   const resetPassword = () => {
      infoMsg.value = ""
      errMsg.value = ""
      try {
         authMgr.sendPasswordResetEmail(email.value)
         infoMsg.value = "Reset email sent"
      }
      catch (error) {
         console.error("sendPasswordResetEmail error", error.code, error.message)
         if (error.code == "auth/user-not-found") { errMsg.value = "Email not found" }
         else { errMsg.value = error.message }
      }
   }
</script>

<style>
</style>
