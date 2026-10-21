import { createApp } from 'vue'
import App from './App.vue'
import router from './routers'
import store from './store'
import { applyTheme } from './composables/useTheme'
import './assets/main.css'

applyTheme()

createApp(App).use(router).use(store).mount('#app')
