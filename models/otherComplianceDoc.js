"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class OtherComplianceDocuments extends Model {
        static associate(models) {
            OtherComplianceDocuments.belongsTo(
                models.Company,
                {
                    foreignKey: "companyId",
                    as: "CompanyData",
                }
            );
        }
    }

    OtherComplianceDocuments.init(
    {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        docName: {
            type: DataTypes.STRING,
            allowNull: false,
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
        modelName: "OtherComplianceDocuments",
        tableName: "other_compliance_documents",
        timestamps: true,
    });

    return OtherComplianceDocuments;
};
