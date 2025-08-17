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
              <div class="name" :title="item.smtp_user">{{ item.smtp_user }}</div>
              <div class="smtp" :title="item.smtp_url">
                {{ item.smtp_url }}:{{ item.smtp_port }}
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
        <!-- 模式切换按钮 -->
        <div class="mode-switcher">
          <el-radio-group v-model="loginMode" @change="switchMode">
            <el-radio-button label="normal">普通模式</el-radio-button>
            <el-radio-button label="advanced">高级模式</el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 普通模式表单 -->
        <div v-if="loginMode === 'normal'">
          <el-form-item label="邮箱地址">
            <el-input v-model="form.email" placeholder="请输入您的邮箱地址" @input="onEmailInput"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" :type="passStatus" placeholder="请输入密码">
              <template #suffix>
                <i
                  class="view-pass iconfont"
                  :class="passStatus === 'password' ? 'icon-eye1' : 'icon-eye'"
                  @click="handleViewPass"
                ></i>
              </template>
            </el-input>
          </el-form-item>
        </div>
        
        <!-- 高级模式表单 -->
        <div v-else>
          <el-form-item label="SMTP服务器地址">
            <el-input v-model="form.host"></el-input>
          </el-form-item>
          <el-form-item label="SMTP服务器端口">
            <el-input v-model="form.port"></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" :type="passStatus" placeholder="请输入密码">
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
          <el-divider content-position="left">IMAP配置</el-divider>
          <el-form-item label="IMAP服务器地址">
            <el-input v-model="form.imapHost"></el-input>
          </el-form-item>
          <el-form-item label="IMAP服务器端口">
            <el-input v-model="form.imapPort"></el-input>
          </el-form-item>
          <el-form-item label="IMAP用户名">
            <el-input v-model="form.imapUser"></el-input>
          </el-form-item>
          <el-form-item label="IMAP密码">
            <el-input v-model="form.imapPassword" :type="imapPassStatus" placeholder="请输入IMAP密码">
              <template #suffix>
                <i
                  class="view-pass iconfont"
                  :class="imapPassStatus === 'password' ? 'icon-eye1' : 'icon-eye'"
                  @click="handleViewImapPass"
                ></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label-width="0">
            <el-checkbox v-model="form.imapSecure">启用IMAP安全连接</el-checkbox>
          </el-form-item>
        </div>
        
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

<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import router from "@/router/index";

const ipcRenderer = window.ipcRenderer
const form = reactive({ 
  email: "",
  host: "", 
  port: "", 
  username: "", 
  password: "", 
  useSecure: false,
  imapHost: "",
  imapPort: "",
  imapUser: "",
  imapPassword: "",
  imapSecure: false
});
const histories = ref<any[]>([]);
const passStatus = ref("password");
const imapPassStatus = ref("password");
const isLogin = ref(false);
const isQuickLogin = ref(false)
const loginMode = ref<'normal' | 'advanced'>('normal'); // 默认普通模式
const matchedConfig = ref<any>(null); // 匹配到的配置
const commonConfigs = ref([
  {
    name: "QQ邮箱",
    smtp: {
      host: "smtp.qq.com",
      port: "465",
      useSecure: true
    },
    imap: {
      host: "imap.qq.com",
      port: "993",
      useSecure: true
    },
    domain: "qq.com"
  },
  {
    name: "163邮箱",
    smtp: {
      host: "smtp.163.com",
      port: "465",
      useSecure: true
    },
    imap: {
      host: "imap.163.com",
      port: "993",
      useSecure: true
    },
    domain: "163.com"
  },
  {
    name: "126邮箱",
    smtp: {
      host: "smtp.126.com",
      port: "465",
      useSecure: true
    },
    imap: {
      host: "imap.126.com",
      port: "993",
      useSecure: true
    },
    domain: "126.com"
  },
  {
    name: "Gmail邮箱",
    smtp: {
      host: "smtp.gmail.com",
      port: "465",
      useSecure: true
    },
    imap: {
      host: "imap.gmail.com",
      port: "993",
      useSecure: true
    },
    domain: "gmail.com"
  },
  {
    name: "Outlook邮箱",
    smtp: {
      host: "smtp-mail.outlook.com",
      port: "587",
      useSecure: false
    },
    imap: {
      host: "outlook.office365.com",
      port: "993",
      useSecure: true
    },
    domain: "outlook.com"
  }
]);

function handleViewPass() {
  if (passStatus.value === "password") {
    passStatus.value = "text";
  } else {
    passStatus.value = "password";
  }
}

function handleViewImapPass() {
  if (imapPassStatus.value === "password") {
    imapPassStatus.value = "text";
  } else {
    imapPassStatus.value = "password";
  }
}

