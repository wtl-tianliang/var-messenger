import * as path from "path";
import sqlite3 from "@journeyapps/sqlcipher";
import { getDeviceId } from "../../utils";
import { app } from "electron";
import { Sequelize } from "sequelize";
import initLoginTable from "./tables/LoginTable";
export * from "./tables/LoginTable"

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
  await initLoginTable(sequelize);
}
