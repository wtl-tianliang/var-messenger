<template>
  <router-view class="view" v-slot="{ Component }">
    <keep-alive include="MailEditor">
      <component :is="Component"></component>
    </keep-alive>
  </router-view>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>

<style lang="scss" scoped>
.header {
  height: 30px;
  line-height: 30px;
  background-color: var(--main-color);
  padding: 0 10px;
}
.view {
  flex: 1;
  height: 0;
}
</style>

<style lang="scss">
* {
  outline: none;
  text-decoration: none;
}
:root {
  --main-color: var(--el-color-primary);
}
</style>
