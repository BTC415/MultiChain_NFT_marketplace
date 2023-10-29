import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const UserSchema = sequelize.db.define(
  "user",
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
  },
  {
    tableName: "user",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
)
sequelize.db
  .sync({ force: false })
  .then(function (data: any) { })
  .then(function (jane: any) { })

export default UserSchema
