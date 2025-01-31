import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

class Report extends Model {
  static associate(models) {
    Report.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Report.hasMany(models.ReportAttachment, {
      foreignKey: 'report_id',
      as: 'attachments',
      onDelete: 'CASCADE'
    });
  }
}

Report.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
  address: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Report',
  tableName: 'reports',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Report;
