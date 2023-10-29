import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const BidSchema = sequelize.db.define(
  "bids",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Automatically gets converted to SERIAL for postgres
    },
    collectionId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    nftId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    image: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    walletAddress: {
      type: Sequelize.STRING,
      allowNull: false
    },
    mintAddress: {
      type: Sequelize.STRING,
      allowNull: true
    },
    offerPrice: {
      type: Sequelize.FLOAT,
      allowNull: false,
      min: 0
    },
    currentPrice: {
      type: Sequelize.FLOAT,
      allowNull: false,
      min: 0
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1, // 1: Pending, 2: Offer Accepted, 0: Cancel Bid
      allowNull: false
    }
  },
  {
    tableName: "bids",
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

export default BidSchema
