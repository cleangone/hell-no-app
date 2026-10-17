<template>
<ion-page>
<ion-content :fullscreen="true">
   <!-- header -->
   <div class="scrolling-header-container">
      <ion-toolbar class="custom-scrolling-toolbar">
         <ion-buttons slot="start"><BackButton/></ion-buttons>
         <ion-title class="text-center text-h6">{{ Route.LOGIN.display }}</ion-title>
         <ion-buttons slot="end"/>
      </ion-toolbar>
   </div>

   <div class="my-5 login text-left">
      <v-form v-model="dataValid">  
         <v-text-field v-model="email" label="Email" :rules="emailRule"></v-text-field>
         <v-text-field v-model="password" label="Password" :type="showPassword?'text':'password'" 
            :append-inner-icon="showPassword?'mdi-eye-off':'mdi-eye'" @click:append-inner="showPassword=!showPassword"/>
      </v-form>
      <v-row justify="space-between">
         <v-btn @click="login()" :disabled="!dataValid || !password" class="ml-3">Login</v-btn>
         <RouterLink :to="Route.FORGOT.url" class="mt-1 mr-3">Forgot Password</RouterLink>
      </v-row>
   </div>
   <div class="login-error pt-4 mx-3">{{ errMsg }}</div>
</ion-content>  
</ion-page>
</template>

<script setup>
   import { ref } from 'vue'
   import { useIonRouter } from '@ionic/vue'
   import { useAuthMgr }   from '@/stores/authMgr'
   import { emailRule } from '@/utils/utils'
   import { Route } from '@/utils/constants'
   
   const ionRouter = useIonRouter()
   const authMgr   = useAuthMgr()
   const email     = ref("")
   const password  = ref("")
   const showPassword = ref(false)
   const dataValid = ref(true)
   const errMsg    = ref("")

   const login = async () => {
      const result = await authMgr.login(email.value, password.value)
      if (result.success) {
         email.value = ""
         password.value = ""
         errMsg.value = ""
         ionRouter.push(Route.HOME.url)
      }
      else {
         console.error("Firebase Auth Error Code:", result.error.code)
         console.error("Firebase Auth Error Message:", result.error.message)
      
         if (result.error.code == "auth/invalid-email")       { errMsg.value = "Email invalid" }
         else if (result.error.code == "auth/user-not-found") { errMsg.value = "User not found" }
         else if (result.error.code == "auth/wrong-password") { errMsg.value = "Password incorrect" }
         else { errMsg.value = "Email/password incorrect" }
      }
   }
</script>

<style>
   .login {
      margin: auto;
      width: 50%;
      min-width: 300px;
      max-width: 400px;
   }
   .login-info {
      color: blue;
      font-size: 20px;
   }
   .login-error {
      color: red;
      font-size: 20px;
   }
   
</style>
