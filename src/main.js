import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createApp } from 'vue'

import '@/style/element-plus/index.scss'
import ElementPlus from 'element-plus'

import './assets/iconfont/iconfont.js'
import './assets/iconfont/iconfont.css'

import App from './App.vue'
import router from './router/index'

import { ipcRenderer } from 'electron'
import { Boot } from "@wangeditor/editor";
import VariablePlugin from 'wangeditor-plugin-var'
import 'wangeditor-plugin-var/dist/style.css'

Boot.registerModule(VariablePlugin({
  getData() {
    return new Promise((resolve) => {
      ipcRenderer.invoke("getVars").then((data) => {
        resolve(data.map(item => item.label))
      });
    })
  }
}))


const app = createApp(App)

app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)

app.mount('#app')