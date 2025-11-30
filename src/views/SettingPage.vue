<template>
  <div class="settting-view">
    <div class="header">
      <el-button @click="back">返回</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
    <div class="container">
      <h4>全局样式设置
        <el-tooltip effect="dark" placement="bottom-start">
        <template #content>部分邮箱收件时会抹除全局样式（如腾讯系邮箱，QQ个人邮箱，企业邮箱），建议在邮件正文中独立配置</template>
        <el-icon color="var(--main-color)" class="font-tip">
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
      </h4>

      <el-form v-model="form">
        <el-form-item label="字体">
          <el-select v-model="form.fontFamily" multiple collapse-tags collapse-tags-tooltip clearable>
            <el-option v-for="font in fontFamilyList" :label="font.label" :key="font.value" :value="font.value">{{
              font.label }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-tooltip effect="dark" placement="bottom-start">
            <template #content>
              字体指定的是一个优先级从高到低的字体列表。字体的选定不是在发现用户计算机上安装的列表中的第一个字体时停止。<br />
              相反，对字体的选择是逐字进行的。也就是说某个字符在当前的字体文件中没有适合的图形，那么会继续尝试列表中靠后的字体。
            </template>
            <el-icon color="var(--main-color)" class="font-tip">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
          <div class="font-label">{{ form.fontFamily ? form.fontFamily.join(",") : "" }}</div>
        </el-form-item>
        <el-form-item label="字号">
          <el-input-number v-model="form.fontSize"></el-input-number>
        </el-form-item>
        <el-form-item label="行高">
          <el-input-number v-model="form.lineHeight"></el-input-number>
        </el-form-item>
        <el-form-item label="发送间隔(秒)">
          <el-input-number v-model="form.countdownSeconds" :min="0" :max="300" placeholder="默认5秒"></el-input-number>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ref, toRaw } from 'vue'
import { type Config } from "@typings/index"
import { en, cn } from "@/components/MailEditor/fontFamilyList"


const ipcRenderer = window.ipcRenderer
const router = useRouter()

const fontFamilyList = ref([...cn, ...en])
const form = ref<Config>({})


ipcRenderer.invoke("loadConfig").then((config: Config) => {
  Object.assign(form.value, config)
})

function handleSave() {
  ipcRenderer.invoke("saveConfig", toRaw(form.value))
  back()
}

function back() {
  router.back()
}
</script>


<style lang="scss" scoped>
.container {
  margin: 0 auto;
  width: 60%;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #ccc;

  h4 {
    margin-bottom: 10px;
  }

  .font-tip {
    margin-right: 1em;
    cursor: pointer;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #eee;
  margin-bottom: 20px;
}
</style>
