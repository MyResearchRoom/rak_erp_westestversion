'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('company_details', { 
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        companyId:{
          type:Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'companies', 
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },

        fpoUniqueCode:{
            type: Sequelize.STRING,
            allowNull:false,
        },


        dateOfStartActivities: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        nameApprovalDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        moaAoAPrepDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        registrationDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        incorporationDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        cinNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        panNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        tanNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        gstApplicationDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        gstNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        gstCertificateIssueDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },


        bankName: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        accountNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        ifscCode: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        accountOpeningDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        inc20aSubmission: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        firstAgmConducted: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        stationeryPrepared: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        caAuditorName: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        caContactNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        caEmail: {
            type: Sequelize.STRING,
            allowNull:true,
        },

        ceoName: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        ceoContact: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        ceoEmail: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        ceoAppointmentDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        accountantName: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        accountantContact: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        accountantEmail: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        accountantAppointmentDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },


        totalShareholderFarmers: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        totalLandholdingAcres: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        maleMembers: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        femaleMembers: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        marginalFarmers: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        smallFarmers: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        semiMediumFarmers: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        mediumFarmers: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        largeFarmers: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },


        uthorizedShareCapital: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        totalShareCapitalRaised: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },
        totalPaidUpCapital: {
            type: Sequelize.INTEGER,
            allowNull:true,
        },


        shopLocation: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        tehsil: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        district: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        shopPincode: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        areaOfShopSqFt: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        distanceFromCompetitionKm: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        latitude: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        longitude: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        

        seedLicenseNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        seedValidity: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        fertilizerValidity: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        fertilizerLicenseNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        pesticideLicenseNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        mandiLicenseNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        pesticideValidity: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        mandiValidity: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },
        udyamAadhaarNumber: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        udyamIssueDate: {
            type: Sequelize.DATEONLY,
            allowNull:true,
        },


        mandiName: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        mandiLocation: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        mandiDistrict: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        mandiLatitude: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        mandiLongitude: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        purchaseCentreLocation: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        purchaseCentreAreaSqFt: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        purchaseCentreDistanceFromMandiKm: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        warehouseLocation: {
            type: Sequelize.STRING,
            allowNull:true,
        },
        warehouseAreaSqFt: {
            type: Sequelize.STRING,
            allowNull:true,
        },

        digitalMoistureMeter: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        hlMeter: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        bambooSampler: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        weighingScale100kg: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        weighingScale500g: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        otherEquipment: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },


        laptopDesktopAvailable: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        internetConnectivity: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        printerAvailable: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },


        businessPlanPrepared: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },
        vendorRegistered: {
            type: Sequelize.BOOLEAN,
            allowNull:true,
        },

        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },

        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },


    });
    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('company_details');
  }
};
