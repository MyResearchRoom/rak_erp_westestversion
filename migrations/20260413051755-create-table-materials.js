'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('materials', { 
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      itemName: {
        type:Sequelize.STRING,
        allowNull:false,
      },

      hsnCode: {
        type:Sequelize.STRING,
        allowNull:false,
      },

      unit: {
        type:Sequelize.STRING,
        allowNull:false,
      },
   
      gstRate: {
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
      },
     
      price: {
        type:Sequelize.DECIMAL(10,2),
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
    await queryInterface.dropTable('materials');
 
  }
};
