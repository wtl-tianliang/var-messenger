<template>
  <router-view v-slot="{ Component }">
    <component :is="Component"></component>
  </router-view>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

const ipcRenderer = window.ipcRenderer
const currentLogin = ref("");
ipcRenderer.on("loginSuccess", (event, data) => {
  currentLogin.value = data;
});

ipcRenderer.on("error:VarNotFound", (event, data) => {
  ElMessage.error({ message: `变量 ${data} 未定义` });
});

const handles: { "update-downloaded": () => void;[key: string]: () => void } =
{
  "update-downloaded": () => {
    ElMessageBox.confirm("新版本下载完成，是否立即安装？", "版本更新", {
      confirmButtonText: "立即安装",
      cancelButtonText: "稍后再说",
    })
      .then(() => {
        ipcRenderer.invoke("update-install");
      })
      .catch(() => {
        console.log("取消更新");
      });
  },
};

ipcRenderer.on("UPDATE_MESSAGE", (event, data) => {
  const { type } = data;
  const handler = handles[type];
  if (handler) {
    handler();
  }
});

const router = useRouter();

function logout() {
  ipcRenderer.invoke("logout").then(() => {
    currentLogin.value = "";
    router.push("/");
  });
}

function toAbout() {
  router.push("/about");
}
function openLog() {
  ipcRenderer.invoke("openLogdir");
}

function openSetting() {
  router.push("/setting");
}
</script>

<style lang="scss" scoped>
.header {
  height: 40px;
  padding: 0 10px;
  border-bottom: 1px solid #ccc;
  -webkit-app-region: drag;
  font-size: 12px;
  display: flex;
  align-items: center;
  background-color: #e8eaed;
  .logo {
    display: block;
    width: 16px;
    height: 16px;
    margin-right: 15px;
  }
  .login {
    margin-right: 10px;
  }
  .quick-btn {
    color: var(--main-color);
    cursor: pointer;
    -webkit-app-region: none;
    margin: 0 4px;
  }
}
</style>

<style lang="scss">
* {
  outline: none;
}
ul {
  padding-inline-start: 20px;
}
:root {
  --main-color: #d33332;
  --el-color-primary: var(--main-color);
  --global-margin: 15px;
}
.el-button--primary {
  --el-button-hover-bg-color: #e94444;
  --el-button-active-bg-color: #e94444;
  --el-button-hover-border-color: #e94444;
  --el-button-active-border-color: #e94444;
}
</style>
