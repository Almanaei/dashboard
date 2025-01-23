import axios from 'axios';

const API_URL = 'http://localhost:5005/api/users';

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
    const response = await axios.get(API_URL, {
      params: { search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error);
    throw error;
  }
};

export const getUserCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/count`);
    return response.data.count;
  } catch (error) {
    console.error('Error fetching user count:', error.response?.data || error);
    return 0;
  }
};

export const getUser = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error.response?.data || error);
    throw error;
  }
};

export const updateUserAvatar = async (id, avatarData) => {
  try {
    const avatarBlob = await processAvatar(avatarData);
    if (!avatarBlob) {
      return null;
    }

    const formData = new FormData();
    formData.append('avatar', avatarBlob, 'avatar.jpg');

    const response = await axios.put(`${API_URL}/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating avatar:', error.response?.data || error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const { avatar, ...userDataWithoutAvatar } = userData;
    
    // First create user without avatar
    const response = await axios.post(API_URL, userDataWithoutAvatar);
    const createdUser = response.data;

    // Then update avatar if provided
    if (avatar) {
      try {
        await updateUserAvatar(createdUser.id, avatar);
      } catch (avatarError) {
        console.error('Error uploading avatar:', avatarError);
        // Continue even if avatar upload fails
      }
    }

    return createdUser;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const { avatar, ...userDataWithoutAvatar } = userData;
    
    // First update user data
    const response = await axios.put(`${API_URL}/${id}`, userDataWithoutAvatar);
    const updatedUser = response.data;

    // Then update avatar if provided
    if (avatar) {
      try {
        await updateUserAvatar(id, avatar);
      } catch (avatarError) {
        console.error('Error uploading avatar:', avatarError);
        // Continue even if avatar upload fails
      }
    }

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting user:', error.response?.data || error);
    throw error;
  }
};

export const updateUserStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error.response?.data || error);
    throw error;
  }
};
