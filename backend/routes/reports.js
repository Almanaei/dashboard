import express from 'express';
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { Report, ReportAttachment } from '../models/index.js';

const router = express.Router();

// Set up file paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
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
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all reports with optional search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};
    
    if (search) {
      whereClause = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const reports = await Report.findAll({
      where: whereClause,
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

// Generate PDF for a report
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id, {
      include: [{
        model: ReportAttachment,
        as: 'attachments'
      }]
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
      info: {
        Title: report.title,
        Author: 'Dashboard System',
        Subject: 'Report Document',
      }
    });

    // Handle any stream errors
    doc.on('error', (err) => {
      console.error('PDF generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to generate PDF' });
      }
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${id}.pdf`);
    
    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add header with logo and company name
    doc
      .fontSize(24)
      .fillColor('#1976d2')
      .text('Dashboard System', { align: 'center' })
      .moveDown(0.5);

    // Add a horizontal line
    doc
      .strokeColor('#e0e0e0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown();

    // Add report title
    doc
      .fontSize(20)
      .fillColor('#000000')
      .text(report.title, { align: 'center' })
      .moveDown();

    // Add metadata section
    doc
      .fontSize(12)
      .fillColor('#666666');

    // Create a table-like structure for metadata
    const startX = 50;
    const colWidth = 150;
    const lineHeight = 20;
    let currentY = doc.y;

    // Date info
    doc
      .text('Date:', startX, currentY)
      .fillColor('#000000')
      .text(new Date(report.date).toLocaleDateString(), startX + colWidth, currentY);

    // Time info
    currentY += lineHeight;
    doc
      .fillColor('#666666')
      .text('Time:', startX, currentY)
      .fillColor('#000000')
      .text(new Date(report.time).toLocaleTimeString(), startX + colWidth, currentY);

    // Location info if available
    if (report.address) {
      currentY += lineHeight;
      doc
        .fillColor('#666666')
        .text('Location:', startX, currentY)
        .fillColor('#000000')
        .text(report.address, startX + colWidth, currentY);
    }

    // Add some space before content
    doc.moveDown(2);

    // Add content section
    doc
      .fontSize(14)
      .fillColor('#1976d2')
      .text('Report Content', { underline: true })
      .moveDown()
      .fontSize(12)
      .fillColor('#000000')
      .text(report.content, {
        align: 'justify',
        columns: 1
      })
      .moveDown(2);

    // Add attachments section if there are any
    if (report.attachments && report.attachments.length > 0) {
      doc
        .fontSize(14)
        .fillColor('#1976d2')
        .text('Attachments', { underline: true })
        .moveDown()
        .fontSize(12)
        .fillColor('#000000');

      report.attachments.forEach((attachment, index) => {
        doc.text(`${index + 1}. ${attachment.filename}`, {
          link: attachment.url,
          underline: true
        });
      });
    }

    // Get total pages before adding the footer
    const totalPages = doc.bufferedPageRange().count;

    // Add footer to all pages
    let pageNumber = 1;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      
      const bottomY = doc.page.height - 50;
      
      // Add generation timestamp
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text(
          `Generated on ${new Date().toLocaleString()}`,
          50,
          bottomY,
          { align: 'center' }
        );

      // Add page numbers
      doc
        .text(
          `Page ${pageNumber} of ${totalPages}`,
          50,
          bottomY - 20,
          { align: 'center' }
        );
      
      pageNumber++;
    }

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF' });
    }
  }
});

export default router;
