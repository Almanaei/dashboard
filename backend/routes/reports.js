import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import jwt from 'jsonwebtoken';
import db, { Report, ReportAttachment, User, sequelize } from '../models/index.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { storage, fileFilter, limits } from '../config/multer.js';
import { validateFiles } from '../middleware/validateFiles.js';

const router = express.Router();
const upload = multer({ 
  storage,
  fileFilter,
  limits
});

// Protect all routes with authentication except debug routes
router.use((req, res, next) => {
  if (req.path.startsWith('/debug')) {
    next();
  } else {
    verifyToken(req, res, next);
  }
});

// Debug route to check database status (no auth required)
router.get('/debug/status', async (req, res) => {
  try {
    // Get migrations status
    const migrations = await Report.sequelize.query(`
      SELECT *
      FROM "SequelizeMeta"
      ORDER BY name
    `, { type: Report.sequelize.QueryTypes.SELECT });

    // Get all tables and their columns
    const tables = await Report.sequelize.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `, { type: Report.sequelize.QueryTypes.SELECT });

    // Get all reports directly from the database
    const reports = await Report.sequelize.query(`
      SELECT r.*, u.email as user_email
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
    `, { type: Report.sequelize.QueryTypes.SELECT });

    res.json({
      migrations,
      tables,
      reports
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug route to reset migrations (no auth required)
router.post('/debug/reset-migrations', async (req, res) => {
  try {
    // Drop tables and constraints
    await Report.sequelize.query(`
      DROP TABLE IF EXISTS report_attachments CASCADE;
      DROP TABLE IF EXISTS reports CASCADE;
    `);

    // Delete old migrations
    await Report.sequelize.query(`
      DELETE FROM "SequelizeMeta"
      WHERE name LIKE '%reports%'
    `);

    res.json({ message: 'Database reset successful' });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check token (no auth required)
router.post('/debug/check-token', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      // Check if user exists
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({ 
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        decoded 
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.status(401).json({ error: 'Invalid token', details: err.message });
    }
  } catch (error) {
    console.error('Error checking token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};
    
    console.log('GET /reports - User:', {
      id: req.user.id,
      role: req.user.role
    });
    
    // Add user-specific filtering for non-admin users
    if (req.user.role.toLowerCase() !== 'admin') {
      whereClause.userId = req.user.id;
    }
    
    if (search) {
      whereClause = {
        ...whereClause,
        [db.Op.or]: [
          { title: { [db.Op.iLike]: `%${search}%` } },
          { content: { [db.Op.iLike]: `%${search}%` } },
          { address: { [db.Op.iLike]: `%${search}%` } }
        ]
      };
    }

    console.log('GET /reports - Where clause:', JSON.stringify(whereClause, null, 2));

    const reports = await Report.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'name', 'avatar']
        },
        {
          model: ReportAttachment,
          as: 'attachments'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`Found ${reports.length} reports`);
    
    // Transform the reports to ensure consistent format
    const transformedReports = reports.map(report => {
      const plainReport = report.get({ plain: true });
      return {
        ...plainReport,
        attachments: plainReport.attachments?.map(attachment => ({
          ...attachment,
          url: attachment.url.startsWith('http') ? attachment.url : `/uploads/${attachment.filename}`
        })) || []
      };
    });

    res.json(transformedReports);
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ 
      message: 'Failed to get reports', 
      error: error.message 
    });
  }
});

// Get a single report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'name', 'avatar']
        },
        {
          model: ReportAttachment,
          as: 'attachments'
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user has permission to view the report
    if (req.user.role.toLowerCase() !== 'admin' && report.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Transform the report to ensure consistent format
    const plainReport = report.get({ plain: true });
    const transformedReport = {
      ...plainReport,
      attachments: plainReport.attachments?.map(attachment => ({
        ...attachment,
        url: attachment.url.startsWith('http') ? attachment.url : `/uploads/${attachment.filename}`
      })) || []
    };

    res.json(transformedReport);
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ 
      message: 'Failed to get report', 
      error: error.message 
    });
  }
});

// Create a new report
router.post('/', upload.array('attachments'), async (req, res) => {
  let transaction;
  
  try {
    transaction = await sequelize.transaction();
    
    console.log('=== Creating Report ===');
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);
    
    if (!req.user) {
      throw new Error('Authentication required');
    }

    if (!req.user.id) {
      throw new Error('User ID is missing');
    }

    const { title, content, date, time, address } = req.body;

    if (!title || !content || !date || !time || !address) {
      throw new Error('Missing required fields');
    }

    // Create report
    const reportData = {
      title,
      content,
      date,
      time,
      address,
      user_id: req.user.id
    };
    
    console.log('Creating report with data:', reportData);

    const report = await Report.create(reportData, { transaction });

    // Handle attachments
    if (req.files && req.files.length > 0) {
      console.log('=== Processing attachments ===');
      console.log('Number of new files:', req.files.length);
      console.log('Raw file objects:', JSON.stringify(req.files, null, 2));

      const attachments = req.files.map((file, index) => {
        // Log the complete file object
        console.log(`\nProcessing file ${index}:`, file);
        console.log('File properties:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          destination: file.destination,
          filename: file.filename,
          path: file.path,
          size: file.size
        });

        const baseType = file.mimetype.split('/')[0];
        let type = 'document';
        switch (baseType) {
          case 'image':
            type = 'image';
            break;
          case 'application':
            type = 'document';
            break;
        }

        // Get file stats for size
        let fileSize = file.size;
        if (!fileSize && file.path) {
          try {
            const stats = fs.statSync(file.path);
            fileSize = stats.size;
          } catch (err) {
            console.warn(`Could not get file size for ${file.originalname}:`, err);
            fileSize = 0;
          }
        }

        // Ensure we have a filename
        if (!file.filename) {
          console.error('Missing filename for file:', file);
          throw new Error(`Missing filename for file at index ${index}`);
        }

        const attachmentData = {
          report_id: report.id,
          name: file.originalname,
          filename: file.filename,
          original_name: file.originalname,
          mime_type: file.mimetype,
          size: fileSize,
          type: type,
          url: `/uploads/${file.filename}`
        };

        console.log('Prepared attachment data:', attachmentData);
        return attachmentData;
      });

      console.log('Creating attachments:', JSON.stringify(attachments, null, 2));
      
      try {
        // Log the exact data being sent to bulkCreate
        console.log('Sending to bulkCreate:', {
          data: attachments,
          fields: [
            'report_id',
            'name',
            'filename',
            'original_name',
            'mime_type',
            'size',
            'type',
            'url'
          ]
        });

        const createdAttachments = await ReportAttachment.bulkCreate(attachments, { 
          transaction,
          validate: true,
          returning: true,
          fields: [
            'report_id',
            'name',
            'filename',
            'original_name',
            'mime_type',
            'size',
            'type',
            'url'
          ]
        });
        console.log('Successfully created attachments:', JSON.stringify(createdAttachments, null, 2));
      } catch (error) {
        console.error('Error creating attachments:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          errors: error.errors
        });
        throw error;
      }
    } else {
      console.log('No files to process in request');
    }

    await transaction.commit();

    // Fetch created report with all associations
    const createdReport = await Report.findByPk(report.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'name', 'avatar']
        },
        {
          model: ReportAttachment,
          as: 'attachments'
        }
      ]
    });

    res.status(201).json(createdReport);
  } catch (error) {
    console.error('Error creating report:', error);
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    // Send appropriate error response
    if (error.message === 'Authentication required') {
      res.status(401).json({ message: error.message });
    } else if (error.message === 'User ID is missing') {
      res.status(400).json({ message: error.message });
    } else if (error.message === 'Missing required fields') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Failed to create report',
        error: error.message 
      });
    }
  }
});

// Update a report
router.put('/:id', upload.array('attachments'), async (req, res) => {
  let transaction;
  
  try {
    transaction = await sequelize.transaction();
    
    console.log('=== Starting report update ===');
    console.log('Request body:', req.body);
    console.log('Files in request:', req.files ? req.files.length : 0);

    const { title, content, date, time, address, attachmentsToKeep } = req.body;
    console.log('Attachments to keep:', attachmentsToKeep);

    // Find the report with its attachments
    const report = await Report.findByPk(req.params.id, {
      include: [{
        model: ReportAttachment,
        as: 'attachments'
      }],
      transaction
    });
    
    if (!report) {
      throw new Error('Report not found');
    }

    // Check if user has permission to update the report
    if (req.user.role.toLowerCase() !== 'admin' && report.userId !== req.user.id) {
      throw new Error('Forbidden');
    }

    // Update report details
    await report.update({
      title,
      content,
      date,
      time,
      address,
      updatedAt: new Date()
    }, { transaction });

    // Handle existing attachments
    if (report.attachments) {
      let attachmentsToKeepArray = [];
      try {
        attachmentsToKeepArray = attachmentsToKeep ? JSON.parse(attachmentsToKeep) : [];
      } catch (err) {
        throw new Error('Invalid attachmentsToKeep format');
      }

      // Delete attachments that are not in the keepList
      const attachmentsToDelete = report.attachments.filter(
        attachment => !attachmentsToKeepArray.includes(attachment.id.toString())
      );

      if (attachmentsToDelete.length > 0) {
        await Promise.all(attachmentsToDelete.map(async (attachment) => {
          try {
            if (attachment.filename) {
              const filePath = path.join(process.cwd(), 'uploads', attachment.filename);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
            await attachment.destroy({ transaction });
          } catch (err) {
            throw new Error(`Failed to delete attachment: ${err.message}`);
          }
        }));
      }
    }

    // Process new uploaded files
    if (req.files && req.files.length > 0) {
      console.log('=== Processing new attachments ===');
      console.log('Number of new files:', req.files.length);
      console.log('Files received:', req.files.map(f => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        encoding: f.encoding,
        mimetype: f.mimetype,
        filename: f.filename,
        path: f.path,
        size: f.size
      })));

      // Validate all files have required data
      const invalidFiles = req.files.filter(file => {
        const missingFields = [];
        if (!file.filename) missingFields.push('filename');
        if (!file.originalname) missingFields.push('originalname');
        if (!file.mimetype) missingFields.push('mimetype');
        
        if (missingFields.length > 0) {
          console.error(`File ${file.originalname || 'unknown'} missing fields:`, missingFields);
          return true;
        }
        return false;
      });

      if (invalidFiles.length > 0) {
        throw new Error(`Invalid files detected: ${invalidFiles.map(f => f.originalname || 'unknown').join(', ')}`);
      }

      const newAttachments = req.files.map((file, index) => {
        console.log('Processing file:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          destination: file.destination,
          filename: file.filename,
          path: file.path,
          size: file.size
        });

        const baseType = file.mimetype.split('/')[0];
        let type = 'document';
        switch (baseType) {
          case 'image':
            type = 'image';
            break;
          case 'application':
            type = 'document';
            break;
        }

        // Get file stats for size
        let fileSize = file.size;
        if (!fileSize && file.path) {
          try {
            const stats = fs.statSync(file.path);
            fileSize = stats.size;
          } catch (err) {
            console.warn(`Could not get file size for ${file.originalname}:`, err);
            fileSize = 0;
          }
        }

        // Ensure we have a filename
        if (!file.filename) {
          throw new Error(`Missing filename for file at index ${index}`);
        }

        const attachmentData = {
          report_id: report.id,
          name: file.originalname,
          filename: file.filename,
          original_name: file.originalname,
          mime_type: file.mimetype,
          size: fileSize,
          type: type,
          url: `/uploads/${file.filename}`
        };

        console.log('Prepared attachment data:', attachmentData);
        return attachmentData;
      });

      console.log('Creating new attachments:', JSON.stringify(newAttachments, null, 2));

      const createdAttachments = await ReportAttachment.bulkCreate(newAttachments, {
        transaction,
        validate: true,
        returning: true,
        fields: [
          'report_id',
          'name',
          'filename',
          'original_name',
          'mime_type',
          'size',
          'type',
          'url'
        ]
      });
      console.log('Successfully created new attachments:', createdAttachments);
    }

    await transaction.commit();

    // Fetch updated report with all associations
    const updatedReport = await Report.findByPk(report.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'name', 'avatar']
        },
        {
          model: ReportAttachment,
          as: 'attachments'
        }
      ]
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Error in report update:', error);
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    // Send appropriate error response
    if (error.message === 'Report not found') {
      res.status(404).json({ message: error.message });
    } else if (error.message === 'Forbidden') {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Failed to update report',
        error: error.message 
      });
    }
  }
});

// Delete a report
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user has permission to delete the report
    if (req.user.role.toLowerCase() !== 'admin' && report.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
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

    // Check if user has permission to view the report
    if (req.user.role.toLowerCase() !== 'admin' && report.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
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
