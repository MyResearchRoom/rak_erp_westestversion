"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CompanyDocuments extends Model {
    static associate(models) {
      CompanyDocuments.belongsTo(models.CompanyDetails, {
        foreignKey: "companyDetailId",
        as: "CompanyDetail",
      });
      CompanyDocuments.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "CompanyData",
      });
    }
  }

  CompanyDocuments.init(
    {
        companyDetailId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        companyId:{
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        docName:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        doc:{
            type: DataTypes.BLOB("long"),
            allowNull:false,
        },
        docContentType:{
            type: DataTypes.STRING,
            allowNull: false,
        }

    },
    {
      sequelize,
      modelName: "CompanyDocuments",
      tableName: "company_documents",
      timestamps: true,
    }
  );

  return CompanyDocuments;
};
