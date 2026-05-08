'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("company_documents", "companyId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: "companyDetailId",
      references: {
          model: 'companies', 
          key: 'id',
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("company_documents", "companyId");
  }
};
