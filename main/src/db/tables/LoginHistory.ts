import { Model, INTEGER, STRING } from "sequelize";
import type { Sequelize } from "sequelize/types";

class LoginHistory extends Model {}

export default async function initTable(sequelize: Sequelize, force = false) {
  LoginHistory.init(
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      smtp_url: {
        type: STRING,
        allowNull: false,
      },
      smtp_port: {
        type: INTEGER,
        allowNull: false,
      },
      smtp_user: {
        type: STRING,
        allowNull: false,
      },
      smtp_password: {
        type: STRING,
        allowNull: false,
      },
      smtp_secure: {
        type: INTEGER,
        defaultValue: 1,
      },
      iamp_url: {
        type: STRING,
        allowNull: false,
      },
      iamp_port: {
        type: INTEGER,
        allowNull: false,
      },
      iamp_user: {
        type: STRING,
        allowNull: false,
      },
      iamp_password: {
        type: STRING,
        allowNull: false,
      },
      iamp_secure: {
        type: INTEGER,
        defaultValue: 1,
      },
      is_drop: {
        type: INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "login_history",
      timestamps: false,
    }
  );
  await LoginHistory.sync({ force }); // force: true will drop the table if it already exists
  return LoginHistory;
}

export async function insertLoginHistory(
  smtp_url: string,
  smtp_port: number,
  smtp_user: string,
  smtp_password: string,
  smtp_secure: number,
  iamp_url: string,
  iamp_port: number,
  iamp_user: string,
  iamp_password: string,
  iamp_secure: number,
  is_drop: number = 0
) {
  const res = await LoginHistory.create({
    smtp_url,
    smtp_port,
    smtp_user,
    smtp_password,
    smtp_secure,
    iamp_url,
    iamp_port,
    iamp_user,
    iamp_password,
    iamp_secure,
    is_drop,
  });
  return res.toJSON();
}

export async function insertLogin(
  smtp_url: string,
  smtp_port: number,
  smtp_user: string,
  smtp_password: string,
  smtp_secure: number,
  iamp_url: string = "",
  iamp_port: number = 0,
  iamp_user: string = "",
  iamp_password: string = "",
  iamp_secure: number = 1
) {
  const res = await LoginHistory.create({
    smtp_url,
    smtp_port,
    smtp_user,
    smtp_password,
    smtp_secure,
    iamp_url,
    iamp_port,
    iamp_user,
    iamp_password,
    iamp_secure,
    is_drop: 0,
  });
  return res.toJSON();
}

export async function getLoginHistories(offset = 0, limit = 10) {
  const res = await LoginHistory.findAll({
    offset,
    limit,
    where: {
      is_drop: 0,
    },
    order: [["id", "DESC"]],
  });
  const list = res.map((item) => item.toJSON());
  return list;
}

export async function getAllHistories() {
  const res = await LoginHistory.findAll();
  const list = res.map((item) => item.toJSON());
  return list;
}

export async function deleteLoginHistory(id: number) {
  const res = await LoginHistory.update({ is_drop: 1 }, { where: { id } });
  return res;
}
