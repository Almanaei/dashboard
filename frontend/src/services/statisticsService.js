import axios from 'axios';

const API_URL = 'http://localhost:5005/api/statistics';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getUserCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/count`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error getting user count:', error.response?.data || error);
    throw error;
  }
};

export const getProjectStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/projects`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error getting project statistics:', error.response?.data || error);
    throw error;
  }
};

export const getProjectTrends = async (startDate, endDate, period = 'M') => {
  try {
    console.log('Fetching trends with params:', { startDate, endDate, period }); // Debug log
    
    const response = await axios.get(`${API_URL}/projects/trends`, {
      ...getAuthHeaders(),
      params: {
        start_date: startDate,
        end_date: endDate,
        period
      }
    });

    console.log('Trends response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error getting project trends:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Failed to fetch project trends');
  }
};

export const getProjectPerformance = async () => {
  try {
    const response = await axios.get(`${API_URL}/performance`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error getting project performance:', error.response?.data || error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error getting dashboard statistics:', error.response?.data || error);
    throw error;
  }
};

export const getUserStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error getting user statistics:', error.response?.data || error);
    throw error;
  }
}; 