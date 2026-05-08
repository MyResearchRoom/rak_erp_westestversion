'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.createTable('board_of_directors', {
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

        role: {
          type:Sequelize.ENUM("director","chairman"),
          allowNull:false,
        },
        holdingSince: {
          type:Sequelize.DATEONLY,
          allowNull:true,
        },
        fullName: {
          type:Sequelize.STRING,
          allowNull:false,
        },
        age: {
          type:Sequelize.INTEGER,
          allowNull:true,
        },

        gender: {
          type:Sequelize.ENUM("male","female","other"),
          allowNull:true,
        },
        category: {
          type:Sequelize.ENUM("general","obc","sc","st"),
          allowNull:true,
        },
        qualification: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        background: {
          type:Sequelize.BOOLEAN,
          allowNull:true,
        },

        mobile: {
          type:Sequelize.STRING,
          allowNull:false,
        },
        email: {
          type:Sequelize.STRING,
          allowNull:false,
        },
        skill: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        dsc: {
          type:Sequelize.BOOLEAN,
          allowNull:true,
        },

        dinIssued: {
          type:Sequelize.BOOLEAN,
          allowNull:true,
        },
        dinNumber: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        farmerCert: {
          type:Sequelize.BOOLEAN,
          allowNull:true,
        },
        isSanchalak:{
          type:Sequelize.BOOLEAN,
          allowNull:true,
        },

        folioNumber:{
          type:Sequelize.STRING,
          allowNull:true,
        },
        pan: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        aadhaar: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        shareDate: {
          type:Sequelize.DATEONLY,
          allowNull:true,
        },

        faceValue: {
          type:Sequelize.DECIMAL(10,2),
          allowNull:true,
        },
        shares: {
          type:Sequelize.DECIMAL(10,2),
          allowNull:true,
        },

        capital: {
          type:Sequelize.DECIMAL(10,2),
          allowNull:true,
        },
        shareholding: {
          type:Sequelize.DECIMAL(10,2),
          allowNull:true,
        },
        land: {
          type:Sequelize.DECIMAL(10,2),
          allowNull:true,
        },
        landRecord: {
          type:Sequelize.STRING,
          allowNull:true,
        },

        village: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        block: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        tehsil: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        district: {
          type:Sequelize.STRING,
          allowNull:true,
        },

        state: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        pincode: {
          type:Sequelize.STRING,
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
    await queryInterface.dropTable('board_of_directors');
  }
};
