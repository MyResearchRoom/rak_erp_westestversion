'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('compliance_documents');

    if (!table.financialYear) {
      await queryInterface.addColumn('compliance_documents', 'financialYear', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('compliance_documents');

    if (table.financialYear) {
      await queryInterface.removeColumn('compliance_documents', 'financialYear');
    }
  },
};
