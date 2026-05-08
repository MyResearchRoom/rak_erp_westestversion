'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('board_of_directors', 'kycDocument', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('board_of_directors', 'kycDocumentContentType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('board_of_directors', 'aadhaarCard', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('board_of_directors', 'aadhaarCardContentType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('board_of_directors', 'panCard', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('board_of_directors', 'panCardContentType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('board_of_directors', 'bankStatement', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('board_of_directors', 'bankStatementContentType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('board_of_directors', 'sevenTwelve', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('board_of_directors', 'sevenTwelveContentType', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('farmer_members', 'aadhaarCard', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('farmer_members', 'aadhaarCardContentType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('farmer_members', 'sevenTwelve', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('farmer_members', 'sevenTwelveContentType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('farmer_members', 'panCard', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('farmer_members', 'panCardContentType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('farmer_members', 'sevenTwelveContentType');
    await queryInterface.removeColumn('farmer_members', 'sevenTwelve');
    await queryInterface.removeColumn('farmer_members', 'aadhaarCardContentType');
    await queryInterface.removeColumn('farmer_members', 'aadhaarCard');
    await queryInterface.removeColumn('farmer_members', 'panCardContentType');
    await queryInterface.removeColumn('farmer_members', 'panCard');

    await queryInterface.removeColumn('board_of_directors', 'sevenTwelveContentType');
    await queryInterface.removeColumn('board_of_directors', 'sevenTwelve');
    await queryInterface.removeColumn('board_of_directors', 'bankStatementContentType');
    await queryInterface.removeColumn('board_of_directors', 'bankStatement');
    await queryInterface.removeColumn('board_of_directors', 'panCardContentType');
    await queryInterface.removeColumn('board_of_directors', 'panCard');
    await queryInterface.removeColumn('board_of_directors', 'aadhaarCardContentType');
    await queryInterface.removeColumn('board_of_directors', 'aadhaarCard');
    await queryInterface.removeColumn('board_of_directors', 'kycDocumentContentType');
    await queryInterface.removeColumn('board_of_directors', 'kycDocument');
  },
};
