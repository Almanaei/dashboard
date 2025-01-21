'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database.js';
import initReport from './report.model.js';
import initReportAttachment from './reportAttachment.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const db = {};

// Initialize models
const Report = initReport(sequelize);
const ReportAttachment = initReportAttachment(sequelize);

// Set up associations
Report.associate({ ReportAttachment });
ReportAttachment.associate({ Report });

db.Report = Report;
db.ReportAttachment = ReportAttachment;
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export { Report, ReportAttachment };
