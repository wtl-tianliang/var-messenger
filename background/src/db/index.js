import fs from 'fs'
import path from 'path'
import sqlite3 from '@journeyapps/sqlcipher'
import { open } from 'sqlite'
import { getDeviceId } from '../../utils'
import { app } from 'electron'

const dbPath = path.join(app.getPath('userData'), 'database.db')

/**
 * init database
 */
export async function initDB() {
  if (fs.existsSync(dbPath)) {
    return;
  }
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.run("PRAGMA cipher_compatibility = 4");
  await db.run(`PRAGMA key = '${getDeviceId()}'`);

  // create user login history table
  await db.exec('CREATE TABLE login (id INTEGER PRIMARY KEY AUTOINCREMENT, smtp varchar(255), smtp_port int, username varchar(255), password varchar(255), use_secure int, is_drop int)')

  await db.close()
}

/**
 * open database connection
 * @returns database connection
 */
async function openDB () {
  const db = await open({ filename: dbPath, driver: sqlite3.Database })
  // database encryption
  // https://github.com/journeyapps/node-sqlcipher
  db.run("PRAGMA cipher_compatibility = 4");
  db.run(`PRAGMA key = '${getDeviceId()}'`);

  return db
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
export async function insertLogin (smtp, smtp_port, username, password, use_secure = 0) {
  const db = await openDB()
  const row = {
    ':smtp': smtp,
    ':smtp_port': smtp_port,
    ':username': username,
    ':password': password,
    ':use_secure': use_secure,
    ':is_drop': 0
  }
  const result = await db.run('INSERT INTO login (smtp, smtp_port, username, password, use_secure, is_drop) VALUES (:smtp, :smtp_port, :username, :password, :use_secure, :is_drop)', row)
  await db.close()

  return result
}

/**
 * read login histories list
 * @param {number} offset skip item number
 * @param {number} limit return number
 * @returns histories list
 */
export async function getLogin (offset = 0, limit) {
  const db = await openDB()
  let sql = ''
  if(limit && limit > 0) {
    sql = `SELECT * FROM login WHERE is_drop = 0 LIMIT ${limit} OFFSET ${offset}`
  } else {
    sql = `SELECT * FROM login WHERE is_drop = 0`
  }
  const list = await db.all(sql)
  await db.close()

  return list
}

export async function removeLogin(id) {
  const sql = `UPDATE login SET is_drop = 1 WHERE id = ${id}`
  const db = await openDB()
  await db.exec(sql)
  await db.close()
}

