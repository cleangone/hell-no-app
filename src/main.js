import { createApp } from 'vue'
import { setLogLevel } from "firebase/firestore"
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createHead } from '@unhead/vue'
import "@mdi/font/css/materialdesignicons.css"
import { Swiper, SwiperSlide } from 'swiper/vue'
import CKEditor from "@ckeditor/ckeditor5-vue"
import VueGtag from 'vue-gtag'
import { Route } from '@/utils/constants'
import { GoogleAnalyticsConfig } from '@/config/config'
import './assets/main.css'
import 'swiper/css'
import 'swiper/css/navigation'
// import 'swiper/css/pagination'

// setLogLevel("debug") 

const app = createApp(App)
const vuetify = createVuetify({ 
   components, 
   directives, 
   icons: { defaultSet: 'mdi', aliases, sets: { mdi } } 
})

app.use(createPinia())
app.use(router)
app.use(createHead())
app.use(vuetify)
app.use(CKEditor)
app.use(VueGtag, { config: { id: GoogleAnalyticsConfig.measurementID }}, router)
app.component('Swiper', Swiper)
app.component('SwiperSlide', SwiperSlide)

app.mount('#app')
   