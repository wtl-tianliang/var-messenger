<template>
  <div class="editor">
    <textarea ref="dom"></textarea>
  </div>
</template>


<script lang="ts" setup>
import type { TinyMCE, Editor } from "typings/tinymce";
import { ref, onMounted, onBeforeUnmount } from "vue";
import InsertVariablePlugin from "./InsertVariable";

const dom = ref()
const Tinymce = window.tinymce as TinyMCE
let instance: Editor | null = null

Tinymce.PluginManager.add('variable', InsertVariablePlugin);


const plugins = ["variable", "lists", "advlist", "link", "autolink", "autosave", "emoticons", "image", "preview", "anchor", "searchreplace", "visualblocks", "table", "wordcount"]


const toolbar = [
  ["undo", "redo", "variable", "fontfamily", "fontsizeinput", "lineheight", "bold", "underline", "blockquote", "forecolor", "backcolor", "strikethrough", "subscript", "superscript", "outdent", "indent", "paste", "pastetext", "remove", "removeformat", "wordcount"],
  ["bullist", "numlist", "hr", "link", "table", "tablerowprops", "tablecellprops", "tablemergecells", "image", "emoticons", "anchor"],
].map(arr => arr.join(" "))

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  defaultStyle: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

onMounted(() => {
  Tinymce.init({
    target: dom.value,
    language: "zh-Hans",
    height: "100%",
    menubar: false,
    font_family_formats: "微软雅黑='微软雅黑';宋体='宋体';黑体='黑体';仿宋='仿宋';楷体='楷体';隶书='隶书';幼圆='幼圆';Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings",
    font_size_input_default_unit: "px",
    plugins,
    toolbar,
    statusbar: false,
    link_default_target: '_blank',
    images_upload_handler(blobInfo, progress) {
      const blob = blobInfo.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result
          if (base64) {
            resolve(base64.toString())
          } else {
            reject({ message: "图片处理失败", remove: true })
          }
          progress(100)
        }
        reader.readAsDataURL(blob)
      })
    },
    setup: function (editor) {
      instance = editor
      editor.on('init',  (ed) => {
        const body = editor.getBody()
        if (props.defaultStyle){
          body.style.fontSize = props.defaultStyle.fontSize + "px"
          body.style.fontFamily = props.defaultStyle.fontFamily
          body.style.lineHeight = props.defaultStyle.lineHeight
        }
        editor.setContent(props.modelValue, { format: "html" })
      });
      editor.on("change keyup undo redo", (e) => {
        const html = editor.getContent({ format: "html" })
        emit("update:modelValue", html)
      })
    },
  })
})
onBeforeUnmount(() => {
  instance && instance.destroy()
})
</script>


<style lang="scss" scoped>
.editor {
  height: 100%;
  :deep(.tox-tinymce) {
    border-width: 1px;
    border-radius: 6px;
    .tox-editor-header {
      box-shadow: none;
    }
    .tox-toolbar-overlord {
      .tox-toolbar {
        background-size: 100%;
        .tox-toolbar__group {
          padding: 0;
        }
      }
    }
  }
}
</style>