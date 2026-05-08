"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FarmerMembers extends Model {
    static associate(models) {
      FarmerMembers.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "companyData",
      });

    }
  }

  FarmerMembers.init(
    {
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      category: {
        type: DataTypes.ENUM("general", "obc", "sc", "st"),
        allowNull: true,
      },

      qualification: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      aadhaar: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      shareDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      faceValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      noOfShareAlloted: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      shareConstribution: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      folioNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shareholding: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      landHolding: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      landRecordNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      village: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      block: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tehsil: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      district: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      aadhaarCard: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      aadhaarCardContentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sevenTwelve: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      sevenTwelveContentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      panCard: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      panCardContentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "FarmerMembers",
      tableName: "farmer_members",
      timestamps: true,
    }
  );

  return FarmerMembers;
};
