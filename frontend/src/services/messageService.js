import axios from 'axios';

const API_URL = 'http://localhost:5005/api/messages';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found in localStorage');
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const getMessages = async (userId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/conversation/${userId}`, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (recipientId, content) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(API_URL, {
      recipient_id: recipientId,
      content
    }, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const editMessage = async (messageId, content) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`${API_URL}/${messageId}`, {
      content
    }, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(`${API_URL}/${messageId}`, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const clearConversation = async (userId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(`${API_URL}/conversation/${userId}`, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Error clearing conversation:', error);
    throw error;
  }
};

export const markAsRead = async (messageId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`${API_URL}/${messageId}/read`, {}, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const addReaction = async (messageId, reaction) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/${messageId}/reactions`, {
      reaction
    }, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
}; 