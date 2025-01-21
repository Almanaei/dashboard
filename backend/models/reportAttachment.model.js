import { Model, DataTypes } from 'sequelize';

const initReportAttachment = (sequelize) => {
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
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    report_id: {
      type: DataTypes.INTEGER,
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
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ReportAttachment;
};

export default initReportAttachment;
