"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CompanyDetails extends Model {
    static associate(models) {
        CompanyDetails.belongsTo(models.Company, {
            foreignKey: "companyId",
            as: "companyData",
        });
        CompanyDetails.hasMany(models.CompanyDocuments, {
            foreignKey: "companyDetailId",
            as: "companyDocuments",
        });
        CompanyDetails.hasMany(models.CompanyBankAccounts, {
            foreignKey: "companyDetailId",
            as: "bankAccounts",
        });
    }
  }

  CompanyDetails.init(
    {
        companyId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },


        fpoUniqueCode:{
            type: DataTypes.STRING,
            allowNull:false,
        },


        dateOfStartActivities: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        nameApprovalDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        moaAoAPrepDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        registrationDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        incorporationDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        cinNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        panNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        tanNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        gstApplicationDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        gstNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        gstCertificateIssueDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },


        bankName: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        ifscCode: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        accountOpeningDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        inc20aSubmission: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        firstAgmConducted: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        stationeryPrepared: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        caAuditorName: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        caContactNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        caEmail: {
            type: DataTypes.STRING,
            allowNull:true,
        },

        ceoName: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        ceoContact: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        ceoEmail: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        ceoAppointmentDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        accountantName: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        accountantContact: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        accountantEmail: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        accountantAppointmentDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },


        totalShareholderFarmers: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        totalLandholdingAcres: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        maleMembers: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        femaleMembers: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        marginalFarmers: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        smallFarmers: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        semiMediumFarmers: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        mediumFarmers: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        largeFarmers: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },


        uthorizedShareCapital: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        totalShareCapitalRaised: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },
        totalPaidUpCapital: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },


        shopLocation: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        tehsil: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        district: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        shopPincode: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        areaOfShopSqFt: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        distanceFromCompetitionKm: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        latitude: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        longitude: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        

        seedLicenseNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        seedValidity: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        fertilizerValidity: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        fertilizerLicenseNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        pesticideLicenseNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        mandiLicenseNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        pesticideValidity: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        mandiValidity: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },
        udyamAadhaarNumber: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        udyamIssueDate: {
            type: DataTypes.DATEONLY,
            allowNull:true,
        },



        mandiName: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        mandiLocation: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        mandiDistrict: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        mandiLatitude: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        mandiLongitude: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        purchaseCentreLocation: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        purchaseCentreAreaSqFt: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        purchaseCentreDistanceFromMandiKm: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        warehouseLocation: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        warehouseAreaSqFt: {
            type: DataTypes.STRING,
            allowNull:true,
        },

        digitalMoistureMeter: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        hlMeter: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        bambooSampler: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        weighingScale100kg: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        weighingScale500g: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        otherEquipment: {
            type: DataTypes.STRING,
            allowNull:true,
        },

        laptopDesktopAvailable: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        internetConnectivity: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        printerAvailable: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },


        businessPlanPrepared: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },
        vendorRegistered: {
            type: DataTypes.BOOLEAN,
            allowNull:true,
        },




    },
    {
      sequelize,
      modelName: "CompanyDetails",
      tableName: "company_details",
      timestamps: true,
    }
  );

  return CompanyDetails;
};
