<template>
   <v-card class="mt-2 mx-0">
      <v-tabs v-if="viewMgr.isMobile" v-model="tab" bg-color="primary">
         <v-tab :value="tabs.account">Account</v-tab>
         <v-btn @click="logout()" size="small" 
            class="text-blue align-self-center ml-auto mr-3" style="float:right">Logout</v-btn>
      </v-tabs>

      <v-card-text>
         <v-window v-model="tab">
            <v-window-item :value="tabs.items">     <AccountItems/>     </v-window-item>
            <v-window-item :value="tabs.galleries"> <AccountGalleries/> </v-window-item>
            <v-window-item :value="tabs.groups">    <AccountGroups/>    </v-window-item>
            <v-window-item :value="tabs.account">   <Account/>          </v-window-item>
         </v-window>
      </v-card-text>
  </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useViewMgr }   from '@/stores/viewMgr'
   import Account          from '@/components/account/Account.vue'
   import AccountGalleries from '@/components/account/AccountGalleries.vue'
   import AccountGroups    from '@/components/account/AccountGroups.vue'
   import AccountItems     from '@/components/account/AccountItems.vue'
   
   const viewMgr   = useViewMgr()
   const wasMobile = ref()
   const tabs = { 
       account: "account", galleries: "galleries",  groups: "groups", items: "items"
   }
   const tab = ref(tabs.item)
   const lastLargeScreenTab = ref(null)
   
   useSeoMeta({ title: "Hell-No My Account" })
   onMounted(() => {
      wasMobile.value = viewMgr.isMobile
      window.addEventListener('resize', onWWindowResize)
   })

   const onWWindowResize = () => { 
      if (viewMgr.isDeskTop) { 
         if (wasMobile.value) {
            if (lastLargeScreenTab.value) { tab.value = lastLargeScreenTab.value }
         }
         else { lastLargeScreenTab.value = tab.value }
      }
      
      wasMobile.value = viewMgr.isMobile
   }

   const logout = () => { viewMgr.logout() }
</script>

<style>
</style>
