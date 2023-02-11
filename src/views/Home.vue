<template>
  <div class="home">
    <div class="container">
      <div class="history-login">
        <div class="header">
          <div class="title">登录历史</div>
        </div>
        <template v-for="(item, index) in histories" :key="item.id">
          <div class="login-item">
            <img class="logo" src="../assets/icon.png" alt="logo" />
            <div class="info">
              <div class="name" :title="item.username">{{ item.username }}</div>
              <div class="smtp" :title="item.smtp">
                {{ item.smtp }}:{{ item.smtp_port }}
              </div>
            </div>
            <div class="operate">
              <span
                title="快速登录"
                class="iconfont icon-login"
                @click="handleLogin(item)"
              ></span>
              <span
                title="删除"
                class="iconfont icon-delete"
                @click="handleDelete(item, index)"
              ></span>
            </div>
          </div>
        </template>
        <div class="empty" v-if="histories.length < 1">
          <img src="@/assets/empty.png" alt="empty placeholder" />
          <div class="txt">暂无数据</div>
        </div>
      </div>

      <el-form
        :model="form"
        class="form"
        label-width="100"
        label-position="left"
      >
        <h2>登录邮箱</h2>
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
          <el-input v-model="form.password" :type="passStatus">
            <template #suffix>
              <i
                class="view-pass iconfont"
                :class="passStatus === 'password' ? 'icon-eye1' : 'icon-eye'"
                @click="handleViewPass"
              ></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label-width="0">
          <el-checkbox v-model="form.useSecure">启用安全连接</el-checkbox>
        </el-form-item>
        <el-button
          round
          type="primary"
          style="width: 100%"
          @click="toLogin"
          :loading="isLogin"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { ipcRenderer } from "electron";
import { ElMessage } from "element-plus";
import router from "@/router/index";

const form = reactive({ host: "", port: "", username: "", password: "" });
const histories = ref([]);
const passStatus = ref("password");
const isLogin = ref(false);
const isQuickLogin = ref(false)

function handleViewPass() {
  if (passStatus.value === "password") {
    passStatus.value = "text";
  } else {
    passStatus.value = "password";
  }
}

onMounted(async () => {
  const list = await ipcRenderer.invoke("getLogin");
  histories.value = list;
});

async function toLogin() {
  try {
    isLogin.value = true;
    const loginData = {
      host: form.host,
      port: form.port,
      username: form.username,
      password: form.password,
      useSecure: form.useSecure,
    }
    const login = await ipcRenderer.invoke("verifyConnection", loginData);

    // If not quick login, add login history to database.
    if(!isQuickLogin.value) {
      await ipcRenderer.invoke('addLogin', loginData)
    }

    const { type, message } = login;
    if (type === "success") {
      isLogin.value = false;
      router.push("/steps/definedata");
    } else {
      isLogin.value = false;
      ElMessage({ type, message });
    }
  } catch (err) {
    isLogin.value = false;
    ElMessage.error({ message: "未知异常" });
  }
}

function handleConfig(config) {
  form.host = config.smtp;
  form.port = config.smtp_port;
  form.username = config.username;
  form.password = config.password;
  form.useSecure = config.use_secure === 1;
}

function handleLogin(config) {
  isQuickLogin.value = true
  handleConfig(config);
  toLogin();
}

function handleDelete(config, index) {
  ipcRenderer.invoke('removeLogin', config.id).then(() => {
    this.histories.splice(index, 1);
  })
}
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
  flex: 1;
  height: calc(100% - 41px);
}
.container {
  display: flex;
  height: 100%;
  .history-login {
    width: 300px;
    overflow: auto;
    border-right: 1px solid #dfdfdf;
    position: relative;
    .header {
      .title {
        font-weight: bold;
        font-size: 14px;
        padding: 8px 0 0 8px;
      }
    }

    .empty {
      position: absolute;
      left: 50%;
      top: 40%;
      transform: translate(-50%, -50%);
      img {
        width: 120px;
      }
      .txt {
        color: #ccc;
        font-size: 12px;
        text-align: center;
      }
    }
  }
  .login-item {
    display: flex;
    border: 1px dashed #cecece;
    padding: 8px;
    margin: 8px;
    align-items: center;
    .logo {
      width: 40px;
      height: 40px;
      margin-right: 8px;
    }
    .info {
      flex: 1;
      width: 0;
      padding-right: 8px;
      .name {
        width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        margin-bottom: 6px;
      }
      .smtp {
        font-size: 12px;
        color: #aaa;
        width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .operate {
      font-size: 20px;
      display: flex;
      flex-direction: column;
      border-left: 1px dotted #ccc;
      padding-left: 6px;
      .iconfont {
        cursor: pointer;
      }
      .iconfont:not(:last-child) {
        margin-bottom: 8px;
      }
    }
  }

  .form {
    width: 400px;
    margin: 100px auto 0 auto;
    h2 {
      text-align: center;
      margin-bottom: 20px;
    }
    .view-pass {
      cursor: pointer;
    }
  }
}
</style>
