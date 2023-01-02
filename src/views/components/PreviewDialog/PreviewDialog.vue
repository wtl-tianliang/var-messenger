<template>
  <el-dialog v-model="visible" width="80%" title="邮件预览" @closed="handleClosed">
    <div class="content" :key="id" v-html="html"></div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, toRefs } from "vue";
import { ElDialog } from 'element-plus'

const visible = ref(false);
const id = ref(Date.now());

// eslint-disable-next-line no-undef
const props = defineProps({
  html: {
    type: String,
    default: '' 
  }
})

// eslint-disable-next-line no-undef
const emit = defineEmits(['closed'])

function handleClosed() {
  emit('closed')
}

onMounted(() => {
  visible.value = true
})

const { html } = toRefs(props)

</script>

<style scoped>
.content {
  min-height: 40vh;
  padding: 10px;
  border: 1px dashed #dedede;
}
</style>
