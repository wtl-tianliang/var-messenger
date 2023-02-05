import sqlite3 from '@journeyapps/sqlcipher'
import { open } from 'sqlite'
import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

export default class MessengerDB {
  constructor () {
    this.db = null
  }

  async openDB () {
    const dbPath = isDevelopment ? path.join(__dirname, 'database.db') : path.join(__dirname, '../database.db')
    const db = await open({ filename: dbPath, driver: sqlite3.Database })
  
    // 数据库加密
    // https://github.com/journeyapps/node-sqlcipher
    db.run("PRAGMA cipher_compatibility = 4");
    db.run("PRAGMA key = 'wwwszsxcn'");

    return db
  }

  async closeDB() {
    if (this.db) {
      await this.db.close()
    }
  }

  async initDatabase() {
    const db = await this.openDB()
    await db.exec('CREATE TABLE login (id INTEGER PRIMARY KEY AUTOINCREMENT, smtp varchar(255), smtp_port int, username varchar(255), password varchar(255), use_secure int, is_drop int)')
    await db.close()
  }

  async insertLogin(smtp, smtp_port, username, password, use_secure = 0) {
    const db = await this.openDB()
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

  async getLogin(offset = 0, limit) {
    const db = await this.openDB()
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

}
