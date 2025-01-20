import Project from '../models/Project.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

// Get all projects with filtering, sorting, and pagination
export const getAllProjects = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause
    const where = {
      createdBy: req.user.userId
    };

    // Search
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Priority filter
    if (priority) {
      where.priority = priority;
    }

    // Date range filter
    if (startDate) {
      where.startDate = { [Op.gte]: new Date(startDate) };
    }
    if (endDate) {
      where.endDate = { [Op.lte]: new Date(endDate) };
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const total = await Project.count({ where });

    // Get projects with filters, sorting, and pagination
    const projects = await Project.findAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'email']
      }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      projects,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { 
        id: req.params.id,
        createdBy: req.user.userId
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'email']
      }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user.userId
    });

    const projectWithCreator = await Project.findOne({
      where: { id: project.id },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'email']
      }]
    });

    res.status(201).json(projectWithCreator);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { 
        id: req.params.id,
        createdBy: req.user.userId
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.update(req.body);

    const updatedProject = await Project.findOne({
      where: { id: project.id },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'email']
      }]
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { 
        id: req.params.id,
        createdBy: req.user.userId
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
