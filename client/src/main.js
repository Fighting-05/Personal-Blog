import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'aos/dist/aos.css'
import AOS from 'aos'
import './assets/style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

AOS.init({ once: true, duration: 700, offset: 80, easing: 'ease-out-cubic' })