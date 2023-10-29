import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const NftSchema = sequelize.db.define(
  "nfts",
  {
    mintAddress: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: true,
      unique: true
    },
    walletAddress: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tokenAccount: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    nftId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    collectionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    image: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sellerFeeBasisPoints: {
      type: Sequelize.INTEGER,
    },
    attributes: {
      type: Sequelize.JSONB,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // 1 : listed, 2: unlisted, 3: sold
    },
  },
  {
    tableName: "nfts",
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

export default NftSchema
