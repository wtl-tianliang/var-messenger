import { Model, INTEGER, STRING } from "sequelize";
import type { Sequelize as SequelizeType } from "sequelize/types";

class Login extends Model {}

export default async function initTable(sequelize: SequelizeType) {
  Login.init(
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      smtp: {
        type: STRING,
        allowNull: false,
      },
      smtp_port: {
        type: INTEGER,
        allowNull: false,
      },
      username: {
        type: STRING,
        allowNull: false,
      },
      password: {
        type: STRING,
        allowNull: false,
      },
      use_secure: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      is_drop: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "Login",
    }
  );
  await sequelize.sync();
}

/**
 * inset a login history
 * @param {string} smtp smtp server address
 * @param {string} smtp_port smtp server port
 * @param {string} username smtp server login username
 * @param {string} password smtp server login password
 * @param {number} use_secure enable secure login, 0 is false, 1 is true, default is 0
 * @returns
 */
export async function insertLogin(
  smtp,
  smtp_port,
  username,
  password,
  use_secure = 0
) {
  const login = await Login.create({
    smtp,
    smtp_port,
    username,
    password,
    use_secure,
    is_drop: 0,
  });
  return login;
}

/**
 * read login histories list
 * @param {number} offset skip item number
 * @param {number} limit return number
 * @returns histories list
 */
export async function getLogin(offset = 0, limit = 10) {
  const res = await Login.findAll({ offset, limit, where: { is_drop: 0 } });
  const list = res.map((item) => item.toJSON());
  return list;
}

export async function removeLogin(id) {
  const res = await Login.update({ is_drop: 1 }, { where: { id } });
  return res;
}
