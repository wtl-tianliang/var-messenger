<template>
  <div id="editor—wrapper">
    <div id="toolbar-container"><!-- 工具栏 --></div>
    <div id="editor-container"><!-- 编辑器 --></div>
  </div>
</template>

<script setup>
/* eslint-disable */
import "@wangeditor/editor/dist/css/style.css"; // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted, nextTick } from "vue";
import { createEditor, createToolbar } from "@wangeditor/editor";

const editorConfig = {
  placeholder: "Type here...",
  onChange(editor) {
    const html = editor.getHtml();
    console.log("editor content", html);
  },
};

nextTick(() => {
  const editor = createEditor({
    selector: "#editor-container",
    html: "<p><br></p>",
    config: editorConfig,
    mode: "default", // or 'simple'
  });

  const toolbarConfig = {
    excludeKeys: ['group-video']
  };

  const toolbar = createToolbar({
    editor,
    selector: "#toolbar-container",
    config: toolbarConfig,
    mode: "default", // or 'simple'
  });

  const config = toolbar.getConfig()
  console.log(editor, config);
});
</script>

<style lang="scss" scoped>
#editor—wrapper {
  border: 1px solid #ccc;
  z-index: 100; /* 按需定义 */
}
#toolbar-container {
  border-bottom: 1px solid #ccc;
}
#editor-container {
  height: 500px;
}
</style>
