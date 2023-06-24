import { nextTick, createApp } from 'vue'
import PreviewDialog from './PreviewDialog.vue'

export default {
  open(props: any) {
    const el = document.createElement('div')
    const app = createApp(PreviewDialog, {
      ...props,
      onClosed () {
        app.unmount()
        el.parentElement?.removeChild(el)
      }
    })
    app.mount(el)
    nextTick(() => {
      document.body.appendChild(el)
    })
  }
}