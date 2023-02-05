<template>
  <div class="step-bar">
    <div class="content">
      <template v-for="step in steps" :key="step.path">
        <div
          class="step-item"
          @click="handleJump(step)"
          :class="{ active: step.path === route.path }"
        >
          <i :class="step.icon"></i>
          <span class="name">{{ step.name }}</span>
        </div>
      </template>
    </div>
    <div id="step-external"></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

const steps = ref([
  { icon: "iconfont icon-var", path: "/steps/definedata", name: "定义变量", description: "" },
  { icon: "iconfont icon-mail", path: "/steps/editor", name: "编写邮件", description: "" },
  { icon: "iconfont icon-send1", path: "/steps/preview", name: "预览发送", description: "" },
]);

function handleJump(step) {
  router.replace(step.path);
}
</script>

<style lang="scss" scoped>
.step-bar {
  display: flex;
  border-bottom: 1px solid #ccc;
  background-color: #f5f7fa;
  .content {
    display: flex;
    flex: 1;
  }
  .step-item {
    width: 120px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;
    font-size: 14px;
    color: #909399;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    &.active {
      position: relative;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
      color: var(--main-color);
      background-color: #fff;
      &::after {
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 1px;
        content: "";
        background-color: #fff;
      }
    }
    i {
      margin-right: 6px;
      font-size: 20px;
    }
  }
}

#step-external {
  text-align: center;
}
</style>
