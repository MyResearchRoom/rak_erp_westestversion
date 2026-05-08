"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Invoices extends Model {
    static associate(models) {
        Invoices.belongsTo(models.Company, {
            foreignKey: "companyId",
            as: "company",
        });
        Invoices.hasMany(models.InvoiceItems, {
            foreignKey: "invoiceId",
            as: "invoiceItems",
        });

        Invoices.hasMany(models.Receipts, {
            foreignKey: "invoiceId",
            as: "invoiceReceipts",
        });
        Invoices.hasMany(models.InvoiceCustomerDetails, {
            foreignKey: "invoiceId",
            as: "customer",
        });
      
    }
  }

  Invoices.init(
    {
      invoiceNumber: {
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
      },

      companyId: {
        type:DataTypes.INTEGER,
        allowNull:false,
      },

      invoiceDate :{
        type: DataTypes.DATEONLY,
        allowNull:false,
      },

      overDueDate :{
        type: DataTypes.DATEONLY,
        allowNull:false,
      },
 
      subTotal: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },

      totalCGSTPercent: {
        type:DataTypes.DECIMAL(5,2),
        allowNull:false,
        defaultValue: 0
      },

      totalSGSTPercent: {
        type:DataTypes.DECIMAL(5,2),
        allowNull:false,
        defaultValue: 0
      },
     
      totalGSTAmount: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue:0,
      },

      totalAmount: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue:0,
      },

      totalPaid: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue:0,
      },

      totalRemaining: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue:0,
      },

      status :{
        type: DataTypes.ENUM(
            "paid","partially paid","pending"
        ),
        allowNull:false,
        defaultValue:"pending",
      }

    },
    {
      sequelize,
      modelName: "Invoices",
      tableName: "invoices",
      timestamps: true,
    }
  );

  return Invoices;
};
