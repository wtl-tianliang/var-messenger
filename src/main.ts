import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { createApp } from "vue";

import "@/style/element-plus/index.scss";
import ElementPlus from "element-plus";

import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";

import App from "./App.vue";
import router from "./router/index";

import { Boot } from "@wangeditor/editor";
import VariablePlugin from "wangeditor-plugin-var";
import "wangeditor-plugin-var/dist/style.css";

const ipcRenderer = window.ipcRenderer

Boot.registerModule(
  VariablePlugin({
    getData() {
      return new Promise((resolve) => {
        ipcRenderer.invoke("getVars").then((data) => {
          resolve(data.map((item: any) => item.label));
        });
      });
    },
  })
);

type KeyStatus = {
  Control: boolean;
  Shift: boolean;
  I: boolean;
  [key: string]: boolean;
};
const keyStatus: KeyStatus = {
  Control: false,
  Shift: false,
  I: false,
};

const KeyList = ["Control", "Shift", "I"];

document.addEventListener("keydown", (event) => {
  const { key } = event;
  if (KeyList.includes(key)) {
    keyStatus[key] = true;
    if (keyStatus.Control && keyStatus.Shift && keyStatus.I) {
      ipcRenderer.invoke("openDevtools");
    }
  }
});

document.addEventListener("keyup", (event) => {
  const { key } = event;
  if (KeyList.includes(key)) {
    keyStatus[key] = false;
  }
});

const app = createApp(App);

app.use(ElementPlus);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(router);

app.mount("#app");
