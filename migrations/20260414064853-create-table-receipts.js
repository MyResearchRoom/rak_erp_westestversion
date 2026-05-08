'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('receipts', { 
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      receiptNumber: {
        type:Sequelize.STRING,
        allowNull:false,
        unique:true,
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

      amount: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },

      paymentDate :{
        type: Sequelize.DATEONLY,
        allowNull:false,
      },

      paymentMethod :{
        type: Sequelize.ENUM(
            "bank transfer","upi","cheque","cash","card"
        ),
        allowNull:false,
      },

      transactionReference: {
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
    await queryInterface.dropTable('receipts');
  }
};
