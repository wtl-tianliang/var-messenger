<template>
  <steps-bar></steps-bar>
  <router-view class="step-layout" v-slot="{ Component }">
    <component :is="Component"></component>
  </router-view>
</template>

<script setup>
import { RouterView, useRouter } from "vue-router";
import StepsBar from "./StepsBar.vue";

const router = useRouter();
// eslint-disable-next-line no-unused-vars
function handleBack() {
  router.back();
}
</script>

<script>
export default {
  name: "StepsLayout",
};
</script>

<style lang="scss" scoped>
.step-layout {
  padding: 15px;
  height: calc(100% - 113px);
}
</style>
