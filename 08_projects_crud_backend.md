# Step 8: Backend CRUD for Projects

## Goal
Implement full CRUD operations for managing projects.

---

## Instructions

1. **Add CRUD logic to `backend/controllers/ProjectController.js`:**
   ```javascript
   const { Project } = require('../models');

   const getProjects = async (req, res) => {
     const projects = await Project.findAll({ where: { userId: req.user.id } });
     res.json(projects);
   };

   const createProject = async (req, res) => {
     const { name, contact, email, value, source } = req.body;
     const project = await Project.create({ name, contact, email, value, source, userId: req.user.id });
     res.status(201).json(project);
   };

   module.exports = { getProjects, createProject };
