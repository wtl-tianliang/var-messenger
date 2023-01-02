<template>
  <div id="editor—wrapper">
    <div id="toolbar-container"><!-- 工具栏 --></div>
    <div id="editor-container"><!-- 编辑器 --></div>
  </div>
</template>

<script setup>
/* eslint-disable */
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { onMounted } from "vue";
import { createEditor, createToolbar } from "@wangeditor/editor";

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const editorConfig = {
  placeholder: "在此输入内容",
  onChange(editor) {
    const html = editor.getHtml();
    emit('update:modelValue', html)
  },
  MENU_CONF: {
    uploadImage: {
      base64LimitSize: Infinity
    }
  }
};

onMounted(() => {
  const value = props.modelValue
  const editor = createEditor({
    selector: "#editor-container",
    html: value,
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
  height: 400px;
}
</style>
