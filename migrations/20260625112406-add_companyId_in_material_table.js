'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("materials", "companyId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "itemName",
      references: {
          model: 'companies', 
          key: 'id',
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("materials", "companyId");
  }
};
