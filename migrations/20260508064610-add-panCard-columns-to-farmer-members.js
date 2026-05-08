'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("farmer_members", "panCard", {
      type: Sequelize.BLOB("long"),
      allowNull: true,
      after: "sevenTwelveContentType",
    });

    await queryInterface.addColumn(
      "farmer_members",
      "panCardContentType",
      {
        type: Sequelize.STRING,
        allowNull: true,
        after: "panCard",
      }
    );

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn(
      "farmer_members",
      "panCard"
    );

    await queryInterface.removeColumn(
      "farmer_members",
      "panCardContentType"
    );

  },
};