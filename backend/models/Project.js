import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('planning', 'in_progress', 'completed', 'on_hold'),
    defaultValue: 'planning',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
});

// Associations
Project.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});

User.hasMany(Project, { 
  foreignKey: 'createdBy', 
  as: 'projects' 
});

export default Project;
