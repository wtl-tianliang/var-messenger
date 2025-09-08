import * as path from "path";
import sqlite3 from "@journeyapps/sqlcipher";
import { getDeviceId } from "../../utils";
import { app } from "electron";
import { Sequelize } from "sequelize";
import initHistoryTable from "./tables/LoginHistory";
import loginMigrate from "./migrate/loginMigrate";
export * from "./tables/LoginHistory";

const dbPath = path.join(app.getPath("userData"), "database.db");

const sequelize = new Sequelize({
  dialect: "sqlite",
  dialectModule: sqlite3,
  storage: dbPath,
  logging: false,
  password: getDeviceId(),
});

/**
 * init database
 */
export async function initDB() {
  const query = sequelize.getQueryInterface();
  const loginTableExits = await query.tableExists("login");
  if (loginTableExits) {
    await loginMigrate(sequelize);
  }
  await initHistoryTable(sequelize);
}
