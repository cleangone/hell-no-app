<template>
   <v-btn :icon="icon" variant="text" :disabled="disabled" :size="btnSize" :slim="slim" :density="density" class="icon-btn"/>
</template>

<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ icon:String, disabled:Boolean, 
      xs:Boolean, sm:Boolean,  slim: Boolean,
      size:    { type: String, default: 'unrecognized' }, // x-small, small, default, large, x-large, any number (pixels)
      density: { type: String, default: 'default' }  })   // default, comfortable, compact
   
   // having an unrecognized size causes vuetify to not apply a .v-btn--size-* class
   const btnSize = computed(() => props.xs ? "x-small" : (props.sm ? "small" : props.size))
</script>