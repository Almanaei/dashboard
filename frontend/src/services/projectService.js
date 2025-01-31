import axios from 'axios';

const API_URL = 'http://localhost:5005/api/projects';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const formatProjectDates = (project) => {
  if (project.start_date) project.start_date = new Date(project.start_date).toISOString();
  if (project.end_date) project.end_date = new Date(project.end_date).toISOString();
  return project;
};

export const getProjects = async (search = '') => {
  try {
    const headers = getAuthHeaders();
    console.log('Fetching projects with headers:', headers);
    
    const response = await axios.get(API_URL, {
      params: { search },
      ...headers
    });
    
    console.log('Projects API response:', response.data);
    
    // Ensure we return an array of projects with properly formatted dates
    const projects = Array.isArray(response.data) ? response.data : response.data.projects || [];
    const formattedProjects = projects.map(formatProjectDates);
    console.log('Processed projects:', formattedProjects);
    return formattedProjects;
  } catch (error) {
    console.error('Error fetching projects:', error.response?.data || error);
    if (error.response?.status === 401) {
      console.log('Unauthorized - clearing token');
      localStorage.removeItem('token');
    }
    throw error;
  }
};

export const getProject = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return formatProjectDates(response.data);
  } catch (error) {
    console.error('Error fetching project:', error.response?.data || error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    // Convert camelCase to snake_case for dates
    const formattedData = {
      ...projectData,
      start_date: projectData.startDate || projectData.start_date,
      end_date: projectData.endDate || projectData.end_date
    };
    delete formattedData.startDate;
    delete formattedData.endDate;

    console.log('Creating project with data:', formattedData);
    const response = await axios.post(API_URL, formattedData, getAuthHeaders());
    return formatProjectDates(response.data);
  } catch (error) {
    console.error('Error creating project:', error.response?.data || error);
    throw error;
  }
};

export const updateProject = async (id, projectData) => {
  try {
    // Convert camelCase to snake_case for dates
    const formattedData = {
      ...projectData,
      start_date: projectData.startDate || projectData.start_date,
      end_date: projectData.endDate || projectData.end_date
    };
    delete formattedData.startDate;
    delete formattedData.endDate;

    console.log('Updating project with data:', formattedData);
    const response = await axios.put(`${API_URL}/${id}`, formattedData, getAuthHeaders());
    return formatProjectDates(response.data);
  } catch (error) {
    console.error('Error updating project:', error.response?.data || error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error.response?.data || error);
    throw error;
  }
}; 