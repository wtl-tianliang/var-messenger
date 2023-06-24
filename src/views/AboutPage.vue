<template>
  <div class="version-page">
    <div class="back" @click="back">回到应用</div>

    <div class="content">
      <img class="logo" src="@/assets/icon.png" alt="logo" />
      <div class="title">Var Messenger</div>
      <p class="version">version: {{ version }}</p>
      <template v-for="link in links" :key="link.href">
        <p
          @click="open(link.href)"
          :href="link.href"
          class="link"
          :class="link.icon"
          :title="link.desc"
        ></p>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import { ElMessage } from "element-plus";
// @ts-ignore
import pkg from '../../package.json'

const funs = window.funs;

const version = pkg.version

const links = [
  {
    href: "mailto:wwwszsxcn@hotmial.com",
    icon: "iconfont icon-mail",
    desc: '作者邮箱'
  },
  {
    href: "https://github.com/wtl-tianliang/var-messenger",
    icon: "iconfont icon-github",
    desc: 'github'
  },
];

function open(href: string) {
  funs.copy(href)
  funs.openURL(href)
  ElMessage.success({ message: "链接已复制" });
}

function back() {
  router.back()
}
</script>

<style scoped lang="scss">
.back {
  position: absolute;
  top: 40px;
  left: 0;
  font-size: 14px;
  cursor: pointer;
  color: var(--main-color);
  padding: 10px 20px;
}
.version-page {
  .content {
    text-align: center;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 14px;
    .logo {
      width: 75px;
    }
    .title {
      margin: 20px 0 10px 0;
      font-weight: bold;
    }
    .version {
      font-size: 12px;
    }
    .link {
      text-decoration: none;
      color: #000;
      margin: 10px 4px;
      display: inline-block;
      cursor: pointer;
      font-size: 20px;
    }
  }
}
</style>
