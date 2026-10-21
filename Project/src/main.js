import { createApp } from 'vue'
import App from './App.vue'
import router from './routers'
import store from './store'
import './assets/main.css'

createApp(App).use(router).use(store).mount('#app')
