import axios from 'axios';

const API_URL = 'http://localhost:5005/api/users';

const getAuthHeaders = (includeContentType = true) => {
  const headers = {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return { headers };
};

const MAX_IMAGE_SIZE = 800;
const JPEG_QUALITY = 0.7;

const resizeImage = (base64Str) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > MAX_IMAGE_SIZE) {
        height *= MAX_IMAGE_SIZE / width;
        width = MAX_IMAGE_SIZE;
      } else if (height > MAX_IMAGE_SIZE) {
        width *= MAX_IMAGE_SIZE / height;
        height = MAX_IMAGE_SIZE;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
  });
};

const processAvatar = async (avatarData) => {
  if (!avatarData || !avatarData.startsWith('data:image')) {
    return null;
  }

  try {
    const optimizedImage = await resizeImage(avatarData);
    const base64Data = optimizedImage.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArray = new Uint8Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    
    return new Blob([byteArray], { type: 'image/jpeg' });
  } catch (error) {
    console.error('Error processing avatar:', error);
    throw new Error('Failed to process avatar image');
  }
};

export const getUsers = async (search = '') => {
  try {
    console.log('Fetching users with headers:', getAuthHeaders());
    const response = await axios.get(API_URL, {
      params: { search },
      ...getAuthHeaders()
    });
    
    // Process the response
    const rawUsers = response.data?.users || response.data || [];
    console.log('Raw users response:', rawUsers);
    
    const users = Array.isArray(rawUsers) ? rawUsers : [];
    return users.map(user => {
      // Ensure last_login is properly formatted
      let last_login = null;
      if (user.last_login) {
        try {
          const date = new Date(user.last_login);
          if (!isNaN(date.getTime())) {
            last_login = date.toISOString();
          }
        } catch (e) {
          console.error('Error parsing last_login for user:', user.id, e);
        }
      }
      
      return {
        ...user,
        last_login
      };
    });
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error);
    throw error;
  }
};

export const getUserCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/statistics/users/count`, getAuthHeaders());
    return response.data.count;
  } catch (error) {
    console.error('Error getting user count:', error.response?.data || error);
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error.response?.data || error);
    throw error;
  }
};

export const updateUserAvatar = async (id, avatarData) => {
  try {
    const blob = await processAvatar(avatarData);
    if (!blob) return null;

    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.jpg');

    const response = await axios.put(`${API_URL}/${id}/avatar`, formData, {
      headers: {
        ...getAuthHeaders().headers,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating avatar:', error.response?.data || error);
    throw error;
  }
};

export const createUser = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        ...getAuthHeaders(false).headers
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    console.log('Updating user with data:', userData);
    const formData = new FormData();
    
    // Add all fields from userData except avatar
    for (let [key, value] of userData.entries()) {
      if (key !== 'avatar') {
        formData.append(key, value);
      }
    }
    
    // Handle avatar separately
    const avatarFile = userData.get('avatar');
    if (avatarFile instanceof Blob) {
      // If it's already a blob/file, use it directly
      formData.append('avatar', avatarFile, 'avatar.jpg');
    }

    console.log('Sending form data to server:', {
      id,
      formDataKeys: Array.from(formData.keys()),
      hasAvatar: formData.has('avatar'),
      removeAvatar: formData.get('removeAvatar')
    });

    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        ...getAuthHeaders(false).headers
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.response?.data || error);
    throw error;
  }
};

export const updateUserStatus = async (id, status) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/status`, { status }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error.response?.data || error);
    throw error;
  }
};

