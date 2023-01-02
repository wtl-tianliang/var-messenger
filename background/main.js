/* eslint-disable no-unused-vars */

import { ipcMain } from "electron";
import { sendMailForList, verifyConnection } from "./src/mailer";
import { parseExcel } from "./src/excel";
import { v4 as uuid } from 'uuid'
import MAIL_STATUS from "../MAIL_STATUS.js"

let defineData = [];
let defineVars = [];
let defineVarsMap = {};
let isHasTitle = false;
const letters = [];
let excelPath = ''

ipcMain.handle("setHasTitle", (event, data) => {
  isHasTitle = data
})

ipcMain.handle("getHasTitle", () => {
  return isHasTitle
})

ipcMain.handle("parse-excel", (event, file) => {
  excelPath = file
  const data = parseExcel(file);
  defineData = data;
  return data;
});

ipcMain.handle("verifyConnection", (event, option) => {
  return verifyConnection(option);
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

ipcMain.handle('getExcelPath', () => {
  return excelPath
})

ipcMain.handle("getData", (event) => {
  return defineData;
});

ipcMain.handle("generateMail", (event, data) => {
  const form = JSON.parse(data);
  // 构建收件人列表
  letters.length = 0

  const replaceVar = (rowData, template) => {
    const vars = template.match(/`[^`]+`/g);
    if (vars) {
      vars.forEach((varText) => {
        let [pickRow, pickColumn] = defineVarsMap[varText].value.split(":");
        const isColumn = Number(pickRow) === -1;
        if (isHasTitle) {
          pickRow = Number(pickRow) + 1
        }
        const realValue = isColumn
          ? rowData[pickColumn]
          : defineData[pickRow][pickColumn];
        template = template.replace(new RegExp(varText, "gim"), realValue);
      });
    }
    return template;
  };

  defineData.forEach((rowData, rowIndex) => {
    if (isHasTitle && rowIndex === 0) {
      return
    }
    const letter = {
      id: uuid(),
      subject: replaceVar(rowData, form.title),
      to: replaceVar(rowData, form.to),
      cc: replaceVar(rowData, form.cc),
      html: replaceVar(rowData, form.html),
      status: MAIL_STATUS.MAIL_STATUS_READY,
      files: [replaceVar(rowData, form.filePath)],
    };
    letters.push(letter);
  });
  return letters
});

ipcMain.handle("getLetters", () => {
  return letters
})

ipcMain.handle("sendByIds", (event, ids) => {
  const list = letters.filter(item => ids.includes(item.id))
  sendMailForList(list)
});
