import axios from '../utils/axiosConfig';

const API_ENDPOINT = '/projects';

const formatProjectDates = (project) => {
  if (!project) return null;
  try {
    return {
      ...project,
      start_date: project.start_date ? new Date(project.start_date).toISOString() : null,
      end_date: project.end_date ? new Date(project.end_date).toISOString() : null,
      created_at: project.created_at ? new Date(project.created_at).toISOString() : null,
      updated_at: project.updated_at ? new Date(project.updated_at).toISOString() : null
    };
  } catch (error) {
    console.error('Error formatting project dates:', error);
    return project;
  }
};

export const getProjects = async (search = '') => {
  try {
    console.log('Fetching projects with search:', search);
    const response = await axios.get(API_ENDPOINT, {
      params: { search }
    });
    
    // Handle both array and object responses
    const projects = Array.isArray(response.data) 
      ? response.data 
      : response.data.projects || [];

    console.log('Received projects:', projects.length);
    return projects.map(formatProjectDates);
  } catch (error) {
    console.error('Error fetching projects:', error.response?.data || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch projects');
  }
};

export const getProject = async (id) => {
  try {
    console.log('Fetching project:', id);
    const response = await axios.get(`${API_ENDPOINT}/${id}`);
    return formatProjectDates(response.data);
  } catch (error) {
    console.error('Error fetching project:', error.response?.data || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch project');
  }
};

export const createProject = async (projectData) => {
  try {
    console.log('Creating project with raw data:', projectData);
    
    // Ensure all required fields are present and properly formatted
    const formattedData = {
      name: projectData.name?.trim(),
      description: projectData.description?.trim() || '',
      status: projectData.status || 'planning',
      priority: projectData.priority || 'medium',
      budget: projectData.budget ? parseFloat(projectData.budget) : null,
      progress: parseInt(projectData.progress || 0),
      // Ensure dates are in ISO format
      start_date: projectData.start_date ? new Date(projectData.start_date).toISOString() : null,
      end_date: projectData.end_date ? new Date(projectData.end_date).toISOString() : null
    };

    // Validate required fields
    if (!formattedData.name) {
      throw new Error('Project name is required');
    }

    console.log('Sending formatted project data:', formattedData);
    const response = await axios.post(API_ENDPOINT, formattedData);
    return formatProjectDates(response.data);
  } catch (error) {
    console.error('Error creating project:', error.response?.data || error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to create project');
  }
};

export const updateProject = async (id, projectData) => {
  try {
    if (!id) {
      throw new Error('Project ID is required');
    }
    
    console.log('Updating project:', { id, projectData });
    
    // Format the data before sending
    const formattedData = {
      name: projectData.name?.trim(),
      description: projectData.description?.trim() || '',
      status: projectData.status || 'planning',
      priority: projectData.priority || 'medium',
      budget: projectData.budget ? parseFloat(projectData.budget) : null,
      progress: parseInt(projectData.progress || 0),
      start_date: projectData.start_date ? new Date(projectData.start_date).toISOString() : null,
      end_date: projectData.end_date ? new Date(projectData.end_date).toISOString() : null
    };

    // Remove any undefined or null values
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === undefined || formattedData[key] === null) {
        delete formattedData[key];
      }
    });

    console.log('Sending formatted project data:', formattedData);
    const response = await axios.put(`${API_ENDPOINT}/${id}`, formattedData);
    return formatProjectDates(response.data);
  } catch (error) {
    console.error('Error updating project:', error.response?.data || error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to update project');
  }
};

export const deleteProject = async (id) => {
  try {
    console.log('Deleting project:', id);
    const response = await axios.delete(`${API_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error.response?.data || error);
    throw new Error(error.response?.data?.error || 'Failed to delete project');
  }
}; 