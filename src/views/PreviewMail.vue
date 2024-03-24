<template>
  <div class="preview-wrapper">
    <div class="list-box">
      <div class="header">邮件列表</div>
      <template v-for="mail in list" :key="mail.id">
        <div class="mail-item" :class="[mail.status.toLowerCase(), { actived: previewHtml.key === mail.id }]"
          @click="viewContent(mail)">
          <div class="subject" :title="mail.subject">{{ mail.subject }}</div>
          <div class="to">{{ mail.to }}</div>
          <div class="cc" v-if="mail.cc">{{ mail.cc }}</div>
          <el-tooltip :disabled="!mail.message" effect="dark" :content="mail.message" placement="right-start">
            <span class="status">{{ MAIL_STATUS_MAP[mail.status] }}</span>
          </el-tooltip>
        </div>
      </template>
    </div>
    <div class="preview-box" :key="previewHtml.key">
      <div class="header">
        <div class="subject">{{ previewHtml.data.subject }}</div>
        <div class="field-item">
          <div class="label">收件人</div>
          <div class="value">{{ previewHtml.data.to }}</div>
        </div>
        <div class="field-item">
          <div class="label">抄送人</div>
          <div class="value">{{ previewHtml.data.cc || "无" }}</div>
        </div>
        <div class="field-item" v-if="previewHtml.data.attachments">
          <div class="label">附件</div>
          <div class="value">{{ previewHtml.data.attachments.length }}</div>
        </div>
      </div>
      <div class="html" v-html="previewHtml.data.html"></div>
    </div>
  </div>
  <Teleport to="#step-external">
    <div class="operate-bar">
      <el-button :disabled="blockOperate" round type="primary" @click="handleSendAll">全部发送</el-button>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue";
import PreviewDialog from "./components/PreviewDialog/index";
import MAIL_STATUS, { MAIL_STATUS_MAP } from "@/../MAIL_STATUS";

const ipcRenderer = window.ipcRenderer;
const list = ref<any[]>([]);
const hasContentDocx = ref(false);
const blockOperate = ref(false);
const previewHtml = reactive<{ key: number; data: any }>({
  key: Date.now(),
  data: {},
});

function getlist() {
  ipcRenderer.invoke("getLetters").then(({ letters, contentAsDocx }) => {
    list.value = letters.map((item: any) => ({ ...item, disabled: false }));
    hasContentDocx.value = contentAsDocx;
    viewContent(list.value[0]);
  });
}

function viewContent(row: any) {
  previewHtml.key = row.id;
  previewHtml.data = row;
}

function handleDelete(index: number) {
  list.value.splice(index, 1);
}

async function handleSendAll() {
  blockOperate.value = true;
  const ids = list.value.map((item: any) => item.id);
  await ipcRenderer.invoke("sendByIds", ids);
  blockOperate.value = false;
}

async function handleReSend(row: any) {
  const ids = [row.id];
  row.disabled = true;
  await ipcRenderer.invoke("sendByIds", ids);
  row.disabled = false;
}

ipcRenderer.on("sendComplate", (event, { id, status, message }) => {
  const letter = list.value.find((item: any) => item.id === id);
  if (!letter) {
    return;
  }
  letter.status =
    status === "success"
      ? MAIL_STATUS.MAIL_STATUS_SEND_SUCCESS
      : MAIL_STATUS.MAIL_STATUS_SEND_FAIL;
  letter.message = message;
});

onMounted(() => {
  getlist();
});
</script>

<style lang="scss" scoped>
.preview-wrapper {
  display: flex;
  height: calc(100% - 86px);
  .list-box {
    border-right: 1px solid #eee;
    width: 227px;
  }
}

.preview-box {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 0;
  .header {
    padding: 6px 10px;
    border-bottom: 1px solid #eee;
    background-color: #f5f5f5;
  }
  .subject {
    font-size: 16px;
    margin-bottom: 0.5em;
  }
  .field-item {
    margin-top: 6px;
    display: flex;
    font-size: 12px;
    .label {
      width: 80px;
      color: #727d95;
    }
  }
  .html {
    flex: 1;
    margin: 10px;
    overflow: auto;
  }
}

.list-box {
  height: 100%;
  overflow: auto;
  .header {
    position: sticky;
    top: 0;
    background-color: #FFF;
    border-bottom: 1px dotted #ccc;
    padding: 4px 6px;
    font-weight: bold;
  }
  .mail-item {
    font-size: 12px;
    padding: 4px;
    margin: 6px;
    border: 1px solid #ccc;
    cursor: pointer;
    &.actived {
      border: 1px solid var(--main-color);
      border-radius: 4px;
      .subject {
        color: var(--main-color)
      }
    }
    & + .mail-item {
      margin-top: 8px;
    }
    .subject {
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .to,
    .cc {
      color: #727d95;
      padding: 4px 0;
    }

    &.mail_status_send_success {
      .status {
        color: #67c23a;
      }
    }
    &.mail_status_send_fail {
      .status {
        color: #f56c6c;
      }
    }
  }
}

.operate-bar {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
}
</style>
