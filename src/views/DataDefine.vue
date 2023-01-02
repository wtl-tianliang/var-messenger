<template>
  <!-- uploader -->
  <div class="container">
    <div class="var-list">
      <div class="title">变量定义</div>
      <div class="list">
        <div
          class="item"
          v-for="(variable, index) in vars"
          :key="variable.label"
        >
          <div class="name">{{ variable.label }}</div>
          <div class="value-display">
            <el-icon
              :size="14"
              class="target-handle"
              :class="{ picking: pickTarget === variable }"
              @click="setValue(variable)"
            >
              <Aim></Aim>
            </el-icon>
            <div class="value">{{ variable.value }}</div>
            <el-icon
              :size="14"
              class="delete-handle"
              v-if="variable.configable"
              @click="removeVar(index)"
            >
              <Delete></Delete>
            </el-icon>
          </div>
        </div>
      </div>
      <div class="footer">
        <el-button type="primary" class="create-btn" @click="crateNewVar"
          >新建变量</el-button
        >
      </div>
    </div>
    <div class="table">
      <el-upload ref="uploadRef" :on-exceed="handleExceed" :show-file-list="false" accept=".xls,.xlsx" :limit="1" :auto-upload="false" :on-change="handleChange">
        <template #trigger>
          <div class="tip">
            <el-button size="small" type="primary" style="margin-right:10px;">选择文件</el-button>
            <el-checkbox @click.stop v-model="hasTitle" @change="handleTitleChange">首行包含标题</el-checkbox>
          </div>
        </template>
      </el-upload>
      <!-- sheet -->
      <div class="data-grid" ref="datagridRef">
        <p class="tip" v-if="!isMountGrid">请选择文件</p>
      </div>
      <div class="footer">
        <el-button type="success" @click="toWriteTemplate">下一步</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, onMounted } from "vue";
import router from "@/router/index";
import { ipcRenderer } from "electron";
import canvasDatagrid from "canvas-datagrid";
import { ElMessageBox, genFileId } from "element-plus";

const datagridRef = ref();
const uploadRef = ref();
const pickTarget = ref(null);
const grids = [];
const hasTitle = ref(false)
const isMountGrid = ref(false)

function handleTitleChange(value) {
  ipcRenderer.invoke('setHasTitle', value)
}

const vars = ref([
  { label: "`收件人`", value: "", configable: false },
  { label: "`附件`", value: "", configable: false },
]);

const crateNewVar = () => {
  ElMessageBox.prompt("请输入变量名", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /.+/,
    inputErrorMessage: "变量名不能为空",
  })
    .then(({ value }) => {
      vars.value.push({ label: `\`${value}\``, value: "", configable: true });
    })
    .catch(() => {});
};

const setValue = (variable) => {
  pickTarget.value = variable;
};

const removeVar = (index) => {
  vars.value.splice(index, 1);
};

const mountGrid = (data) => {
  isMountGrid.value = true
  const grid = canvasDatagrid({
    parentNode: datagridRef.value,
    data: data,
    editable: false,
    allowSorting: false,
    columnHeaderClickBehavior: "none",
  });

  grid.style.height = "100%";
  grid.style.width = "100%";
  const handleClick = (e) => {
    const { cell } = e;
    if (cell.context !== "cell" || !pickTarget.value) {
      return;
    }
    pickTarget.value.value = cell.gridId;
    pickTarget.value = null;
  };

  const handleContextMenu = (e) => {
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
  ipcRenderer.invoke('getHasTitle').then((value) => {
    hasTitle.value = value
  })
  getVars()
  ipcRenderer.invoke('getExcelPath').then(path => {
    if (path) {
      handleChange({raw: { path }})
    }
  })
})

const handleExceed = (files) => {
  uploadRef.value.clearFiles()
  const file = files[0]
  file.uid = genFileId()
  uploadRef.value.handleStart(file)
}

function handleChange (file) {
  ipcRenderer.invoke("parse-excel", file.raw.path).then((data) => {
    const grid = mountGrid(data);
    if (grids.length > 0) {
      const clearLastGrid = grids.pop()
      clearLastGrid()
    }
    grids.push(grid);
  });
}

const toWriteTemplate = () => {
  const varsData = JSON.stringify(vars.value);
  ipcRenderer.invoke("setVars", varsData).then(() => {
    router.push("/editor");
  });
};
</script>

<style lang="scss" scoped>
.data-grid {
  position: relative;
  flex: 1;
  height: 0;
  .tip {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #ccc;
  }
}

.container {
  display: flex;
  .var-list {
    padding: 8px 4px;
    width: 200px;
    border-right: 1px dashed #ccc;
    margin-right: 4px;
    display: flex;
    flex-direction: column;
    .list {
      flex: 1;
      overflow: auto;
      .name {
        padding: 2px 4px;
        background-color: var(--main-color);
        color: #fff;
        margin-top: 4px;
      }
    }
    .create-btn {
      width: 100%;
    }
  }
  .table {
    display: flex;
    flex: 1;
    width: 0;
    padding: 8px;
    flex-direction: column;
    line-height: 0;
    .footer {
      text-align: right;
    }
  }
}

.tip {
  display: flex;
  align-items: center;
}

.value-display {
  display: flex;
  align-items: center;
  height: 30px;
  border: 1px solid #ccc;
  font-size: 12px;
  .target-handle,
  .delete-handle {
    width: 20px;
    text-align: center;
    color: #ccc;
    cursor: pointer;
    &:hover {
      color: var(--main-color);
    }
  }
  .target-handle {
    &.picking {
      color: var(--main-color);
    }
  }
  .value {
    flex: 1;
    margin-left: 4px;
    &:empty::after {
      content: "未设置";
      color: #ccc;
    }
  }
}
</style>
