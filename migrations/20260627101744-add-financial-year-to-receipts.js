module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "receipts",
      "financialYear",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "receipts",
      "financialYear"
    );
  },
};