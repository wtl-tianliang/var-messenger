import nodemailer from "nodemailer";
import cloneDeep from "lodash/cloneDeep";
import fs from "fs";
import { genDocx } from "../word/html2docx/index.js";

let transporter = null;
let loginMail = "";

export function verifyConnection(webContents, option = {}) {
  const { host, port, password, username, useSecure = false } = option;
  loginMail = username;
  transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: useSecure,
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
        webContents.send("loginSuccess", loginMail);
        resolve({ type: "success", message: "login success" });
      }
    });
  });
}

/**
 * 发送邮件
 * @param {*} letter 邮件配置
 * @param {object} options 发送配置
 * @param {boolean} options.contentToDocx // 正文内容转附件
 * @returns 邮件服务器响应
 */
export async function sendMail(letter, options = {}) {
  const option = {
    from: loginMail,
    to: letter.to,
    cc: letter.cc,
    subject: letter.subject,
    html: letter.html,
    attachments: letter.attachments,
  };

  const regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;

  if (options.contentToDocx) {
    const { buffer } = await genDocx(letter.html);
    option.attachments.push({
      filename: "正文附件.docx",
      content: buffer,
    });
  }
  console.log("sendMessage", option);

  const tolist = option.to.split(";").filter((item) => !regEmail.test(item));
  if (tolist.length > 0) {
    throw { status: "fail", message: "收件人邮箱格式不正确" };
  }

  const cclist = option.cc
    .split(";")
    .filter((item) => item && !regEmail.test(item));
  if (cclist.length > 0) {
    throw { status: "fail", message: "抄送人邮箱格式不正确" };
  }

  const filelist = option.attachments.filter((item) => {
    if (item.path) {
      return !fs.existsSync(item.path);
    }
  });

  if (filelist.length > 0) {
    throw { status: "fail", message: "附件不存在" };
  }

  try {
    const res = await transporter.sendMail(option);
    return { status: "success", message: res.response };
  } catch (err) {
    throw { status: "fail", messge: err.message };
  }
}

export function sendMailForList(webContents, mailList, contentToDocx = false) {
  mailList = cloneDeep(mailList);
  async function sendNext() {
    if (mailList.length < 1) {
      return;
    }
    const option = mailList.shift();

    try {
      const res = await sendMail(option, { contentToDocx });
      webContents.send("sendComplate", { id: option.id, ...res });
    } catch (err) {
      webContents.send("sendComplate", {
        id: option.id,
        status: "fail",
        message: err.message,
      });
    }

    sendNext();
  }
  sendNext();
}
