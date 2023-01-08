const docx = require("docx");
const { downloadImage, base64ImageToBuffer } = require('./utils')



module.exports = {
  async section (attrs, content = [], translator) {
    return {
      children: await Promise.all(content.map(translator))
    }
  },
  async div (attrs, content, translator) {
    const type = attrs['data-w-e-type']
    if (type === 'todo') {
      const [ status, title ] = content
      return {
        tag: 'p',
        subtag: 'todo',
        content: [typeof status.attrs.checked !== 'undefined' ? '√' : '×', title]
      }
    }
    return await Promise.all(content.map(translator))
  },
  async p (attrs, content = [], translator) {
    const node = new docx.Paragraph({
      children: await Promise.all(content.map(translator)),
    })
    return node
  },
  async span (attrs, content = []) {
    const isTextChild = content.every(ctx => typeof ctx === 'string')
    if (isTextChild) {
      return new docx.TextRun({
        text: content.join()
      })
    }
  },
  async img (attrs) {
    let buffer = null
    if (/^https?/.test(attrs.src)) {
      buffer = await downloadImage(attrs.src)
    } else if (/^data:image\/(\w+);base64,/.test(attrs.src)) {
      const { buffer: imageBuffer } = base64ImageToBuffer(attrs.src)
      buffer = imageBuffer
    }
    const node = new docx.ImageRun({
      data: buffer,
      transformation: {
        width: 200,
        height: 200,
      },
    })
    return node
  },
  async text(text = '') {
    const node = new docx.TextRun({
      text
    })
    return node
  },
};