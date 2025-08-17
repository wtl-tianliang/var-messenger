<template>
  <div class="nav-menus">
    <div class="nav-group" v-for="group in menus" :key="group.key">
      <div class="nav-group-items">
        <router-link
          :to="item.path || '#'"
          class="nav-item"
          v-for="item in group.items"
          :key="item.name"
          tag="div"
        >
          <div class="nav-item-icon">
            <i :class="item.icon"></i>
          </div>
          <div class="nav-item-name">{{ item.name }}</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
const menus = reactive([
  {
    key: "funs",
    items: [
      { name: "写信", icon: "icon-xinxiang", path: "/layout/write" },
      { name: "收信", icon: "icon-shouxiang", path: "/layout/box/inbox" },
    ],
  },
  {
    key: "tools",
    items: [
      { name: "草稿", icon: "icon-caogao" },
      { name: "垃圾箱", icon: "icon-lajixiang", path: "/layout/box/trash" },
      { name: "设置", icon: "icon-shezhi" },
    ],
  },
]);
</script>

<style lang="scss" scoped>
.nav-menus {
  display: flex;
  flex-direction: column;
  width: 200px;
  box-sizing: border-box;
  .nav-group {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #eee;
    border-top: 1px solid #eee;
    padding: 10px;
    &:first-child {
      border-top: none;
    }

    .nav-group-title {
      font-size: 14px;
      color: #999;
      margin: 10px 0;
    }
    .nav-group-items {
      display: flex;
      flex-direction: column;
      .nav-item {
        display: flex;
        align-items: center;
        text-decoration: none;
      }
      .nav-item-icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #eee;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 5px;
        margin-right: 5px;
        i {
          font-size: 20px;
          color: #666;
        }
      }
      .nav-item-name {
        font-size: 12px;
        color: #666;
      }
    }
  }
}
</style>
