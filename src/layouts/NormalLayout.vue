<template>
  <div class="normal-layout">
    <nav-menus></nav-menus>
    <router-view class="layout-view" v-slot="{ Component }">
      <component :is="Component"></component>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import NavMenus from "@/components/NavMenus.vue";
</script>

<style lang="scss" scoped>
.normal-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.layout-view {
  flex: 1;
  width: 0;
  overflow: auto;
  box-sizing: border-box;
}
</style>
