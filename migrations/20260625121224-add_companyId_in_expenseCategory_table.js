'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("expense_categories", "companyId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "name",
      references: {
          model: 'companies', 
          key: 'id',
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("expense_categories", "companyId");
  }
};
