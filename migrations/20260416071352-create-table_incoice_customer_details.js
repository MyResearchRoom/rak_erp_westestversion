'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('invoice_customer_details', 
      { 
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        invoiceId: {
          type:Sequelize.INTEGER,
          allowNull:false,
          references: {
            model: 'invoices', 
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },

        name: {
          type:Sequelize.STRING,
          allowNull:false,
        },

        email: {
          type:Sequelize.STRING,
          allowNull:false,
        },

        phone: {
          type:Sequelize.STRING,
          allowNull:false,
        },

        gstin: {
          type:Sequelize.STRING,
          allowNull:true,
        },
        pan: {
          type:Sequelize.STRING,
          allowNull:false,
        },

        address: {
          type:Sequelize.STRING,
          allowNull:false,
        },

        state: {
          type:Sequelize.STRING,
          allowNull:false,
        },

        city: {
          type:Sequelize.STRING,
          allowNull:false,
        },

        pincode: {
          type:Sequelize.STRING,
          allowNull:false,
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
    await queryInterface.dropTable('invoice_customer_details');

  }
};
