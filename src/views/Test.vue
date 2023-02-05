<template>
  <div>
    <el-button @click="handleDocx">docx</el-button>
    <el-button @click="handleDBtest">dbTest</el-button>
    <router-link to="/">home</router-link>
  </div>
</template>


<script setup>
import { ipcRenderer } from 'electron'
import { RouterLink } from 'vue-router'
function handleDocx() {
  ipcRenderer.invoke('generateDocx', 'htmlString').then(res => {
    console.log(res)
  })
}
function handleDBtest() {
  ipcRenderer.invoke('dbTest')
}
</script>

<script>
export default {
  name: 'TestPage'
}
</script>


<style scoped>

</style>