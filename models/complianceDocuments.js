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
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      docName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      financialYear: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      doc: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },

      docContentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ComplianceDocuments",
      tableName: "compliance_documents",
      timestamps: true,

      indexes: [{ fields: ["companyId", "docName"] }],
    }
  );

  return ComplianceDocuments;
};
