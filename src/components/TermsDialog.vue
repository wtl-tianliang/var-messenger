<template>
  <el-dialog
    v-model="dialogVisible"
    title="重要提示"
    width="80%"
    top="10vh"
    @close="handleClose"
  >
    <div class="terms-content" v-html="htmlContent"></div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import MarkdownIt from "markdown-it";
import { ElMessage } from "element-plus";

// 从文件中读取 Markdown 内容
const htmlContent = ref("");
const dialogVisible = ref(false);

// 读取 Markdown 文件内容
const loadMarkdownContent = async () => {
  try {
    // 使用 Vite 的 ?raw 方式直接引入文件内容
    const markdownContent = await import("@/notice/index.md?raw");

    // 使用 markdown-it 转换为 HTML
    const md = new MarkdownIt();
    htmlContent.value = md.render(markdownContent.default);

    // 显示对话框
    dialogVisible.value = true;
  } catch (error) {
    console.error("加载用户协议失败:", error);
    ElMessage.error("无法加载用户协议与免责声明");
  }
};

// 处理对话框关闭
const handleClose = () => {
  // 可以在这里添加关闭时的逻辑
};

onMounted(() => {
  // 页面加载完成后显示对话框
  loadMarkdownContent();
});
</script>

<style lang="scss" scoped>
.terms-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
  :deep(p) {
    margin-bottom: 1em;
    line-height: 1.5;
  }
  :deep(h1) {
    text-align: center;
    margin-bottom: 1em;
  }
  :deep(h2),
  :deep(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  :deep(ul),
  :deep(ol) {
    margin-left: 2em;
    margin-bottom: 1em;
  }
  :deep(li) {
    margin-bottom: 0.5em;
  }
}
</style>
