"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InvoiceCustomerDetails extends Model {
    static associate(models) {
        InvoiceCustomerDetails.belongsTo(models.Invoices, {
            foreignKey: "invoiceId",
            as: "invoice",
        });
      
    }
  }

  InvoiceCustomerDetails.init(
    {
      invoiceId: {
        type:DataTypes.INTEGER,
        allowNull:false,
      },
      name: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      email: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      phone: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      gstin: {
        type:DataTypes.STRING,
        allowNull:true,
      },
      pan: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      address: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      state: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      city: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      pincode: {
        type:DataTypes.STRING,
        allowNull:false,
      },

    },
    {
      sequelize,
      modelName: "InvoiceCustomerDetails",
      tableName: "invoice_customer_details",
      timestamps: true,
    }
  );

  return InvoiceCustomerDetails;
};
