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
    <slot name="action" :index="currentStep" :total="steps.length - 1"></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

type Step = {
  icon: string;
  path: string;
  name: string;
  description: string;
};

const currentStep = computed(() => {
  return steps.value.findIndex((step) => step.path === route.path);
});

const steps = ref<Step[]>([
  {
    icon: "iconfont icon-var",
    path: "/layout/write/definedata",
    name: "定义变量",
    description: "",
  },
  {
    icon: "iconfont icon-mail",
    path: "/layout/write/editor",
    name: "编写邮件",
    description: "",
  },
  {
    icon: "iconfont icon-send1",
    path: "/layout/write/preview",
    name: "预览发送",
    description: "",
  },
]);

function handleJump(step: Step) {
  router.replace(step.path);
}
</script>

<style lang="scss" scoped>
.step-bar {
  display: flex;
  border-bottom: 1px solid #ccc;
  background-color: #f5f7fa;
  align-items: center;
  padding-right: 15px;
  .content {
    display: flex;
    flex: 1;
  }
  .step-item {
    width: 120px;
    height: 50px;
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
      color: var(--main-color);
      background-color: #fff;
      border-right: 1px solid #ccc;
      &:not(:first-child) {
        border-left: 1px solid #ccc;
      }
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
</style>
