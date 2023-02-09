<template>
  <div class="header">
    <img src="@/assets/icon.png" class="logo" />
    <span class="login">{{ currentLogin }}</span>
    <span v-if="currentLogin" class="logout" @click="loginout">注销</span>
  </div>
  <router-view v-slot="{ Component }">
    <component :is="Component"></component>
  </router-view>
</template>

<script setup>
import { ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { ipcRenderer } from "electron";
import { ElMessage } from "element-plus";

const currentLogin = ref('')
ipcRenderer.on('loginSuccess', (event, data) => {
  currentLogin.value = data
})

ipcRenderer.on('error:VarNotFound', (event, data) => {
  ElMessage.error({ message: `变量 ${data} 未定义` })
})

const router = useRouter();
function loginout() {
  ipcRenderer.invoke('logout').then(() => {
    currentLogin.value = ''
    router.push('/')
  })
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
  .logout {
    color: var(--main-color);
    cursor: pointer;
    -webkit-app-region: none;
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
