/* eslint-disable no-unused-vars */

import { ipcMain, shell } from "electron";
import { sendMailForList, verifyConnection } from "./src/mail";
import { parseAttachments } from "./src/mail/utils";
import { genDocx } from "./src/word/html2docx";
import { parseExcel } from "./src/excel";
import { v4 as uuid } from "uuid";
import MAIL_STATUS from "../MAIL_STATUS.js";
import path from "path";
import fs from "fs";
import MessengerDB from "./src/db";
import { dbTest } from "./src/db/test";

const isDevelopment = process.env.NODE_ENV !== "production";

const db = new MessengerDB();

let defineData = [];
let defineVars = [];
let defineVarsMap = {};
let isHasTitle = false;
const letters = [];
let excelPath = "";
let form = {};

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

  data.forEach((col) => {
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
  return verifyConnection(option);
});

ipcMain.handle("setForm", (event, data) => {
  console.log("setform", data);
  form = JSON.parse(data);
});

ipcMain.handle("getForm", (event) => {
  console.log("getForm", form);
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
    console.log("Write file:", file);
    shell.openPath(file);
    fs.writeFileSync(file, buffer);
    return ast;
  });
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
      const [pickRow, pickColumn] = defineVarsMap[key].value.split(":");
      const value = rowData[pickColumn];
      varsData[key] = value;
    });

    const letter = {
      id: uuid(),
      to,
      cc: replaceVar(rowData, form.cc),
      subject: replaceVar(rowData, form.title),
      html: replaceVar(rowData, form.html),
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
  return letters;
});

ipcMain.handle("sendByIds", (event, ids) => {
  const list = letters.filter((item) => ids.includes(item.id));
  sendMailForList(list, form.contentAsDocx);
});

ipcMain.handle("getLogin", async (event) => {
  const list = await db.getLogin();
  return list;
});

ipcMain.handle("dbTest", (event, data) => {
  dbTest();
});
