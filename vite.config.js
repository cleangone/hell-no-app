import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import Components from 'unplugin-vue-components/vite'
import { IonicResolver } from 'unplugin-vue-components/resolvers' 

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      vue(),
      Components({
         resolvers: [
             IonicResolver()
         ]
      }),
      VitePWA({
         injectRegister: null, // Prevents generating registerSW.js
         selfDestroying: true,  // Automatically unregisters any legacy SW cached in WebView
       
         registerType: 'autoUpdate',
         devOptions: { enabled: true },
         // injectRegister: 'auto',
         // includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
         includeAssets: ['**/*'],
         manifest: {
            name: 'Hell-No Gallery',
            short_name: 'Hell-No',
            description: 'Hell-No Gallery',
            display: "standalone",
            theme_color: '#ffffff',
            icons: [
               {
                  src: 'icons/192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
               },
               {
                  src: 'icons/512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any maskable'
               }
            ]
         },
      })
   ],
   resolve: {
      alias: {
         '@': fileURLToPath(new URL('./src', import.meta.url))
      }
   },
   build: {
    sourcemap: true // Can also be set to 'inline' or 'hidden'
  }
})
