"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Materials extends Model {
    static associate(models) {
      Materials.hasMany(models.InvoiceItems, {
        foreignKey: "materialId",
        as: "invoice",
      });
    }
  }

  Materials.init(
    {
      itemName: {
        type:DataTypes.STRING,
        allowNull:false,
      },

      hsnCode: {
        type:DataTypes.STRING,
        allowNull:false,
      },

      unit: {
        type:DataTypes.STRING,
        allowNull:false,
      },
   
      gstRate: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
      },
     
      price: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
      },

    },
    {
      sequelize,
      modelName: "Materials",
      tableName: "materials",
      timestamps: true,
    }
  );

  return Materials;
};
