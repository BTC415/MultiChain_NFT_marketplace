import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const ActivitySchema = sequelize.db.define(
  "activity",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Automatically gets converted to SERIAL for postgres
    },
    collectionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    nftId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    mintAddress: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    image: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    from: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    to: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    signature: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false,
    }
  },
  {
    tableName: "activity",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
)
sequelize.db
  .sync({ force: false })
  .then(function (data: any) { })
  .then(function (jane: any) { })

export default ActivitySchema
