<template>
  <div class="editor-view">
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
          <el-form-item label="附件">
            <file-picker v-model="form.filePath">
              <!-- Hidden experimental function -->
              <!-- <template #append>
                <el-checkbox v-model="form.contentAsDocx">
                  <el-tooltip
                    content="该功能为实验性功能，可能存在问题，请谨慎使用"
                  >
                    <span class="content-to-docx"
                      >将邮件正文作为 .docx 附件</span
                    >
                  </el-tooltip>
                </el-checkbox>
              </template> -->
            </file-picker>
          </el-form-item>
        </el-form>
      </div>
      <editor class="content" v-model="form.html"></editor>
    </div>

    <Teleport to="#step-external">
      <div class="operate-bar">
        <el-button round type="primary" @click="toPreview">下一步</el-button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import Editor from "@/components/MailEditor.vue";
import { ref, reactive, onMounted, watch } from "vue";
import { ipcRenderer } from "electron";
import { useRouter } from "vue-router";
import FilePicker from "./components/FilePicker.vue";
import { ElMessage } from "element-plus";

const router = useRouter();

const form = reactive({
  title: "",
  to: "",
  cc: "",
  filePath: [],
  html: "",
  contentAsDocx: false,
});

watch(form, (data) => {
  ipcRenderer.invoke("setForm", JSON.stringify(data));
});

const vars = ref([]);

function getData() {
  ipcRenderer.invoke("getVars").then((data) => {
    vars.value = data.map((item) => ({ ...item, label: `\`${item.label}\`` }));
  });
  ipcRenderer.invoke("getForm").then((data) => {
    Object.assign(form, data);
  });
}

onMounted(() => {
  getData();
});

const toPreview = () => {
  if (!form.to) {
    ElMessage.error({ message: "请填写收件人" });
    return;
  }
  ipcRenderer.invoke("generateMail", JSON.stringify(form)).then((list) => {
    router.push("/steps/preview");
  });
};
</script>

<script>
export default {
  name: "MailEditorPage",
};
</script>

<style lang="scss" scoped>
.editor-view {
  display: flex;
  .editor-panel {
    flex: 1;
    width: 0;
    display: flex;
    flex-direction: column;
    .content {
      flex: 1;
      height: 0;
      margin-bottom: 4px;
    }
  }
}

.operate-bar {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
}

.content-to-docx {
  font-size: 12px;
}
</style>
