import express from 'express';
import {
  getAllProjects as getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/ProjectController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { projectValidation } from '../middleware/validation.js';
import { Project, User } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// Get all projects with search, filter, and sort
router.get('/', async (req, res) => {
  try {
    console.log('GET /projects - User:', req.user);
    console.log('Search query:', req.query.search);
    
    // Build the query based on user role and search
    const query = {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'username', 'avatar']
      }],
      order: [['created_at', 'DESC']]
    };

    // Add search condition if provided
    if (req.query.search && req.query.search !== ':1') {
      query.where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${req.query.search}%` } },
          { description: { [Op.iLike]: `%${req.query.search}%` } }
        ]
      };
    }

    // If not an admin, only show user's own projects
    if (req.user.role.toLowerCase() !== 'admin') {
      query.where = {
        ...query.where,
        created_by: req.user.id
      };
    }

    console.log('Query:', JSON.stringify(query, null, 2));
    const projects = await Project.findAll({
      ...query,
      logging: (sql) => {
        console.log('Generated SQL:', sql);
      }
    });
    
    // Transform dates to ISO strings for consistent frontend handling
    const formattedProjects = projects.map(project => {
      const p = project.get({ plain: true });
      if (p.start_date) {
        p.start_date = new Date(p.start_date).toISOString();
      }
      if (p.end_date) {
        p.end_date = new Date(p.end_date).toISOString();
      }
      return p;
    });
    
    console.log('Found projects:', formattedProjects.length);
    res.json(formattedProjects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ 
      message: 'Failed to get projects', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Get project by ID
router.get('/:id', projectValidation.delete, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role.toLowerCase() !== 'admin' ? { created_by: req.user.id } : {})
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'username', 'avatar']
      }]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const formattedProject = project.get({ plain: true });
    
    // Ensure consistent date formatting
    if (formattedProject.start_date) {
      formattedProject.start_date = new Date(formattedProject.start_date).toISOString();
    }
    if (formattedProject.end_date) {
      formattedProject.end_date = new Date(formattedProject.end_date).toISOString();
    }

    res.json(formattedProject);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ message: 'Failed to get project', error: error.message });
  }
});

// Create new project
router.post('/', projectValidation.create, async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      created_by: req.user.id,
      // Ensure dates are properly formatted
      start_date: req.body.start_date ? new Date(req.body.start_date) : null,
      end_date: req.body.end_date ? new Date(req.body.end_date) : null
    };

    const project = await Project.create(projectData);
    const createdProject = await Project.findByPk(project.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'username', 'avatar']
      }]
    });

    // Format dates for response
    const formattedProject = createdProject.get({ plain: true });
    if (formattedProject.start_date) {
      formattedProject.start_date = new Date(formattedProject.start_date).toISOString();
    }
    if (formattedProject.end_date) {
      formattedProject.end_date = new Date(formattedProject.end_date).toISOString();
    }

    res.status(201).json(formattedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
});

// Update project
router.put('/:id', projectValidation.update, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role.toLowerCase() !== 'admin' ? { created_by: req.user.id } : {})
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Format dates for update
    const updateData = {
      ...req.body,
      start_date: req.body.start_date ? new Date(req.body.start_date) : null,
      end_date: req.body.end_date ? new Date(req.body.end_date) : null
    };

    await project.update(updateData);
    
    const updatedProject = await Project.findByPk(project.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'username', 'avatar']
      }]
    });

    // Format dates for response
    const formattedProject = updatedProject.get({ plain: true });
    if (formattedProject.start_date) {
      formattedProject.start_date = new Date(formattedProject.start_date).toISOString();
    }
    if (formattedProject.end_date) {
      formattedProject.end_date = new Date(formattedProject.end_date).toISOString();
    }

    res.json(formattedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
});

// Delete project
router.delete('/:id', projectValidation.delete, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role.toLowerCase() !== 'admin' ? { created_by: req.user.id } : {})
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
});

// Test database connection
router.get('/test-connection', async (req, res) => {
  try {
    await Project.sequelize.authenticate();
    
    // Get detailed table info
    const tableInfo = await Project.sequelize.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        character_maximum_length,
        column_default,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'Projects'
      ORDER BY ordinal_position;
    `, { type: Project.sequelize.QueryTypes.SELECT });

    // Check if the table exists
    const tableExists = await Project.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Projects'
      );
    `, { type: Project.sequelize.QueryTypes.SELECT });

    // Get migration status
    const migrationStatus = await Project.sequelize.query(`
      SELECT * FROM "SequelizeMeta"
      ORDER BY name;
    `, { type: Project.sequelize.QueryTypes.SELECT });

    // Enable query logging for the next operation
    const oldLogging = Project.sequelize.options.logging;
    Project.sequelize.options.logging = console.log;

    // Attempt a sample query to see the generated SQL
    const sampleQuery = await Project.findOne({
      where: {},
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }],
      logging: console.log
    });

    // Restore original logging setting
    Project.sequelize.options.logging = oldLogging;

    res.json({
      status: 'Database connection successful',
      tableExists: tableExists[0].exists,
      tableInfo,
      migrationStatus,
      sampleQueryResult: sampleQuery ? 'Query successful' : 'No results found'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
