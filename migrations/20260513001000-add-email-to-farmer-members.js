'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('farmer_members');

    if (!table.email) {
      await queryInterface.addColumn('farmer_members', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('farmer_members');

    if (table.email) {
      await queryInterface.removeColumn('farmer_members', 'email');
    }
  },
};
