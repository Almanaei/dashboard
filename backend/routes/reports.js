import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import fs from 'fs';
import { Report, ReportAttachment } from '../models/index.js';

const router = express.Router();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename while preserving the original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [{
        model: ReportAttachment,
        as: 'attachments'
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Create a new report
router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    const { title, content, date, time, address } = req.body;
    
    // Create the report
    const report = await Report.create({
      title,
      content,
      date,
      time,
      address
    });

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        report_id: report.id,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `/uploads/${file.filename}`
      }));

      await ReportAttachment.bulkCreate(attachments);
    }

    // Fetch the complete report with attachments
    const completeReport = await Report.findByPk(report.id, {
      include: [{
        model: ReportAttachment,
        as: 'attachments'
      }]
    });

    res.status(201).json(completeReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).json({ message: 'Failed to create report' });
  }
});

// Update a report
router.put('/:id', upload.array('attachments'), async (req, res) => {
  try {
    const { title, content, date, time, address } = req.body;
    const report = await Report.findByPk(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Update report details
    await report.update({
      title,
      content,
      date,
      time,
      address
    });

    // Process new uploaded files
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        report_id: report.id,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `/uploads/${file.filename}`
      }));

      await ReportAttachment.bulkCreate(attachments);
    }

    // Fetch updated report with attachments
    const updatedReport = await Report.findByPk(report.id, {
      include: [{
        model: ReportAttachment,
        as: 'attachments'
      }]
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(400).json({ message: 'Failed to update report' });
  }
});

// Delete a report
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await report.destroy();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

export default router;
