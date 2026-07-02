'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('expense_categories', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.changeColumn('expense_categories', 'name', {
    //   type: Sequelize.STRING,
    //   allowNull: false,
    //   unique: true,
    // });
  },
};