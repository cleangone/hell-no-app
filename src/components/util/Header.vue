<template>
   <div class="header-container">
      <div class="header-toolbar">
         <div class="header-left">
            <slot name="left"></slot>
         </div>
         <div class="text-center text-h6 header-title">
            <slot name="title">{{ title }}</slot>
         </div>
         <div class="header-right">
            <slot name="right"></slot>
         </div>
      </div>
   </div>
</template>

<script setup>
   const props = defineProps({ title: String })
</script>

<style scoped>
.header-container {
  display: block;
  width: 100%;
  position: relative;
  z-index: 10;
  background-color: var(--v-theme-surface, #ffffff);
  padding-top: env(safe-area-inset-top, 0px);
}
.header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 6px 12px;
  box-sizing: border-box;
}
.header-left, .header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}
.header-toolbar .header-title {
  flex: 1 1 auto;
  min-width: 0 !important;
  white-space: normal !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
  overflow: visible !important;
  text-align: center;
  line-height: 1.25;
  padding: 0 12px;
  margin: 0;
}
</style>