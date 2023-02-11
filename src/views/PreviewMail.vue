<template>
  <div class="preview">
    <el-table :data="list" height="100%">
      <el-table-column type="index" align="center" label="#"></el-table-column>
      <el-table-column
        label="标题"
        prop="subject"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="收件人"
        prop="to"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="抄送人"
        prop="cc"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="附件数量" width="100">
        <template #default="{ row }">
          {{ hasContentDocx ? row.attachments.length + 1 : row.attachments.length }}
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tooltip
            effect="dark"
            :content="row.message"
            placement="top-start"
          >
            <span class="status" :class="row.status">{{
              MAIL_STATUS_MAP[row.status]
            }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="{ row, $index }">
          <el-button size="small" @click="handlePreview(row)">查看</el-button>
          <el-button size="small" type="danger" @click="handleDelete($index)">删除</el-button>
          <el-button
            @click="handleReSend(row)"
            v-if="row.status === 'MAIL_STATUS_SEND_FAIL'"
            >重试</el-button
          >
        </template>
      </el-table-column>

      <!-- 无数据展示 -->
      <template #empty>
        <div class="empty">
          <img src="@/assets/empty.png" alt="empty placeholder" />
          <div class="txt">暂无数据</div>
        </div>
      </template>
    </el-table>

    <Teleport to="#step-external">
      <div class="operate-bar">
        <el-button round type="primary" @click="handleSendAll"
          >全部发送</el-button
        >
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ipcRenderer } from "electron";
import PreviewDialog from "./components/PreviewDialog/index";
import MAIL_STATUS, { MAIL_STATUS_MAP } from "@/../MAIL_STATUS.js";

const list = ref([]);
const hasContentDocx = ref(false)

function getlist() {
  ipcRenderer.invoke("getLetters").then(({letters, contentAsDocx}) => {
    list.value = letters;
    hasContentDocx.value = contentAsDocx
  });
}

function handlePreview(row) {
  PreviewDialog.open({
    html: row.html,
  });
}

function handleDelete(index) {
  list.value.splice(index, 1);
}

function handleSendAll() {
  const ids = list.value.map((item) => item.id);
  ipcRenderer.invoke("sendByIds", ids);
}

function handleReSend(row) {
  const ids = [row.id];
  ipcRenderer.invoke("sendByIds", ids);
}

ipcRenderer.on("sendComplate", (event, { id, status, message }) => {
  const idx = list.value.findIndex((item) => item.id === id);
  if (idx < 0) {
    return;
  }
  list.value[idx].status =
    status === "success"
      ? MAIL_STATUS.MAIL_STATUS_SEND_SUCCESS
      : MAIL_STATUS.MAIL_STATUS_SEND_FAIL;
  list.value[idx].message = message;
});

onMounted(() => {
  getlist();
});
</script>

<style lang="scss" scoped>
.status {
  &.MAIL_STATUS_SEND_SUCCESS {
    color: #67c23a;
  }
  &.MAIL_STATUS_SEND_FAIL {
    color: #f56c6c;
  }
}

.operate-bar {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
}
.empty {
  position: relative;
  img {
    width: 120px;
  }
  .txt {
    position: absolute;
    font-size: 12px;
    left: 50%;
    top: 60%;
    transform: translateX(-50%);
  }
}
</style>
