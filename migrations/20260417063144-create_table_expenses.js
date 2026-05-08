'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', { 
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      expenseNumber: {
        type:Sequelize.STRING,
        allowNull:false,
        unique:true,
      },

      categoryId :{
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'expense_categories', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
          
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      
      amount: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        defaultValue: 0
      },
      
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      
      paymentMethod :{
        type: Sequelize.ENUM("bank transfer","upi","cheque","cash","card"),
        allowNull:false,
      },
      
      reference: {
        type:Sequelize.STRING,
        allowNull:true,
      },

      status :{
        type: Sequelize.ENUM("pending","approved","rejected"),
        allowNull:false,
        defaultValue:"pending",
      },
      
      notes :{
        type:Sequelize.STRING,
        allowNull:true,
      },
      
      receipt:{
        type: Sequelize.BLOB("long"),
        allowNull:true,
      },
      
      receiptContentType:{
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
    await queryInterface.dropTable('expenses');
  }
};
