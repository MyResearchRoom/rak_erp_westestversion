"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CompanyBankAccounts extends Model {
    static associate(models) {
      CompanyBankAccounts.belongsTo(models.CompanyDetails, {
        foreignKey: "companyDetailId",
        as: "companyDetail",
      });
      CompanyBankAccounts.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
    }
  }

  CompanyBankAccounts.init(
    {
      companyDetailId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ifscCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountOpeningDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CompanyBankAccounts",
      tableName: "company_bank_accounts",
      timestamps: true,
    }
  );

  return CompanyBankAccounts;
};
