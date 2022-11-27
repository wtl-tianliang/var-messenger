import nodemailer from 'nodemailer'

const options = {
  host: 'smtp.qq.com',
  port: 465,
  auth: {
    type: 'login',
    user: '***REMOVED***',
    pass: '***REMOVED***'
  }
}

const transporter = nodemailer.createTransport(options)

export function verifyConnection() {
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        reject(error)
      } else {
        resolve(success)
      }
    })
  })
}

export function secondMail(options) {
  return transporter.sendMail(options);
}

export function testSend(option) {
  const opt = {
    from: options.auth.user, // sender address
    to: "***REMOVED***", // list of receivers
    subject: "Hello ✔", // Subject line
    html: "<b>Hello world?</b>", // html body
  }
  Object.assign(opt, option)
  console.log(opt)
  secondMail(opt).then(res => {
    setInterval(() => {
      queryDSN(res.envelope, res.messageId)
    }, 4000)
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}

export function queryDSN(envelope, messageId) {
  const message = {
    from: envelope.from,
    to: envelope.to,
    subject: 'Message',
    text: 'I hope this message gets read!',
    dsn: {
      id: messageId,
      return: 'headers',
      notify: 'success',
      recipient: envelope.to[0]
    }
  }
  transporter.sendMail(message, (err, info) => {
    console.log(err, info)
  })
}
