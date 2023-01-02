import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createApp } from 'vue'

import '@/style/element-plus/index.scss'
import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router/index'


const app = createApp(App)

app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)

app.mount('#app')