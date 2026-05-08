'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('farmer_members', { 
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

        mobileNumber: {
          type:Sequelize.STRING,
          allowNull:false,
        },
        pan:{
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
        noOfShareAlloted:{
          type:Sequelize.DECIMAL(10,2),
          allowNull:true,
        },
        shareConstribution:{
          type:Sequelize.DECIMAL(10,2),
          allowNull:true,
        },

        folioNumber:{
          type:Sequelize.STRING,
          allowNull:true,
        },
        shareholding:{
          type:Sequelize.DECIMAL(10,2),
          allowNull:true,
        },
        landHolding:{
          type:Sequelize.DECIMAL(10,2),
          allowNull:true,
        },
        landRecordNumber:{
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
    await queryInterface.dropTable('farmer_members');

  }
};
