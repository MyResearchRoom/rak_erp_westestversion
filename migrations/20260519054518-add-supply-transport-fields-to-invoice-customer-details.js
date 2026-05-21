'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "invoice_customer_details",
      "transportationMode",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      "invoice_customer_details",
      "transportDescription",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      "invoice_customer_details",
      "placeOfSupply",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      "invoice_customer_details",
      "dateOfSupply",
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "invoice_customer_details",
      "transportationMode"
    );

    await queryInterface.removeColumn(
      "invoice_customer_details",
      "transportDescription"
    );

    await queryInterface.removeColumn(
      "invoice_customer_details",
      "placeOfSupply"
    );

    await queryInterface.removeColumn(
      "invoice_customer_details",
      "dateOfSupply"
    );
  },
};