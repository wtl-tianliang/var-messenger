import { BrowserWindow } from "electron";
import nodemailer from "nodemailer";
import cloneDeep from 'lodash/cloneDeep'
import fs from 'fs'

let transporter = null;
let loginMail = "";

export function verifyConnection(option = {}) {
  const { host, port, password, username } = option;
  loginMail = username;
  transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: true,
    auth: {
      type: "login",
      user: username,
      pass: password,
    },
  });
  return new Promise((resolve) => {
    transporter.verify((error) => {
      if (error) {
        resolve({ type: "error", message: error.message });
      } else {
        resolve({ type: "success", message: "login success" });
      }
    });
  });
}

// eslint-disable-next-line no-unused-vars
export function sendMail(to, cc, subject, html, attachments) {
  // eslint-disable-next-line no-unused-vars
  const option = {
    from: loginMail,
    to: to,
    cc: cc,
    subject: subject,
    html: html,
    attachments: attachments
  };
  const regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
  return new Promise((resolve, reject) => {
    const tolist = option.to.split(';').filter(item => !regEmail.test(item))
    if (tolist.length > 0) {
      reject({ status: 'fail', message: '收件人邮箱格式不正确' })
      return
    }
    const cclist = option.cc.split(';').filter(item => item && !regEmail.test(item))
    if (cclist.length > 0) {
      reject({ status: 'fail', message: '抄送人邮箱格式不正确' })
      return
    }
    const filelist = option.attachments.filter(item => !fs.existsSync(item.path))
    if (filelist.length > 0) {
      reject({ status: 'fail', message: '附件不存在' })
      return
    }
    transporter.sendMail(option).then((res) => {
      console.log(res)
      resolve({ status: 'success', message: res.response})
    }).catch(err => {
      console.log(err)
      reject({ status: 'fail', messge: err.message })
    });
  })
}

export function sendMailForList(mailList) {
  const win = BrowserWindow.getFocusedWindow();
  mailList = cloneDeep(mailList)
  async function sendNext() {
    if (mailList.length < 1) {
      return;
    }
    const option = mailList.shift();
    let { id, to, cc, subject, html, files = [] } = option;
    files = files.filter(item => item && item.length > 0)
    const attachments = files.map(filepath => {
      const [ filename = '附件' ] = filepath.match(/[^\\/]+\.\w+/) || []
      return {
        filename,
        path: filepath
      }
    })
    try {
      const res = await sendMail(to, cc, subject, html, attachments );
      win.webContents.send("sendComplate", { id, ...res });
    } catch (err) {
      win.webContents.send("sendComplate", {
        id,
        status: "fail",
        message: err.message,
      });
    }
    sendNext();
  }
  sendNext();
}

