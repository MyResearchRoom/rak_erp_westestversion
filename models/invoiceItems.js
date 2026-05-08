"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InvoiceItems extends Model {
    static associate(models) {
        InvoiceItems.belongsTo(models.Invoices, {
            foreignKey: "invoiceId",
            as: "invoice",
        });
        InvoiceItems.belongsTo(models.Materials, {
            foreignKey: "materialId",
            as: "material",
        });
      
    }
  }

  InvoiceItems.init(
    {
      invoiceId: {
        type:DataTypes.INTEGER,
        allowNull:false,
      },

      materialId: {
        type:DataTypes.INTEGER,
        allowNull:false,
      },
 
      quantity: {
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue: 0
      },

      rate: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },

      subTotal: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },
     
      cgstPercent: {
        type:DataTypes.DECIMAL(5,2),
        allowNull:false,
        defaultValue:0,
      },

      sgstPercent: {
        type:DataTypes.DECIMAL(5,2),
        allowNull:false,
        defaultValue:0,
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

    },
    {
      sequelize,
      modelName: "InvoiceItems",
      tableName: "invoice_items",
      timestamps: true,
    }
  );

  return InvoiceItems;
};
