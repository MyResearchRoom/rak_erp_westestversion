'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const complianceTable = await queryInterface.describeTable('compliance_documents');

    if (!complianceTable.name) {
      await queryInterface.addColumn('compliance_documents', 'name', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!complianceTable.dueDate) {
      await queryInterface.addColumn('compliance_documents', 'dueDate', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }

    const refreshedComplianceTable = await queryInterface.describeTable('compliance_documents');

    if (refreshedComplianceTable.docName && refreshedComplianceTable.name) {
      await queryInterface.sequelize.query(
        'UPDATE compliance_documents SET name = docName WHERE name IS NULL AND docName IS NOT NULL'
      );
    }

    if (refreshedComplianceTable.expiryDate && refreshedComplianceTable.dueDate) {
      await queryInterface.sequelize.query(
        'UPDATE compliance_documents SET dueDate = expiryDate WHERE dueDate IS NULL AND expiryDate IS NOT NULL'
      );
    }

    if (refreshedComplianceTable.docName && refreshedComplianceTable.docName.allowNull === false) {
      await queryInterface.changeColumn('compliance_documents', 'docName', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (refreshedComplianceTable.doc && refreshedComplianceTable.doc.allowNull === false) {
      await queryInterface.changeColumn('compliance_documents', 'doc', {
        type: Sequelize.BLOB('long'),
        allowNull: true,
      });
    }

    if (refreshedComplianceTable.docContentType && refreshedComplianceTable.docContentType.allowNull === false) {
      await queryInterface.changeColumn('compliance_documents', 'docContentType', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    const tables = await queryInterface.showAllTables();
    const hasOtherComplianceTable = tables
      .map((table) => (typeof table === 'string' ? table : table.tableName))
      .includes('other_compliance_documents');

    if (!hasOtherComplianceTable) {
      await queryInterface.createTable('other_compliance_documents', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        companyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'companies',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        docName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        dueDate: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        financialYear: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        doc: {
          type: Sequelize.BLOB('long'),
          allowNull: true,
        },
        docContentType: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const hasOtherComplianceTable = tables
      .map((table) => (typeof table === 'string' ? table : table.tableName))
      .includes('other_compliance_documents');

    if (hasOtherComplianceTable) {
      await queryInterface.dropTable('other_compliance_documents');
    }

    const complianceTable = await queryInterface.describeTable('compliance_documents');

    if (complianceTable.dueDate) {
      await queryInterface.removeColumn('compliance_documents', 'dueDate');
    }

    if (complianceTable.name) {
      await queryInterface.removeColumn('compliance_documents', 'name');
    }
  },
};
