import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const SettingSchema = sequelize.db.define(
  "settings",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Automatically gets converted to SERIAL for postgres
    },
    key: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  },
  {
    tableName: "settings",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
)
sequelize.db
  .sync({ force: false })
  .then(function (data: any) {
    // console.log('Setting DB', data)
  })
  .then(function (jane: any) {
    // console.log('Setting jane', jane)
  })

export default SettingSchema
