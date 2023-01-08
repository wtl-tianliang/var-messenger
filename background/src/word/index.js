const fs = require('fs')
const path = require('path')

const { genDocx } = require('./html2docx/index.js')

const html = fs.readFileSync(path.join(__dirname, './content.html'), { encoding: 'utf-8' })

genDocx(html)
