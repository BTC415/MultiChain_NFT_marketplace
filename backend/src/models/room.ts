import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const RoomSchema = sequelize.db.define(
  "room",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Automatically gets converted to SERIAL for postgres
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    users: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastMsg: {
      type: Sequelize.STRING,
      allowNull: true,
    }
  },
  {
    tableName: "room",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
)
sequelize.db
  .sync({ force: false })
  .then(function (data: any) { })
  .then(function (jane: any) { })

export default RoomSchema
