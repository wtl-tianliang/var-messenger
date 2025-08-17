<template>
  <div class="step-layout">
    <steps-bar>
      <template #action="{ index, total }">
        <el-button @click="handleNext">下一步</el-button>
      </template>
    </steps-bar>
    <router-view class="step-view" v-slot="{ Component }">
      <component :is="Component" ref="stepViewRef"></component>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import StepsBar from "./StepsBar.vue";

const stepViewRef = ref();
const handleNext = () => {
  stepViewRef.value.next();
};
</script>

<style lang="scss" scoped>
.step-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.step-view {
  flex: 1;
  height: 0;
  overflow: auto;
}
</style>
