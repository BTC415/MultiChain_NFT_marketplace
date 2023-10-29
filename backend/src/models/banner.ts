import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const BannerSchema = sequelize.db.define(
  "banners",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Automatically gets converted to SERIAL for postgres
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    actionName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    actionLink: {
      type: Sequelize.STRING,
      allowNull: false
    },
    baseImage: {
      type: Sequelize.STRING,
    },
    bannerImage: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1, // 1: Default, 2 // Deleted
      allowNull: false,
    }
  },
  {
    tableName: "banners",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
)
sequelize.db
  .sync({ force: false })
  .then(function (data: any) {
  })
  .then(function (jane: any) {
  })

export default BannerSchema
