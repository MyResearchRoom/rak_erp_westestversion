"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("companies", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      gstin:{
        type:Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      pan:{
        type:Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      companyType:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      address:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      city:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      state:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      pincode:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      contactPerson:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      email:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      mobileNumber:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      password:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      connectedDate:{
        type:Sequelize.DATEONLY,
        allowNull: false, 
      },
      status:{
        type:Sequelize.ENUM(
          "pending",
          "active",
          "inactive",
        ),
        allowNull: false,
        defaultValue:"pending",
      },
      assignEmployee:{
        type:Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      logo:{
        type: Sequelize.BLOB("long"),
        allowNull:true,
      },
      logoContentType:{
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("companies");
  },
};
