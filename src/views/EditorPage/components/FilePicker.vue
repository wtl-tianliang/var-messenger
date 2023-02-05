<template>
  <div class="file-picker">
    <slot name="prev"></slot>
    <div class="content">
      <input ref="input" type="file" multiple @change="handlePickFile" />
      <template v-for="(file, index) in fileList" :key="file.id">
        <el-tooltip :content="file.name">
          <div class="file-item">
            <i class="icon iconfont icon-attachment"></i>
            <div class="ext">{{ file.ext }}</div>
            <div class="info">
              <div class="name">{{ file.name }}</div>
              <div class="size">{{ file.size }}</div>
              <el-checkbox v-if="file.ext === 'docx'" v-model="file.fillVars"
                >填充变量</el-checkbox
              >
            </div>
            <i class="iconfont icon-shut" @click="handleRemoveFile(index)"></i>
          </div>
        </el-tooltip>
      </template>
  
      <div class="start" @click="startPick">
        <i class="iconfont icon-shut"></i>
      </div>
    </div>
    <slot name="append"></slot>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { v4 } from "uuid";

const input = ref(null);
const fileList = ref([]);

function handlePickFile({ target: { files } }) {
  const list = Array.from(files);
  list.forEach((file) => {
    const ext = file.name.split(".").pop();
    const pickItem = {
      id: v4(),
      name: file.name,
      path: file.path,
      size: file.size,
      fillVars: false,
      ext: ext || "unkonw",
    };
    fileList.value.push(pickItem);
  });
}

function handleRemoveFile(index) {
  fileList.value.splice(index, 1)
}

function startPick() {
  input.value.click();
}
</script>

<style lang="scss" scoped>
input[type="file"] {
  display: none;
}
.file-item {
  position: relative;
  display: inline-flex;
  font-size: 12px;
  align-items: center;
  border: 1px solid #ccc;
  margin: 0 10px 10px 0;
  border-radius: 4px;
  line-height: 1;

  .ext {
    position: absolute;
    left: 0;
    bottom: 0;
    background-color: var(--main-color);
    color: #fff;
    padding: 2px 4px;
    border-radius: 0 4px 0 4px;
  }
  .icon {
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    font-size: 24px;
  }

  .info {
    width: 140px;
    height: 60px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .name {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .size {
      color: #ccc;
    }
  }

  .icon-shut {
    position: absolute;
    right: 0;
    top: 0;
    transform: translate(50%, -50%);
    border-radius: 50%;
    background-color: #d33332;
    color: #fff;
    cursor: pointer;
    padding: 2px;
    font-size: 12px;
  }

  ::v-deep(.el-checkbox__input) {
    font-size: 12px;
  }
  ::v-deep(.el-checkbox__label) {
    font-size: 12px;
  }
  ::v-deep(.el-checkbox) {
    height: unset;
  }
}

.start {
  width: 60px;
  height: 60px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: -3px;
  cursor: pointer;
  i {
    transform: rotate(45deg);
  }
}
</style>
