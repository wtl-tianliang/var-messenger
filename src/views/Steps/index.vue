<template>
  <steps-bar></steps-bar>
  <router-view class="step-layout" v-slot="{ Component }">
    <component :is="Component"></component>
  </router-view>
</template>

<script lang="ts" setup>
import { RouterView } from "vue-router";
import StepsBar from "./StepsBar.vue";
</script>

<script lang="ts">
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
