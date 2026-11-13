<template>
<ion-page>
<ion-content ref="contentRef" :fullscreen="true">
   <Header>
      <template #left><BackButton class="mr-8"/></template>
      <template #title>{{ Route.ABOUT.display }}}</template>
      <template #right><span class="mr-8"></span></template>
   </Header>

   <div class="text-left mx-3">
      <div class="mt-4">
         <div class="text-h5">Why should I care about another site to view and manage art?</div>
         <div class="mt-1 ml-4">
            <div>The Hell-No Gallery is built around the concept of <b>flexible visibility.</b></div>
            <ul class="ml-3">
               <li><b>Who</b> can see a piece of art? In addition to the standard Public and Private visibility of 
                  items, a Group option is added.  This allows people to share art just within a specified group.
               </li>
               <li><b>Where</b> is a piece of art located? It can be put in multiple Galleries, or no Gallery at all. 
               </li>
               <li><b>How</b> can the app be viewed? This Hell-No app is complimented by the 
                  <a src="https://hell-no.gallery">hell-no.gallery</a> Progressive Web App.  A PWA acts like a 
                  website when viewed on a computer browser and similar to an app on when installed on a phone, but 
                  without the native features like a camera or notifications.
               </li>
            </ul>
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Items</div>
         <div class="mt-1 ml-4">
            <div>An item can hold either a single piece of art or collection of other items that are managed as group. 
            </div>
            <v-container>
               <v-row>
                  <v-col class="pb-3 pt-2 mr-2 text-center bg-shade">
                     <div class="pb-2"><b>Single Item</b></div>
                     <v-img :src="SINGLE_ITEM" :height="300"/>
                  </v-col>
                  <v-col cols="7" class="pb-3 pt-2 mr-2 text-center bg-shade">
                     <div class="pb-2"><b>Grouped Item</b></div>
                     <v-img :src="ITEM_GROUP" :height="300"/>
                  </v-col>
               </v-row>
            </v-container>

            <div class="text-h6 mt-2">Visibility</div> 
            <div>Visibility controls who can see an Item almost everywhere it qppears, incuding Galleries, Search Results and 
                  Recent Updates.  As discussed later, the Art Wall is an exception, and all items on a Wall are publicly visible.</div> 
            <ul class="ml-3">
               <li><b>Public</b>: the item can be seen by anyone</li>
               <li><b>Group</b>: the item can only be seen by people in one of its configured groups</li>
               <li><b>Private</b>: the item can only be seen by the owner</li>
               <li><b>Invisible</b>: a public item that is not in any gallery, and can not be seen by people other than the owner.  Owners
                  can view these items in their Invisible Items view, and can send links to others.  Anyone with the 
                  link will be able to view the item, as it is Public.
               </li>
               <li><b>Hidden</b>:  the item cannot be seen by anyone, including the owner. When multiple items, (ie. a run of pages) are 
                  grouped, the individual items are set to the Hidden visibiilty. They will still appear in the Item administration, and 
                  can be changed back to other states if desired.
               </li>
            </ul>
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Groups</div>
         <div class="mt-1 ml-4">
            <div>A user can be a member of a Group.  Group members may invite other users to be a member.
            </div>
            <div class="text-h6 mt-2">Visibility</div> 
            <ul class="ml-3">
               <li><b>Group</b>: the group can be seen by its owner and all members</li>
               <li><b>Private</b>: the group can only be seen by its owner</li>
               <li><b>Public <i>(Future)</i></b>: the group can be seen and discovered by anyone.  Non-members can request membership</li>
            </ul>
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Galleries</div>
         <div class="mt-1 ml-4">
            <div>
               Items can be put in multiple Galleries.  When viewing a Gallery, logged in users may see different 
               items depending on what groups they are a part of.  Viewers that are not logged in will only see the 
               gallery's pulic items.
            </div>
            <div class="text-h6 mt-2">Visibility</div> 
            <ul class="ml-3">
               <li><b>Public</b>: the gallery can be seen and discovered by anyone as long as it contains at
                  least one Item that is visible to the user.</li>
               <li><b>Private</b>: the gallery can only be seen by its owner</li>
            </ul>
            <div class="text-h6 mt-2">Navigation</div> 
            <ul class="ml-3">
               <li>When viewing on a computer browser, the left/right arrow keys can be used for navigation in 
                    addition to the links.</li>
               <li>On a mobile device, the user can navigate to the previous/next Item by swiping left or right.</li>
            </ul>
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">User Page</div>
         <div class="mt-1 ml-4">
            A user's page displays their individual Art Wall, Galleries, Recent Updated and Recent Viewed items 
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">My Account - Update user profile, Items, Galleries, etc</div>
         <div class="mt-1 ml-4">
            A logged in user can access their profile via the Account option in the top-right menu on the 
            user page.  An expanded Account page, featuring full create/update/delete of Items, Galleries, Groups, 
            Art Wall and Artists, can be accessed when logged in on the <a src="https://hell-no.gallery">hell-no.gallery</a> 
            website.
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Art Walls</div>
         <div class="mt-1 ml-4">
            The site and individual users each have an Art Wall.  Any item added to a user's wall is visible to all users and 
            non-logged-in browsers.
            <br><br>
            Once added to a user's Art Wall, an item is a candidate to be included in the Site Art Wall.
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Recent Updated/Viewed</div>
         <div class="mt-1 ml-4">
            Recent Updates shows the most recently updated public Items, and Recent Viewed shows the most
            recently viewed.  
         </div>
      </div>
   </div>
   <div class="center small">
      {{ viewMgr.version }} ({{ windowSize }})     
   </div> 
</ion-content>  
</ion-page>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useViewMgr } from '@/stores/viewMgr'
   import BackButton     from '@/components/util/BackButton.vue'
   import Header         from '@/components/util/Header.vue'
   import { Route } from '@/utils/constants'
   
   const BUCKET = "https://firebasestorage.googleapis.com/v0/b/gallery-a1fcb.appspot.com/o/"
   const BROWSER     = BUCKET + "about%2Fbrowser.png?alt=media&token=da73b445-2aca-4aab-b401-9778315e1496"
   const PHONE       = BUCKET + "about%2Fphone.png?alt=media&token=179bf82f-1e93-4424-8df4-5a2f728a5cba"
   const SINGLE_ITEM = BUCKET + "about%2Fsingle-item.png?alt=media&token=821697dc-9e88-4c68-a26d-ca493ea66607"
   const ITEM_GROUP  = BUCKET + "about%2Fitem-group.png?alt=media&token=eda029ed-176b-49ed-9c7c-130e8a3cdb80"

   const viewMgr = useViewMgr()
   const windowSize  = computed(() => window.innerWidth + " x " + window.innerHeight)
</script>

<style>
</style>
