function base64ImageToBuffer (base64) {
  const [header, format] = base64.match(/^data:image\/(\w+);base64,/)
  const data = base64.replace(header, '')
  const buffer = Buffer.from(data, 'base64')
  return { buffer, format }
}

const axios = require('axios');

async function downloadImage (url) {
  const { data } = await axios.get(url, { responseType: 'arraybuffer' })
  return data
}

module.exports = {
  base64ImageToBuffer,
  downloadImage
}
