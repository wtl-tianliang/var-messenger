<template>
  <div class="preview">
    <div class="header">
      <el-button type="primary" @click="handleReEdit">重新编辑</el-button>
      <el-button type="success" @click="handleSendAll">全部发送</el-button>
    </div>
    <div class="content">
      <el-table :data="list" size="small" height="100%" border>
        <el-table-column label="标题" prop="subject" show-overflow-tooltip></el-table-column>
        <el-table-column label="收件人" prop="to" show-overflow-tooltip></el-table-column>
        <el-table-column label="抄送人" prop="cc" show-overflow-tooltip></el-table-column>
        <el-table-column label="附件数量" width="100">
          <template #default="{ row }">
            {{ row.files.length }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tooltip effect="dark" :content="row.message" placement="top-start">
              <span class="status" :class="row.status">{{ MAIL_STATUS_MAP[row.status] }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="{ row, $index }">
            <el-button @click="handlePreview(row)">查看</el-button>
            <el-button @click="handleDelete($index)">删除</el-button>
            <el-button @click="handleReSend(row)" v-if="row.status === 'MAIL_STATUS_SEND_FAIL'">重试</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ipcRenderer } from "electron";
import router from "@/router/index";
import PreviewDialog from "./components/PreviewDialog/index";
import MAIL_STATUS, { MAIL_STATUS_MAP } from "@/../MAIL_STATUS.js";

const list = ref([]);

function getlist() {
  ipcRenderer.invoke("getLetters").then((res) => {
    list.value = res;
  });
}

function handlePreview(row) {
  PreviewDialog.open({
    html: row.html,
  });
}

function handleReEdit() {
  router.back();
}

function handleDelete(index) {
  list.value.splice(index, 1);
}

function handleSendAll() {
  const ids = list.value.map((item) => item.id);
  ipcRenderer.invoke("sendByIds", ids);
}

function handleReSend(row) {
  const ids = [row.id]
  ipcRenderer.invoke("sendByIds", ids)
}

ipcRenderer.on("sendComplate", (event, { id, status, message }) => {
  const idx = list.value.findIndex(item => item.id === id)
  if (idx < 0) {
    return
  }
  list.value[idx].status = status === 'success' ? MAIL_STATUS.MAIL_STATUS_SEND_SUCCESS : MAIL_STATUS.MAIL_STATUS_SEND_FAIL
  list.value[idx].message = message
});

onMounted(() => {
  getlist();
});
</script>

<style lang="scss" scoped>
.preview {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 4px;
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .content {
    flex: 1;
    height: 0;
  }
}
.status {
  &.MAIL_STATUS_SEND_SUCCESS {
    color: #67C23A;
  }
  &.MAIL_STATUS_SEND_FAIL {
    color: #F56C6C
  }
}
</style>
