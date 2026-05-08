'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('compliance_documents', { 
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      companyId :{
        type:Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      docName:{
        type:Sequelize.STRING,
          allowNull:false,
      },
      docNumber:{
        type:Sequelize.STRING,
        allowNull:true,
      },
      issueAuthority:{
        type:Sequelize.STRING,
        allowNull:true,
      },
      issueDate:{
        type:Sequelize.DATEONLY,
        allowNull:true,
      },
      expiryDate:{
        type:Sequelize.DATEONLY,
        allowNull:true,
      },
      note:{
        type:Sequelize.STRING,
        allowNull:true,
      },
      doc:{
        type: Sequelize.BLOB("long"),
        allowNull:false,
      },
      docContentType:{
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('compliance_documents');
  }
};