function onEmailInput() {
  // 当邮箱地址改变时，尝试匹配常用邮箱配置
  if (form.email) {
    const emailRegex = /^([^@]+)@(.+)$/;
    const match = form.email.match(emailRegex);
    if (match && match[2]) {
      const domain = match[2].toLowerCase();
      const config = commonConfigs.value.find(c => c.domain === domain);
      matchedConfig.value = config || null;
    } else {
      matchedConfig.value = null;
    }
  } else {
    matchedConfig.value = null;
  }
}

function switchMode(mode: 'normal' | 'advanced') {
  loginMode.value = mode;
  // 如果切换到高级模式，且之前有匹配的配置，自动填充
  if (mode === 'advanced' && matchedConfig.value) {
    applyCommonConfig(matchedConfig.value);
  }
  // 如果从普通模式切换到高级模式，且已有密码，也自动填入IMAP密码
  if (mode === 'advanced' && form.password) {
    form.imapPassword = form.password;
  }
}

function applyCommonConfig(config: any) {
  // 设置SMTP配置
  form.host = config.smtp.host;
  form.port = config.smtp.port;
  form.useSecure = config.smtp.useSecure;
  
  // 设置IMAP配置
  form.imapHost = config.imap.host;
  form.imapPort = config.imap.port;
  form.imapSecure = config.imap.useSecure;
  
  // 提取用户名（从邮箱地址中提取）
  if (form.email) {
    const emailRegex = /^([^@]+)@(.+)$/;
    const match = form.email.match(emailRegex);
    if (match) {
      form.username = match[1]; // 用户名是邮箱地址的用户名部分
      form.imapUser = match[1]; // IMAP用户名也一样
    }
  }
  
  // 如果用户已经输入了密码，自动填入IMAP密码字段
  if (form.password) {
    form.imapPassword = form.password;
  }
}

onMounted(async () => {
  const list = await ipcRenderer.invoke("getLogin");
  histories.value = list;
});

async function toLogin() {
  try {
    isLogin.value = true;
    
    // 如果是普通模式，检查是否需要跳转到高级模式
    if (loginMode.value === 'normal') {
      // 检查是否已匹配到配置
      if (!matchedConfig.value && !form.host) {
        ElMessage.warning("请先选择常用邮箱或切换到高级模式手动配置SMTP/IMAP信息");
        isLogin.value = false;
        return;
      }
      // 如果没有配置但有邮箱地址，自动填充用户名
      if (form.email && !form.username) {
        const emailRegex = /^([^@]+)@(.+)$/;
        const match = form.email.match(emailRegex);
        if (match) {
          form.username = match[1];
          form.imapUser = match[1];
        }
      }
    }
    
    const loginData = {
      host: form.host,
      port: form.port,
      username: form.username,
      password: form.password,
      useSecure: form.useSecure,
      imapHost: form.imapHost,
      imapPort: form.imapPort,
      imapUser: form.imapUser,
      imapPassword: form.imapPassword,
      imapSecure: form.imapSecure
    }
    const login = await ipcRenderer.invoke("verifyConnection", loginData);

    // If not quick login, add login history to database.
    if(!isQuickLogin.value) {
      await ipcRenderer.invoke('addLogin', loginData)
    }

    const { type, message } = login;
    if (type === "success") {
      isLogin.value = false;
      console.log("登录成功，准备跳转到 /layout/home");
      // 延迟执行路由跳转，确保UI更新
      setTimeout(() => {
        try {
          console.log("执行路由跳转");
          router.push("/layout/home");
          console.log("路由跳转完成");
        } catch (error) {
          console.error("路由跳转失败:", error);
          ElMessage.error("登录成功但页面跳转失败");
        }
      }, 100);
    } else {
      isLogin.value = false;
      ElMessage({ type, message });
    }
  } catch (err) {
    isLogin.value = false;
    ElMessage.error({ message: "未知异常" });
    console.error("登录异常:", err);
  }
}

function handleConfig(config: any) {
  form.host = config.smtp_url;
  form.port = config.smtp_port;
  form.username = config.smtp_user;
  form.password = config.smtp_password;
  form.useSecure = config.smtp_secure === 1;
  form.imapHost = config.iamp_url;
  form.imapPort = config.iamp_port;
  form.imapUser = config.iamp_user;
  form.imapPassword = config.iamp_password;
  form.imapSecure = config.iamp_secure === 1;
}

function handleLogin(config: any) {
  isQuickLogin.value = true
  handleConfig(config);
  toLogin();
}

function handleDelete(config: any, index: number) {
  ipcRenderer.invoke('removeLogin', config.id).then(() => {
    histories.value.splice(index, 1);
  })
}
</script>

<script lang="ts">
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
