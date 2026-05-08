// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     await queryInterface.changeColumn("companies", "assignEmployee", {
//       type: Sequelize.INTEGER,
//       allowNull: true,
//       references: {
//         model: "users",
//         key: "id",
//       },
//       onUpdate: 'CASCADE',
//       onDelete: "SET NULL",
//     });
//   },

//   async down (queryInterface, Sequelize) {
//     await queryInterface.changeColumn("companies", "assignEmployee", {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//       references: {
//         model: "users",
//         key: "id",
//       },
//       onUpdate: 'CASCADE',
//       onDelete: 'CASCADE',
//     });
//   }
// };

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    //remove existing constraint
    await queryInterface.removeConstraint("companies", "companies_ibfk_1");

    // change column
    await queryInterface.changeColumn("companies", "assignEmployee", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // new constraint with SET NULL
    await queryInterface.addConstraint("companies", {
      fields: ["assignEmployee"],
      type: "foreign key",
      name: "companies_ibfk_1",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // remove new constraint
    await queryInterface.removeConstraint("companies", "companies_ibfk_1");

    // Revert column to NOT NULL
    await queryInterface.changeColumn("companies", "assignEmployee", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Restore original CASCADE behavior
    await queryInterface.addConstraint("companies", {
      fields: ["assignEmployee"],
      type: "foreign key",
      name: "companies_ibfk_1",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
