<template>
  <div class="view">
    <div class="vars-list">
      <div class="header">
        <p class="title">可用变量</p>
      </div>
      <div class="content">
        <div class="var-item" v-for="variable in vars" :key="variable.label">
          <div class="name">{{ variable.label }}</div>
        </div>
      </div>
      <div class="footer">
        <el-button style="width: 100%" type="primary" @click="handleReBuildVars"
          >重新配置变量</el-button
        >
      </div>
    </div>
    <div class="editor-panel">
      <div class="header">
        <el-form :model="form" label-position="left" label-width="90px">
          <el-form-item label="标题">
            <el-input
              v-model="form.title"
              placeholder="在此输入标题，可使用``引用变量"
            ></el-input>
          </el-form-item>
          <el-form-item label="收件人">
            <el-select
              placeholder="选择收件人变量"
              clearable
              filterable
              v-model="form.to"
              style="width: 100%"
            >
              <el-option
                v-for="variable in vars"
                :key="variable.label"
                :value="variable.label"
                :label="variable.label"
              >
                {{ variable.label }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="抄送">
            <el-select
              placeholder="选择抄送人变量"
              clearable
              filterable
              v-model="form.cc"
              style="width: 100%"
            >
              <el-option
                v-for="variable in vars"
                :key="variable.label"
                :value="variable.label"
                :label="variable.label"
              >
                {{ variable.label }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="引用附件">
            <el-select
              placeholder="请选择要引用的变量"
              clearable
              v-model="form.filePath"
              style="width: 100%"
            >
              <el-option
                v-for="variable in vars"
                :key="variable.label"
                :value="variable.label"
                :label="variable.label"
              >
                {{ variable.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <editor class="content" v-model="form.html"></editor>
      <div class="footer">
        <el-button type="success" @click="toPreview">预览</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Editor from "@/components/MailEditor.vue";
import { ref, reactive, onMounted, onActivated } from "vue";
import { ipcRenderer } from "electron";
import router from "../router/index.js";

const form = reactive({
  title: "",
  to: "",
  cc: "",
  filePath: "",
  html: "",
});

const vars = ref([]);

function getVars() {
  ipcRenderer.invoke("getVars").then((data) => {
    vars.value = data;
  });
}

onActivated(() => {
  getVars()
})

onMounted(() => {
  getVars()
})

const toPreview = () => {
  ipcRenderer.invoke("generateMail", JSON.stringify(form)).then((list) => {
    router.push("/preview");
  });
};

function handleReBuildVars() {
  router.push("/definedata");
}
</script>

<script>
export default {
  name: "MailEditor",
};
</script>

<style lang="scss" scoped>
.view {
  display: flex;
  padding: 8px;
  .vars-list {
    width: 140px;
    padding-right: 8px;
    border-right: 1px dashed #ccc;
    margin-right: 8px;
    display: flex;
    flex-direction: column;
    .content {
      flex: 1;
      height: 0;
    }
    .header {
      margin-bottom: 4px;
      background-color: var(--main-color);
      color: #fff;
      padding: 4px 0;
      .title {
        text-align: center;
      }
    }
    .var-item {
      padding: 4px;
      background-color: #efefef;
      margin: 3px 0;
    }
  }
  .editor-panel {
    flex: 1;
    width: 0;
    display: flex;
    flex-direction: column;
    .content {
      flex: 1;
      margin-bottom: 4px;
    }
    .footer {
      text-align: right;
    }
  }
}
</style>
