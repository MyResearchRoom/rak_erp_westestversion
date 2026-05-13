'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('board_of_directors');

    if (table.dsc) {
      await queryInterface.removeColumn('board_of_directors', 'dsc');
    }

    if (table.dinIssued) {
      await queryInterface.removeColumn('board_of_directors', 'dinIssued');
    }

    if (table.isSanchalak) {
      await queryInterface.removeColumn('board_of_directors', 'isSanchalak');
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('board_of_directors');

    if (!table.dsc) {
      await queryInterface.addColumn('board_of_directors', 'dsc', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      });
    }

    if (!table.dinIssued) {
      await queryInterface.addColumn('board_of_directors', 'dinIssued', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      });
    }

    if (!table.isSanchalak) {
      await queryInterface.addColumn('board_of_directors', 'isSanchalak', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      });
    }
  },
};
