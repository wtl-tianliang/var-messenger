<template>
  <div class="preview">
    <el-alert class="warning" type="warning"
      >请勿在发送完成前离开本页面，发送过程中离开本页面不会停止发送操作。</el-alert
    >
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
        <template #default="{ row }">{{
          hasContentDocx ? row.attachments.length + 1 : row.attachments.length
        }}</template>
      </el-table-column>
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tooltip
            effect="dark"
            :content="row.message"
            placement="top-start"
            :disabled="!row.message"
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
          <el-button
            size="small"
            type="danger"
            @click="handleDelete($index)"
            :disabled="blockOperate"
            >删除</el-button
          >
          <el-button
            size="small"
            @click="handleReSend(row)"
            :disabled="blockOperate || row.disabled"
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
        <el-button
          :disabled="blockOperate"
          round
          type="primary"
          @click="handleSendAll"
          >全部发送</el-button
        >
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import PreviewDialog from "./components/PreviewDialog/index";
import MAIL_STATUS, { MAIL_STATUS_MAP } from "@/../MAIL_STATUS";

const ipcRenderer = window.ipcRenderer
const list = ref<any[]>([]);
const hasContentDocx = ref(false);
const blockOperate = ref(false);

function getlist() {
  ipcRenderer.invoke("getLetters").then(({ letters, contentAsDocx }) => {
    list.value = letters.map((item: any) => ({ ...item, disabled: false }));
    hasContentDocx.value = contentAsDocx;
  });
}

function handlePreview(row: any) {
  PreviewDialog.open({
    html: row.html,
  });
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
  const letter = list.value.find((item:any) => item.id === id);
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
.preview {
  display: flex;
  flex-direction: column;
}
.warning {
  margin-bottom: 10px;
}

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
