import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const WalletSchema = sequelize.db.define(
  "wallets",
  {
    walletAddress: {
      type: Sequelize.STRING,
      primaryKey: true,
      unique: true,
    },
    vault: {
      type: Sequelize.STRING,
      allowNull: false
    },
  },
  {
    tableName: "wallets",
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

export default WalletSchema
