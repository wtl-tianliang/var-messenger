import { app } from "electron";
import path from "path";
import fs from "fs";

function getDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  return `${year}-${month}-${date}`;
}

export const logPath = path.join(app.getPath("userData"), "logs");

if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath);
}

const stream = fs.createWriteStream(path.join(logPath, `${getDate()}.log`), {
  encoding: "utf-8",
  flags: "a", // 追加日志
});

export function logger(name, content) {
  const now = new Date();
  const log = { name, time: now.toLocaleString(), log: content };
  stream.write(JSON.stringify(log) + "\n");
}
