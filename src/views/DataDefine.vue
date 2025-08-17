<template>
  <div class="container">
    <el-upload
      class="uploader"
      v-show="!isMountGrid"
      ref="uploadRef"
      :on-exceed="handleExceed"
      :show-file-list="false"
      accept=".xls,.xlsx"
      drag
      :limit="1"
      :auto-upload="false"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div ref="uploadTrigger" class="el-upload__text">
        将文件拖放到这里或 <em>点击选择</em>
      </div>
      <template #tip>
        <p class="description">
          选择 Excel 文件作为数据源，支持 <em>.xls</em> 与 <em>.xlsx</em> 格式
        </p>
      </template>
    </el-upload>

    <div ref="gridwrap" class="grid-wrap" v-show="isMountGrid">
      <div class="header">
        <div class="front">
          <el-button-group size="small">
            <el-button round type="primary" @click="crateNewVar">
              <el-icon :size="14"><Aim /></el-icon>
              <span>
                定义选中列
                <small>{{ pickTarget || "R:C" }}</small>
              </span>
            </el-button>
            <el-button round type="info" @click="repick">重选文件</el-button>
          </el-button-group>
          <el-checkbox v-model="hasTitle">首行包含标题</el-checkbox>
        </div>
        <el-popover
          placement="bottom-end"
          width="400px"
          :disabled="vars.length < 1"
        >
          <template v-for="(variable, index) in vars" :key="variable.label">
            <el-tag class="var-item" closable @close="handleRemoveVar(index)">{{
              variable.label
            }}</el-tag>
          </template>
          <template #reference>
            <el-badge :value="vars.length" class="view-defined">
              <el-tag effect="plain">已定义变量</el-tag>
            </el-badge>
          </template>
        </el-popover>
      </div>
      <div class="data-grid" ref="datagridRef"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeUnmount, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
// @ts-ignore
import canvasDatagrid from "canvas-datagrid";
import { ElMessageBox, genFileId } from "element-plus";

const ipcRenderer = window.ipcRenderer

const router = useRouter();
const gridwrap = ref(null);
const datagridRef = ref();
const uploadRef = ref();
const uploadTrigger = ref();
const pickTarget = ref("");
const grids: any[] = [];
const hasTitle = ref(false);
const isMountGrid = ref(false);

watch(hasTitle, (value) => {
  ipcRenderer.invoke("setHasTitle", value);
});

const vars = ref<{ label: string; value: string }[]>([]);

const crateNewVar = () => {
  if (!pickTarget.value) {
    return;
  }
  ElMessageBox.prompt("请输入变量名", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /.+/,
    inputErrorMessage: "变量名不能为空",
  })
    .then(({ value }) => {
      vars.value.push({ label: value, value: pickTarget.value });
      setVars();
    })
    .catch(() => {});
};

const handleRemoveVar = (index: number) => {
  vars.value.splice(index, 1);
  setVars();
};

const mountGrid = (data: any) => {
  isMountGrid.value = true;
  const grid = canvasDatagrid({
    parentNode: datagridRef.value,
    data: data,
    editable: false,
    allowSorting: false,
    columnHeaderClickBehavior: "none",
  });

  grid.style.width = "100%";
  grid.style.height = "100%";
  grid.style.gridBackgroundColor = "#fff";
  grid.style.cellHeight = 30;
  const handleClick = (e: Event & { cell: any }) => {
    e.preventDefault();
    const { cell } = e;
    const { index } = cell.header;
    grid.selectArea({
      top: 0,
      left: index,
      bottom: data.length,
      right: index,
    });
    grid.draw();
    pickTarget.value = `-1:${index}`;
  };

  const handleContextMenu = (e: Event) => {
    e.preventDefault();
  };

  grid.addEventListener("click", handleClick);

  grid.addEventListener("contextmenu", handleContextMenu);

  return () => {
    grid.removeEventListener("click", handleClick);
    grid.removeEventListener("contextmenu", handleContextMenu);
    grid.dispose();
  };
};

onBeforeUnmount(() => {
  grids.forEach((clear) => {
    clear();
  });
});

function getVars() {
  ipcRenderer.invoke("getVars").then((data) => {
    if (data && data.length) {
      vars.value = data;
    }
  });
}

onMounted(() => {
  ipcRenderer.invoke("getHasTitle").then((value) => {
    hasTitle.value = value;
  });
  getVars();
  ipcRenderer.invoke("getExcelPath").then((path) => {
    if (path) {
      handleChange({ raw: { path } }, false);
    }
  });
});

const handleExceed = (files: any[]) => {
  uploadRef.value.clearFiles();
  const file = files[0];
  file.uid = genFileId();
  uploadRef.value.handleStart(file);
};

function repick() {
  uploadTrigger.value.click();
}

function handleChange(file: { raw: any }, clearForm = true) {
  ipcRenderer.invoke("parse-excel", file.raw.path).then((data) => {
    if (clearForm) {
      ipcRenderer.invoke("clearForm");
      ipcRenderer.invoke("clearMails");
      vars.value = [];
      setVars();
    }
    const grid = mountGrid(data);
    if (grids.length > 0) {
      const clearLastGrid = grids.pop();
      clearLastGrid();
    }
    grids.push(grid);
  });
}

function setVars() {
  const varsData = JSON.stringify(vars.value);
  ipcRenderer.invoke("setVars", varsData);
}

function toNext() {
  router.push("/layout/write/editor");
}

defineExpose({
  next: toNext,
})
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
}
.uploader {
  margin: 40px;
  .description {
    font-size: 14px;
    padding-top: 10px;
    em {
      color: var(--main-color);
    }
  }
}

.grid-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  .header {
    display: flex;
    align-items: center;
    padding: 10px 15px 7px 15px;
  }
  .front {
    display: inherit;
    align-items: center;
    & > *:not(:first-child) {
      margin-left: 8px;
    }
  }
  .view-defined {
    margin-left: auto;
    transform: translateX(-10px);
  }
  .data-grid {
    flex: 1;
    height: 0;
  }
}

.var-item {
  margin: 4px;
}

.operate-bar {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
}
</style>
