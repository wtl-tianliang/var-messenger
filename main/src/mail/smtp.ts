import nodemailer from "nodemailer";
import cloneDeep from "lodash/cloneDeep";
import fs from "fs";
import { logger } from "../log";
import type { WebContents } from "electron";
import type { LoginOption } from "@typings/index.d";
import { logInImap } from "./imap";

let transporter = null;
let loginMail = "";

export async function loginSmtp(webContents, option: LoginOption) {
  const { host, port, password, username, useSecure = false } = option;
  loginMail = username;

  const options = {
    host: host,
    port: port,
    secure: useSecure,
    auth: {
      type: "login",
      user: username,
      pass: password,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  };

  transporter = nodemailer.createTransport(options);
  return new Promise((resolve) => {
    transporter.verify((error) => {
      if (error) {
        logger("login", { options, error });
        resolve({ type: "error", message: error.message });
      } else {
        logger("login", { options, message: "success" });
        webContents.send("loginSuccess", loginMail);
        resolve({ type: "success", message: "login success" });
      }
    });
  });
}

export async function loginImap(webContents, option: LoginOption) {
  // 使用IMAP选项进行登录验证
  const { imapHost, imapPort, imapPassword, imapUser, imapSecure } = option;
  if (!imapHost || !imapPort || !imapPassword || !imapUser) {
    return { type: "error", message: "IMAP配置不完整" };
  }
  
  return await logInImap(webContents, {
    host: imapHost,
    port: imapPort,
    password: imapPassword,
    username: imapUser,
    useSecure: imapSecure || false
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
    // const res = await transporter.sendMail(option);
    console.log("sendMail", option);
    const res = { response: "ok" };
    logger("send", { option, res });
    return { status: "success", message: res.response || "发送成功" };
  } catch (error) {
    logger("send", { option, error });
    throw { status: "fail", messge: error.message || "未知异常" };
  }
}

export function sendMailForList(
  webContents: WebContents,
  mailList,
  contentToDocx: boolean = false
): Promise<void> {
  mailList = cloneDeep(mailList);
  return new Promise((resolve) => {
    async function sendNext() {
      if (mailList.length < 1) {
        resolve();
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
  });
}
