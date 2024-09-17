import fs from "fs";
import path from "path";
import { app } from "electron";
import { Sequelize } from "sequelize";
import initLoginTable from "../tables/LoginTable";
import initHistoryTable from "../tables/LoginHistory";
import { insertLoginHistory, getAllHistories } from "../tables/LoginHistory";

export default async function loginMigrate(sequelize: Sequelize) {
  const dbPath = path.join(app.getPath("userData"), "database.db");
  const backupPath = path.join(app.getPath("userData"), "database.db.bak");
  fs.copyFileSync(dbPath, backupPath);
  const LoginTable = await initLoginTable(sequelize); // old version login table
  const all = await LoginTable.findAll();
  const list = all.map((item) => item.toJSON());
  await initHistoryTable(sequelize, true); // new version login history table
  const tasks = list.map((item) => {
    const use_secure = item.use_secure === 1;
    const iampPort = use_secure ? 993 : 143;
    return insertLoginHistory(
      item.smtp,
      item.smtp_port,
      item.username,
      item.password,
      item.use_secure,
      "",
      iampPort,
      item.username,
      item.password,
      item.use_secure,
      item.is_drop
    );
  });
  await Promise.all(tasks);
  const histories = await getAllHistories();
  if (histories.length === list.length) {
    await LoginTable.drop();
    console.log("migrate success");
  } else {
    throw new Error("migrate failed");
  }
}
