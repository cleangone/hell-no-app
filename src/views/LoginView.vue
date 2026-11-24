<template>
<ion-page>
<ion-content :fullscreen="true">
   <Header>
      <template #left><BackButton class="mr-8"/></template>
      <template #title>{{ Route.LOGIN.display }}</template>
      <template #right><span class="mr-8"></span></template>
   </Header>
   <div class="my-5 login text-left">
      <v-form v-model="dataValid">  
         <v-text-field v-model="email" label="Email" type="email" autocomplete="email" :rules="emailRule"/>
         <v-text-field v-model="password" label="Password" :type="showPassword?'text':'password'" autocomplete="current-password" 
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
   import { Capacitor } from '@capacitor/core'
   import { PasswordAutofill } from '@capawesome/capacitor-password-autofill'
   import { useIonRouter } from '@ionic/vue'
   import { useAuthMgr }   from '@/stores/authMgr'
   import Header           from '@/components/util/Header.vue'
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
      try {
         const user = await authMgr.login(email.value, password.value)
         console.log("Logged in successfully", user.uid)
         
         try {
            await setAutofill(email.value, password.value)
         } 
         catch (autofillError) {
            console.warn("Could not save autofill credential", autofillError)
         }

         email.value = ""
         password.value = ""
         errMsg.value = ""
         ionRouter.push(Route.HOME.url)
      }
      catch(error) {
         console.log("Firebase Auth Error Code:", error.code)
         if (error.code == "auth/invalid-email")       { errMsg.value = "Email invalid" }
         else if (error.code == "auth/user-not-found") { errMsg.value = "User not found" }
         else if (error.code == "auth/wrong-password") { errMsg.value = "Password incorrect" }
         else { errMsg.value = "Email/password incorrect" }
      }
   }

   async function setAutofill(email, password) {
      if (Capacitor.getPlatform() === 'ios') {
         await PasswordAutofill.savePassword({
            domain: 'hell-no.gallery',
            username: email,
            password: password,
         })
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
