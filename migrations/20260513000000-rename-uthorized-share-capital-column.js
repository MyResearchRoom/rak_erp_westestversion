'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('company_details');

    if (table.uthorizedShareCapital && !table.authorizedShareCapital) {
      await queryInterface.renameColumn(
        'company_details',
        'uthorizedShareCapital',
        'authorizedShareCapital'
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('company_details');

    if (table.authorizedShareCapital && !table.uthorizedShareCapital) {
      await queryInterface.renameColumn(
        'company_details',
        'authorizedShareCapital',
        'uthorizedShareCapital'
      );
    }
  },
};
