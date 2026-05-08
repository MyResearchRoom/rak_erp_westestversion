"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Receipts extends Model {
    static associate(models) {
        Receipts.belongsTo(models.Company, {
            foreignKey: "companyId",
            as: "company",
        });
        Receipts.belongsTo(models.Invoices, {
            foreignKey: "invoiceId",
            as: "invoice",
        });
      
    }
  }

  Receipts.init(
    {
      receiptNumber: {
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
      },

      companyId: {
        type:DataTypes.INTEGER,
        allowNull:false,
      },

      invoiceId: {
        type:DataTypes.INTEGER,
        allowNull:false,
      },

      amount: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },

      paymentDate :{
        type: DataTypes.DATEONLY,
        allowNull:false,
      },

      paymentMethod :{
        type: DataTypes.ENUM(
            "bank transfer","upi","cheque","cash","card"
        ),
        allowNull:false,
      },

      transactionReference: {
        type:DataTypes.STRING,
        allowNull:false,
      },

    },
    {
      sequelize,
      modelName: "Receipts",
      tableName: "receipts",
      timestamps: true,
    }
  );

  return Receipts;
};
