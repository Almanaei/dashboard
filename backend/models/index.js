'use strict';

import { sequelize } from '../config/database.js';
import User from './User.js';
import Project from './Project.js';
import Report from './Report.js';
import ReportAttachment from './ReportAttachment.js';
import Message from './Message.js';

const models = {
  User,
  Project,
  Report,
  ReportAttachment,
  Message
};

// Set up associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export { User, Project, Report, ReportAttachment, Message, sequelize };
export default models;
