import express from 'express';
import {
  getAllProjects as getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/ProjectController.js';
import { authenticate } from '../middleware/auth.js';
import { projectValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected with authentication
router.use(authenticate);

// Get all projects with search, filter, and sort
router.get('/', projectValidation.search, getProjects);

// Get project by ID
router.get('/:id', projectValidation.delete, getProjectById);

// Create new project
router.post('/', projectValidation.create, createProject);

// Update project
router.put('/:id', projectValidation.update, updateProject);

// Delete project
router.delete('/:id', projectValidation.delete, deleteProject);

export default router;
