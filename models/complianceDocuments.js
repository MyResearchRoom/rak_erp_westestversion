"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ComplianceDocuments extends Model {
    static associate(models) {
      ComplianceDocuments.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "CompanyData",
      });
    }
  }

  ComplianceDocuments.init(
    {
        companyId:{
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        docName:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        docNumber:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        financialYear:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        issueAuthority:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        issueDate:{
            type:DataTypes.DATEONLY,
            allowNull:true,
        },
        expiryDate:{
            type:DataTypes.DATEONLY,
            allowNull:true,
        },
        note:{
            type:DataTypes.STRING,
            allowNull:true,
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
      modelName: "ComplianceDocuments",
      tableName: "compliance_documents",
      timestamps: true,
    }
  );

  return ComplianceDocuments;
};
