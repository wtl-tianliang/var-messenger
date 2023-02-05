import { BrowserWindow } from "electron";
import nodemailer from "nodemailer";
import cloneDeep from "lodash/cloneDeep";
import fs from "fs";
import { genDocx } from "./word/html2docx/index.js";

let transporter = null;
let loginMail = "";

export function verifyConnection(option = {}) {
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
        const win = BrowserWindow.getFocusedWindow();
        win.webContents.send("loginSuccess", loginMail);
        resolve({ type: "success", message: "login success" });
      }
    });
  });
}

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

export function sendMailForList(mailList, contentToDocx = false) {
  const win = BrowserWindow.getFocusedWindow();
  mailList = cloneDeep(mailList);
  async function sendNext() {
    if (mailList.length < 1) {
      return;
    }
    const option = mailList.shift();
    let { id, to, cc, subject, html, files = [] } = option;
    files = files.filter((item) => item && item.length > 0);
    const attachments = files.map((filepath, index) => {
      const [filename = `附件${index + 1}`] =
        filepath.match(/[^\\/]+\.\w+/) || [];
      return {
        filename,
        path: filepath,
      };
    });

    try {
      const res = await sendMail(
        { to, cc, subject, html, attachments },
        { contentToDocx }
      );
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
