/* eslint-disable no-unused-vars */

import { ipcMain, shell } from "electron";
import { sendMailForList, verifyConnection } from "./src/mail";
import { parseAttachments } from "./src/mail/utils";
import { genDocx } from "./src/word/html2docx";
import { parseExcel } from "./src/excel";
import { v4 as uuid } from "uuid";
import MAIL_STATUS from "../MAIL_STATUS.js";
import * as path from "path";
import fs from "fs";
import {
  deleteLoginHistory,
  insertLoginHistory,
  getLoginHistoies,
} from "./src/db";
import { sendMessageToRender } from "./utils";
import { logPath } from "./src/log";
import { loadConfig, saveConfig } from "./src/configuration";

const isDevelopment = process.env.NODE_ENV !== "production";

let defineData = [];
let defineVars = [];
let defineVarsMap = {};
let isHasTitle = false;
const letters = [];
let excelPath = "";
let form: any = {};

export function getVars() {
  return defineVars;
}

ipcMain.handle("loadConfig", (event, data) => {
  return loadConfig();
});

ipcMain.handle("saveConfig", (event, data) => saveConfig(data));

ipcMain.handle("clearForm", (event, data) => {
  form = {};
});

ipcMain.handle("logout", (event, data) => {
  form = {};
  defineData = [];
  defineVarsMap = {};
  defineVars = [];
  isHasTitle = false;
  letters.length = 0;
  excelPath = "";
});

ipcMain.handle("setHasTitle", (event, data) => {
  isHasTitle = data;
});

ipcMain.handle("getHasTitle", () => {
  return isHasTitle;
});

ipcMain.handle("parse-excel", (event, file) => {
  excelPath = file;
  const data = parseExcel(file);
  defineData = data;
  // 若表格数据不足60行，30列，则补足
  const MIN_ROWS = 60;
  const MIN_COLS = 30;
  if (data.length < MIN_ROWS) {
    let rowIndex = MIN_ROWS - data.length;
    while (rowIndex > 0) {
      data.push(new Array(MIN_ROWS).fill(""));
      rowIndex -= 1;
    }
  }

  data.forEach((col: Array<any>) => {
    if (col.length < MIN_COLS) {
      let colIndex = MIN_COLS - col.length;
      while (colIndex > 0) {
        col.push("");
        colIndex -= 1;
      }
    }
  });

  return data;
});

ipcMain.handle("verifyConnection", (event, option) => {
  return verifyConnection(event.sender, option);
});

ipcMain.handle("setForm", (event, data) => {
  form = JSON.parse(data);
});

ipcMain.handle("getForm", (event) => {
  return form;
});

ipcMain.handle("setVars", (event, data) => {
  const vars = JSON.parse(data);
  defineVars = vars;
  defineVarsMap = vars.reduce((pre, cur) => {
    pre[cur.label] = cur;
    return pre;
  }, {});
});

ipcMain.handle("getVars", (event) => {
  return defineVars;
});

ipcMain.handle("getExcelPath", () => {
  return excelPath;
});

ipcMain.handle("getData", (event) => {
  return defineData;
});

ipcMain.handle("generateDocx", (event, html) => {
  return genDocx(html).then(({ ast, buffer }) => {
    const file = isDevelopment
      ? path.join(__dirname, "doc.docx")
      : path.join(__dirname, "../doc.docx");
    shell.openPath(file);
    fs.writeFileSync(file, buffer);
    return ast;
  });
});

ipcMain.handle("clearMails", () => {
  letters.length = 0;
});

ipcMain.handle("generateMail", (event, data) => {
  const form = JSON.parse(data);
  // 构建收件人列表
  letters.length = 0;

  const replaceVar = (rowData, template) => {
    const vars = template.match(/`[^`]+`/g);
    if (vars) {
      vars.forEach((varText) => {
        varText = varText.replace(/`/g, "");
        if (!defineVarsMap[varText]) {
          sendMessageToRender(event.sender, "error:VarNotFound", varText);
          throw new Error(`error:VarNotFound ${varText}`);
        }
        let [pickRow, pickColumn] = defineVarsMap[varText].value.split(":");
        const isColumn = Number(pickRow) === -1;
        if (isHasTitle) {
          pickRow = Number(pickRow) + 1;
        }
        const realValue = isColumn
          ? rowData[pickColumn]
          : defineData[pickRow][pickColumn];
        template = template.replace(
          new RegExp(`\`${varText}\``, "gim"),
          realValue
        );
      });
    }
    return template;
  };

  const wrapStyle = (html) => {
    const config = loadConfig();
    const style = `.letter-content{font-family:${config.fontFamily};font-size:${config.fontSize}px;line-height:${config.lineHeight}}`;
    const result = `<div class="letter-content"><style>${style}</style>${html}</div>`;
    return result;
  };

  defineData.forEach((rowData, rowIndex) => {
    if (isHasTitle && rowIndex === 0) {
      return;
    }
    const to = replaceVar(rowData, form.to);
    if (!to) {
      return;
    }

    const varsData = {};
    Object.keys(defineVarsMap).forEach((key) => {
      const [, pickColumn] = defineVarsMap[key].value.split(":");
      const value = rowData[pickColumn];
      varsData[key] = value;
    });

    const letter = {
      id: uuid(),
      to,
      cc: replaceVar(rowData, form.cc),
      subject: replaceVar(rowData, form.title),
      html: wrapStyle(replaceVar(rowData, form.html)),
      status: MAIL_STATUS.MAIL_STATUS_READY,
      attachments: form.filePath.map((file) => {
        return parseAttachments(file, varsData);
      }),
    };
    letters.push(letter);
  });

  // 去除无发送目标的邮件
  return letters;
});

ipcMain.handle("getLetters", () => {
  return { letters, contentAsDocx: form.contentAsDocx };
});

ipcMain.handle("sendByIds", async (event, ids) => {
  const list = letters.filter((item) => ids.includes(item.id));
  // 获取配置的倒计时时间
  const config = loadConfig();
  const countdownSeconds = config.countdownSeconds ?? 5;
  await sendMailForList(event.sender, list, form.contentAsDocx, countdownSeconds);
});

ipcMain.handle("getLogin", async (event) => {
  const list = await getLoginHistoies();
  return list;
});

ipcMain.handle("removeLogin", async (event, id) => {
  await deleteLoginHistory(id);
});

ipcMain.handle("addLogin", async (event, data) => {
  const { host: smtp_url, port: smtp_port, useSecure: smtp_secure } = data;
  const { username: smtp_user, password: smtp_pass } = data;

  const { iamp_url = "", iamp_port = 993, iamp_secure = 1 } = data;
  const { iamp_user = "", iamp_password = "" } = data;
  await insertLoginHistory(
    smtp_url,
    smtp_port,
    smtp_user,
    smtp_pass,
    smtp_secure,
    iamp_url,
    iamp_port,
    iamp_user,
    iamp_password,
    iamp_secure
  );
});

ipcMain.handle("openLogdir", () => {
  shell.openPath(logPath);
});
