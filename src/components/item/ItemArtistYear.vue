<template>
   <div v-if="primaryArtist || year">
      <span v-if="primaryArtist" @click.stop="toArtist(primaryArtist)" class="admin-link">{{ artistName(primaryArtist) }}</span>
      <span v-if="primaryArtist && year"> &bull; </span>
      <span v-if="year">{{ year }}</span>
   </div>
   <div v-if="otherArtist">
      <span @click.stop="toArtist(otherArtist)" class="admin-link">{{ artistName(otherArtist) }}</span>
      <template v-if="otherArtists.length>1">...</template> <!-- template does not add white space -->
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { useIonRouter } from '@ionic/vue'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({
      item: Object,
      showArtist: { type: Boolean, default: true },
      showYear:   { type: Boolean, default: true },
      isSmThumb:  { type: Boolean },
   })

   const ionRouter = useIonRouter()

   const primaryArtist = computed(() => props.showArtist && props.item.primaryArtist ? props.item.primaryArtist : null)
   const year          = computed(() => props.showYear   && props.item.yearCreated   ? props.item.yearCreated : null)
   const otherArtist   = computed(() => otherArtists.value.length ? otherArtists.value[0] : null)
   const otherArtists  = computed(() => 
      props.showArtist && !props.isSmThumb && props.item.otherArtists ? props.item.otherArtists : [])
   
   const artistName = (artist) => { return props.isSmThumb && artist.shortName ? artist.shortName : artist.fullName }
   const toArtist   = (artist) => { ionRouter.push(Route.ARTIST.url + artist.id) }
</script>

