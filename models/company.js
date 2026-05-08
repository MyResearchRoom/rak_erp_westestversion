"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
     Company.belongsTo(models.User, {
        foreignKey: "assignEmployee",
        as: "assignEmployeeData",
      });

      Company.hasMany(models.FarmerMembers, {
        foreignKey: "companyId",
        as: "farmerMembers",
      })

      Company.hasMany(models.BoardOfDirectors, {
        foreignKey: "companyId",
        as: "boardOfDirectors",
      })

      Company.hasOne(models.CompanyDetails, {
        foreignKey: "companyId",
        as: "details",
      });

      Company.hasMany(models.Invoices, {
        foreignKey: "companyId",
        as: "invoices",
      })

      Company.hasMany(models.Receipts, {
        foreignKey: "companyId",
        as: "receipts",
      })

      Company.hasMany(models.Expenses, {
        foreignKey: "companyId",
        as: "expenses",
      })

      Company.hasMany(models.ComplianceDocuments, {
        foreignKey: "companyId",
        as: "complianceDocuments",
      })

      Company.hasMany(models.CompanyBankAccounts, {
        foreignKey: "companyId",
        as: "bankAccounts",
      })
    }
  }

  Company.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gstin:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      pan:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyType:{
        type: DataTypes.STRING,
        allowNull:false,
      },

      balence :{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },
      
      address:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      city:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      state:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      pincode:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactPerson:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      connectedDate:{
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status:{
        type: DataTypes.ENUM(
          "pending",
          "active",
          "inactive",
        ),
        allowNull:false,
        defaultValue:"pending",
      },
      assignEmployee:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      logo:{
        type: DataTypes.BLOB("long"),
        allowNull:true,
      },
      logoContentType:{
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: "Company",
      tableName: "companies",
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
    }
  );

  return Company;
};
