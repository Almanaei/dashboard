import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('planning', 'in_progress', 'completed', 'on_hold'),
    defaultValue: 'planning'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by',
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'projects',
  underscored: true
});

// Define associations
Project.associate = (models) => {
  Project.belongsTo(models.User, { 
    foreignKey: 'created_by',
    as: 'creator',
    onDelete: 'CASCADE'
  });
};

export default Project;
