'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('invoice_items', { 
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

      materialId: {
        type:Sequelize.INTEGER,
        allowNull:false,
        references: {
          model: 'materials', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
 
      quantity: {
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue: 0
      },

      rate: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },

      subTotal: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },
     
      cgstPercent: {
        type:Sequelize.DECIMAL(5,2),
        allowNull:false,
        defaultValue:0,
      },

      sgstPercent: {
        type:Sequelize.DECIMAL(5,2),
        allowNull:false,
        defaultValue:0,
      },

      totalGSTAmount: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        defaultValue:0,
      },

      totalAmount: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        defaultValue:0,
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
    await queryInterface.dropTable('invoice_items');
  }
};
