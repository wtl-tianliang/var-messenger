<template>
  <div class="home">
    <el-form :model="form" class="form" label-width="100" label-position="left">
      <el-form-item label="服务器地址">
        <el-input v-model="form.host"></el-input>
      </el-form-item>
      <el-form-item label="服务器端口">
        <el-input v-model="form.port"></el-input>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" type="password"></el-input>
      </el-form-item>
      <el-button type="primary" style="width: 100%" @click="toLogin"
        >登录</el-button
      >
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { ipcRenderer } from "electron";
import { ElMessage } from "element-plus";
import router from '@/router/index'

const form = reactive({
  host: "",
  port: 465,
  username: "",
  password: "",
});

const toLogin = () => {
  ipcRenderer
    .invoke("verifyConnection", {
      host: form.host,
      port: form.port,
      username: form.username,
      password: form.password,
    })
    .then(({ type, message }) => {
      if (type === "success") {
        router.push('/definedata')
      } else {
        ElMessage({ type, message });
      }
    })
    .catch((err) => {
      ElMessage.error({
        message: "未知异常",
      });
    });
};
</script>

<script>
export default {
  name: "ViewHome",
};
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
}
.form {
  width: 400px;
  margin: 20px auto 0 auto;
}
</style>
