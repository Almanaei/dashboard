const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reports', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create table for report attachments
    await queryInterface.createTable('report_attachments', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      report_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'reports',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('report_attachments');
    await queryInterface.dropTable('reports');
  }
};
