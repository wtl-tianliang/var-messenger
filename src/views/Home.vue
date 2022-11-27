<template>
  <div class="home">
    <p @click="send">send mail</p>
    <input type="file" @change="handleChange" />
    <router-link to="/app">to app</router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from 'vue-router'
import { ipcRenderer } from "electron";

const origin = {};

const file = ref(origin);

const send = () => {
  console.log(file.value.path, file.value.name)
  ipcRenderer.send("test", {
    attachments: [
      {
        filename: file.value.name,
        path: file.value.path,
      },
    ],
  });
};
const handleChange = (e) => {
  const temp = e.target.files[0];
  file.value = {
    path: temp.path,
    name: temp.name
  };
};
</script>

<script>
export default {
  name: 'ViewHome'
}
</script>

<style lang="scss" scoped>
.home {
  background-color: aquamarine;
  p {
    font-size: 14px;
  }
}
</style>
