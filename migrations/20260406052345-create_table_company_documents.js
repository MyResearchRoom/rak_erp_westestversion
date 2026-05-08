'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('company_documents', { 
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      companyDetailId:{
        type:Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'company_details', 
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      docName:{
        type:Sequelize.STRING,
        allowNull:false,
      },

      doc:{
        type: Sequelize.BLOB("long"),
        allowNull:false,
      },

      docContentType:{
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('company_documents');

  }
};
