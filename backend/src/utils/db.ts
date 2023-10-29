import { PG_HOST, PG_USER, PG_DATABASE, PG_PASSWORD, PG_PORT } from "../config"
import { Sequelize } from "sequelize"

export default class DB {
  public db: any
  constructor() {
    try {
      const sequelize = new Sequelize(PG_DATABASE, PG_USER, PG_PASSWORD, {
        host: PG_HOST,
        dialect: "postgres",
        pool: { max: 5, min: 0, idle: 1000 },
        logging: false,
        port: PG_PORT,
      })
      this.db = sequelize
    } catch (err) {
      console.log('err-->', err)
      process.exit()
    }
  }
}
