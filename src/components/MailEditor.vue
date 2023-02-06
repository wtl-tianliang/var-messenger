<template>
  <div id="editor—wrapper">
    <div id="toolbar-container"><!-- 工具栏 --></div>
    <div id="editor-container"><!-- 编辑器 --></div>
  </div>
</template>

<script setup>
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { onMounted, watchEffect, onBeforeUnmount } from "vue";
import { createEditor, createToolbar } from "@wangeditor/editor";
import debounce from "lodash/debounce";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

let editor = null;
let stopWatch = null;

const editorConfig = {
  placeholder: "在此输入内容",

  onCreated(iEditor) {
    stopWatch = watchEffect(() => {
      if (props.modelValue === iEditor.getHtml()) {
        return;
      }
      iEditor && iEditor.setHtml(props.modelValue);
    });
  },

  onChange: debounce(function debounceChange(iEditor) {
    const html = iEditor.getHtml();
    emit("update:modelValue", html);
  }, 200),

  MENU_CONF: {
    uploadImage: {
      base64LimitSize: Infinity,
    },
  },
};

onMounted(() => {
  const value = props.modelValue;

  const toolbarConfig = {
    excludeKeys: [
      "group-video",
      "lineHeight",
      "todo",
      "code",
      "codeBlock",
      "divider",
    ],
    insertKeys: {
      index: 0,
      keys: ["variable"],
    },
  };

  createToolbar({
    editor: createEditor({
      selector: "#editor-container",
      html: value,
      config: editorConfig,
      mode: "default", // or 'simple'
    }),
    selector: "#toolbar-container",
    config: toolbarConfig,
    mode: "default", // or 'simple'
  });
});

onBeforeUnmount(() => {
  stopWatch();
  editor && editor.destroy();
});
</script>

<style lang="scss" scoped>
#editor—wrapper {
  border: 1px solid #ccc;
  z-index: 100; /* 按需定义 */
  font-size: 16px;
  display: flex;
  flex-direction: column;
}
#toolbar-container {
  border-bottom: 1px solid #ccc;
}
#editor-container {
  height: 100%;
  overflow: auto;
}
</style>
