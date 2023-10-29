import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const HashListSchema = sequelize.db.define(
  "hashlists",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Automatically gets converted to SERIAL for postgres
    },
    collectionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    },
    nftName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    hashlist: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    }
  },
  {
    tableName: "hashlists",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
)
sequelize.db
  .sync({ force: false })
  .then(function (data: any) { })
  .then(function (jane: any) { })

export default HashListSchema
