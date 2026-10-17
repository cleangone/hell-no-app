<template>
   <h1>Register</h1>
   <v-form v-model="dataValid" class="mt-2 login">
      <v-text-field v-model="email"     label="Email"      :rules="emailRule"    v-on:update:modelValue="resetError"/>
      <v-text-field v-model="firstName" label="First Name" :rules="requiredRule" v-on:update:modelValue="resetError"/>
      <v-text-field v-model="username"  label="Username"   :rules="requiredRule" v-on:update:modelValue="resetError"/>
      <v-text-field type="password" 
                    v-model="password"  label="Password"   :rules="requiredRule" v-on:update:modelValue="resetError"/>
   </v-form>
   <v-btn @click="register()" :disabled="!dataValid || inviteError">Register</v-btn>
   <div class="error pt-4">{{ displayError }}</div>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useRoute, useRouter } from 'vue-router'
   import { createUserWithEmailAndPassword } from "firebase/auth"
   import { auth }           from '@/firebase' 
   import { useUserStore }   from '@/stores/userStore'
   import { useActionStore } from '@/stores/actionStore'
   // import { useGroupStore }  from '@/stores/groupStore'
   import { useInviteStore } from '@/stores/inviteStore'
   import { useWallStore }   from '@/stores/wallStore'
   import { useViewMgr }     from '@/stores/viewMgr'   
   import { emailRule, requiredRule } from '@/utils/utils'
   import { ActionType, Route, WallType } from '@/utils/constants'
   
   const route = useRoute()
   const router = useRouter()
   const userStore   = useUserStore()
   const actionStore = useActionStore()
   // const groupStore  = useGroupStore()
   const inviteStore = useInviteStore()
   const wallStore   = useWallStore()
   const viewMgr     = useViewMgr()
   const email     = ref("")
   const firstName = ref("")
   const username  = ref("")
   const password  = ref("")
   const dataValid = ref(true)
   const errMsg    = ref("")

   onMounted(() => {
      viewMgr.init() 
   })

   const registerIdToActiveInvite = computed(() => {
      const regIdToInvite = new Map()
      for (const invite of inviteStore.allActiveInvites) { 
         if (invite.registerId) { regIdToInvite.set(invite.registerId, invite) }
      }
      return regIdToInvite
   })

   const registeredInvite = computed(() => {
      console.log("registeredInvite - registerIdToActiveInvite", registerIdToActiveInvite.value)
      console.log("registeredInvite - registerId", route.params.registerId)
      const invite = registerIdToActiveInvite.value && route.params.registerId ? 
         registerIdToActiveInvite.value.get(route.params.registerId) : null
      
      console.log("registeredInvite", invite)
      if (invite?.toEmail) { email.value = invite.toEmail }
      return invite
   })

   const inviteError = computed(() => { 
      // check registerIdToActiveInvite populated to prevent flashing of inviteError
      return !registeredInvite.value && registerIdToActiveInvite?.value.size ? "Cannot find invitation" : null
   })

   // TODO - check username conflicts.  Not required here because email is login, but clears up confusion

   const displayError = computed(() => inviteError.value ? inviteError.value : errMsg.value)
   const resetError = () => { errMsg.value = "" }

   const register = () => {
      console.log("register/email", email.value)
      console.log("register/registeredInvite", registeredInvite.value)
      
      createUserWithEmailAndPassword(auth, email.value, password.value)
         .then((userCredential) => {
            console.log("register/setUser")
            userStore.setUser({
               id: userCredential.user.uid,
               username: username.value,
               firstName: firstName.value,
               email: email.value,
            })

            // TODO - incorporate this into userMgr
            wallStore.addWall(userStore.userId, WallType.USER)

            // join group if one specified
            console.log("register checking invite group", registeredInvite.value)
            if (registeredInvite.value.groupId) { 
               console.log("register/addUserIds/groupId", registeredInvite.value.groupId)
               console.log("register/addUserIds/userId", userStore.userId)

               // accept group invite via action because do not have permission to update
               // groupStore.addUserIds(registeredInvite.value.groupId, [userStore.userId]) 
               actionStore.addAction( {
                 actionType: ActionType.ACCEPT_GROUP_INVITE, 
                 groupId: registeredInvite.value.groupId, 
                 userId: userStore.userId
               })
            }

            // accept invite via action because do not have permission to update
            console.log("Accepting invite")
            const action = { actionType: ActionType.ACCEPT_INVITE, inviteId: registeredInvite.value.id, userId: userStore.userId }
            if (registeredInvite.value.toGroupName) { action.groupAcceptance = { email: email.value, firstName: firstName.value }}
            actionStore.addAction(action)

            console.log("Forwarding to Home")
            router.push(Route.HOME.url)
         })
         .catch((error) => {
            if      (error.code == "auth/invalid-email")  { errMsg.value = "Email invalid" }
            else if (error.code == "auth/user-not-found") { errMsg.value = "User not found" }
            else if (error.code == "auth/wrong-password") { errMsg.value = "Password incorrect" }
            else { 
               console.log("unknown error", error)
               errMsg.value = "Email/password incorrect" 
            }
         })
   }
</script>

<style>
   .error {
      color: red;
      font-size: 20px;
   }
</style>
