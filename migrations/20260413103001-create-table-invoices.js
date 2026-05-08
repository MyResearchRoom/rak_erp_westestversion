'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      invoiceNumber: {
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

      invoiceDate :{
        type: Sequelize.DATEONLY,
        allowNull:false,
      },

      overDueDate :{
        type: Sequelize.DATEONLY,
        allowNull:false,
      },
 
      subTotal: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },

      totalCGSTPercent: {
        type:Sequelize.DECIMAL(5,2),
        allowNull:false,
        defaultValue: 0
      },

      totalSGSTPercent: {
        type:Sequelize.DECIMAL(5,2),
        allowNull:false,
        defaultValue: 0
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

      totalPaid: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        defaultValue:0,
      },

      totalRemaining: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        defaultValue:0,
      },

      status :{
        type: Sequelize.ENUM(
            "paid","partially paid","pending"
        ),
        allowNull:false,
        defaultValue:"pending",
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
    await queryInterface.dropTable('invoices');
  }
};
