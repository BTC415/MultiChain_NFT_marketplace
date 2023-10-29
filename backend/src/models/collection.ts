import DB from "../utils/db"
import Sequelize from "sequelize"
const sequelize = new DB()

const CollectionSchema = sequelize.db.define(
  "collections",
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
    symbol: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    nftName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    initialMintPrice: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      unique: false,
      default: 0
    },
    creators: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    // attributes: {
    //   type: Sequelize.JSONB,
    // },
    totalSupply: {
      type: Sequelize.INTEGER,
    },
    launchDate: {
      type: Sequelize.DATE,
    },
    description: {
      type: Sequelize.TEXT,
    },
    baseImage: {
      type: Sequelize.STRING,
    },
    twitterLink: {
      type: Sequelize.STRING,
    },
    discordLink: {
      type: Sequelize.STRING,
    },
    websiteLink: {
      type: Sequelize.STRING,
    },
    isNew: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isUpcoming: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isPopular: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isDraft: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    isFeatured: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    chain: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    contract: {
      type: Sequelize.STRING,
      allowNull: true
    },
    attributes: {
      type: Sequelize.JSONB,
      allowNull: true
    },
    status: {
      type: Sequelize.INTEGER, //0: pending, 1: approved 2: rejected, 3: deleted
      defaultValue: 0,
      allowNull: false,
    }
  },
  {
    tableName: "collections",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
)
sequelize.db
  .sync({ force: false })
  .then(function (data: any) { })
  .then(function (jane: any) { })

export default CollectionSchema