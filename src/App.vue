<template>
  <div class="header">
    <img src="@/assets/icon.png" class="logo" alt="logo" />
    <span class="login">{{ currentLogin || "Var Messenger" }}</span>
    <span v-if="currentLogin" class="quick-btn" @click="logout">注销</span>
    <span class="quick-btn" @click="toAbout">关于</span>
  </div>
  <router-view v-slot="{ Component }">
    <component :is="Component"></component>
  </router-view>
</template>

<script setup>
import { ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { ipcRenderer } from "electron";
import { ElMessage, ElMessageBox } from "element-plus";


const currentLogin = ref("");
ipcRenderer.on("loginSuccess", (event, data) => {
  currentLogin.value = data;
});

ipcRenderer.on("error:VarNotFound", (event, data) => {
  ElMessage.error({ message: `变量 ${data} 未定义` });
});

const handles = {
  "update-downloaded": () => {
    ElMessageBox.confirm("新版本下载完成，是否立即安装？", "版本更新", {
      confirmButtonText: "立即安装",
      cancelButtonText: "稍后再说"
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
  const { type, message } = data;
  const handler = handles[type];
  if (handler) {
    handler(message);
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
  --main-color: var(--el-color-primary);
  --global-margin: 15px;
}
</style>
