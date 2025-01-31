import { Project, User } from '../models/index.js';
import { Op } from 'sequelize';

// Get all projects with filtering, sorting, and pagination
export const getAllProjects = async (req, res) => {
  try {
    console.log('Getting all projects for user:', req.user);

    // Build where clause
    const where = {};

    // Add user-specific filtering for non-admin users
    if (req.user.role !== 'admin') {
      where.created_by = req.user.id;
    }

    // Get projects with filters and user data
    const projects = await Project.findAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'username', 'avatar']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('Found projects:', projects.length);
    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const whereClause = { id: req.params.id };
    
    // Add user-specific filtering for non-admin users
    if (req.user.role !== 'admin') {
      whereClause.created_by = req.user.id;
    }

    const project = await Project.findOne({
      where: whereClause,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'username', 'avatar']
      }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    console.log('User:', req.user);

    if (!req.user || !req.user.id) {
      console.error('No user ID found in request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Convert dates to ISO format if they exist
    const projectData = {
      ...req.body,
      created_by: req.user.id,
      start_date: req.body.start_date ? 
        new Date(req.body.start_date).toISOString() : undefined,
      end_date: req.body.end_date ? 
        new Date(req.body.end_date).toISOString() : undefined,
      budget: req.body.budget ? parseFloat(req.body.budget) : undefined
    };

    // Remove undefined values
    Object.keys(projectData).forEach(key => {
      if (projectData[key] === undefined) {
        delete projectData[key];
      }
    });

    console.log('Processed project data:', projectData);

    const project = await Project.create(projectData);
    console.log('Project created:', project.toJSON());

    const projectWithCreator = await Project.findOne({
      where: { id: project.id },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'username', 'avatar']
      }]
    });

    if (!projectWithCreator) {
      console.error('Created project not found with creator');
      return res.status(500).json({ error: 'Failed to retrieve created project' });
    }

    console.log('Created project with creator:', projectWithCreator.get({ plain: true }));
    res.status(201).json(projectWithCreator);
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(400).json({ error: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const whereClause = { 
      id: req.params.id,
      created_by: req.user.id
    };

    // Allow admin to update any project
    if (req.user.role === 'admin') {
      delete whereClause.created_by;
    }

    const project = await Project.findOne({ where: whereClause });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Process update data
    const updateData = {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate).toISOString() : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate).toISOString() : undefined,
      budget: req.body.budget ? parseFloat(req.body.budget) : undefined
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await project.update(updateData);

    const updatedProject = await Project.findOne({
      where: { id: project.id },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'username', 'avatar']
      }]
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(400).json({ error: error.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const whereClause = { 
      id: req.params.id,
      created_by: req.user.id
    };

    // Allow admin to delete any project
    if (req.user.role === 'admin') {
      delete whereClause.created_by;
    }

    const project = await Project.findOne({ where: whereClause });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
};
