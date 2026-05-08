"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BoardOfDirectors extends Model {
    static associate(models) {
      BoardOfDirectors.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "companyData",
      });
      
    }
  }

  BoardOfDirectors.init(
    {
      companyId:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type:DataTypes.ENUM("director","chairman"),
        allowNull:false,
      },
      holdingSince: {
        type:DataTypes.DATEONLY,
        allowNull:true,
      },
      fullName: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      age: {
        type:DataTypes.INTEGER,
        allowNull:true,
      },

      gender: {
        type:DataTypes.ENUM("male","female","other"),
        allowNull:true,
      },
      category: {
        type:DataTypes.ENUM("general","obc","sc","st"),
        allowNull:true,
      },
      qualification: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      background: {
        type:DataTypes.BOOLEAN,
        allowNull:true,
      },

      mobile: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      email: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      skill: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      // dsc: {
      //   type:DataTypes.BOOLEAN,
      //   allowNull:true,
      // },

      // dinIssued: {
      //   type:DataTypes.BOOLEAN,
      //   allowNull:true,
      // },
      dinNumber: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      farmerCert: {
        type:DataTypes.BOOLEAN,
        allowNull:true,
      },
      isSanchalak:{
        type:DataTypes.BOOLEAN,
        allowNull:true,
      },

      folioNumber:{
        type:DataTypes.STRING,
        allowNull:true,
      },
      pan: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      aadhaar: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      shareDate: {
        type:DataTypes.DATEONLY,
        allowNull:true,
      },

      faceValue: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:true,
      },
      shares: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:true,
      },

      capital: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:true,
      },
      shareholding: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:true,
      },
      land: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:true,
      },
      landRecord: {
        type:DataTypes.STRING,
        allowNull:true,
      },

      village: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      block: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      tehsil: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      district: {
        type:DataTypes.STRING,
        allowNull:true,
      },

      state: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      pincode: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      kycDocument: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      kycDocumentContentType: {
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
      panCard: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      panCardContentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankStatement: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      bankStatementContentType: {
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


    },
    {
      sequelize,
      modelName: "BoardOfDirectors",
      tableName: "board_of_directors",
      timestamps: true,
    }
  );

  return BoardOfDirectors;
};
