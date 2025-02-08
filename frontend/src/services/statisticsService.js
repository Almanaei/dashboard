import axios from '../utils/axiosConfig';

const API_ENDPOINT = '/statistics';

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/dashboard`);
    return {
      projects: response.data.projectCount || 0,
      reports: response.data.reportCount || 0,
      users: response.data.userCount || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error;
  }
};

export const getProjectTrends = async (period, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      period,
      start_date: startDate,
      end_date: endDate
    });
    
    const response = await axios.get(`${API_ENDPOINT}/projects/trends?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project trends:', error);
    throw error;
  }
};

export const getUserStats = async (page, limit, search, sortField, sortOrder) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...(sortField && { sortField }),
      ...(sortOrder && { sortOrder })
    });
    
    const response = await axios.get(`${API_ENDPOINT}/users?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

export const getProjectStats = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/projects/overview`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project statistics:', error);
    throw error;
  }
};

export const getProjectPerformance = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/projects/performance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project performance:', error);
    throw error;
  }
}; 