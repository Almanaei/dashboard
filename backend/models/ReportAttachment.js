import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

class ReportAttachment extends Model {
  static associate(models) {
    ReportAttachment.belongsTo(models.Report, {
      foreignKey: 'report_id',
      as: 'report'
    });
  }
}

ReportAttachment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  report_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'reports',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  original_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mime_type: {
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
  }
}, {
  sequelize,
  modelName: 'ReportAttachment',
  tableName: 'report_attachments',
  underscored: true,
  timestamps: true
});

export default ReportAttachment;
