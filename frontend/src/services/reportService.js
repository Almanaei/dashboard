import axios from 'axios';

const API_URL = 'http://localhost:5005/api/reports';

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

export const getReports = async (search = '') => {
  try {
    const headers = getAuthHeaders();
    console.log('Fetching reports with headers:', headers);
    
    const response = await axios.get(API_URL, {
      params: { search },
      headers: headers
    });
    
    console.log('Raw API response:', response.data);
    
    // Check if response.data is an array (old format) or object with reports property (new format)
    const reports = Array.isArray(response.data) ? response.data : 
                   response.data.reports ? response.data.reports : [];
    
    console.log('Processed reports:', reports);
    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error.response?.data || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reports');
  }
};

export const addReport = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create report');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in addReport:', error);
    throw error;
  }
};

export const updateReport = async (reportId, formData) => {
  try {
    const headers = getAuthHeaders();
    
    // Validate form data
    if (!formData) {
      throw new Error('No form data provided');
    }

    // Validate files
    const files = formData.getAll('attachments');
    if (files.length > 0) {
      files.forEach((file, index) => {
        if (!(file instanceof File)) {
          throw new Error(`Invalid attachment at index ${index}: not a file`);
        }

        if (!file.name) {
          throw new Error(`Invalid attachment at index ${index}: missing filename`);
        }

        if (!file.type) {
          throw new Error(`Invalid attachment at index ${index}: missing file type`);
        }

        if (!file.size) {
          throw new Error(`Invalid attachment at index ${index}: missing file size`);
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} exceeds maximum size of 5MB`);
        }

        // Check file type
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File type not allowed for ${file.name}: ${file.type}`);
        }
      });
    }

    // Log validated form data
    console.log('Sending validated form data:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, {
          name: value.name,
          type: value.type,
          size: value.size
        });
      } else {
        console.log(`${key}:`, value);
      }
    }

    // Set up request configuration
    const config = {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000 // 30 second timeout
    };

    // Send request
    const response = await axios.put(`${API_URL}/${reportId}`, formData, config);

    // Validate response
    if (!response.data) {
      throw new Error('No data received from server');
    }

    // Validate attachments in response
    if (response.data.attachments) {
      response.data.attachments.forEach(attachment => {
        if (!attachment.name || !attachment.url) {
          console.warn('Attachment missing required fields:', attachment);
        }
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error updating report:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication failed. Please log in again.');
    }

    if (error.response?.status === 413) {
      throw new Error('File size too large. Please reduce the size of your attachments.');
    }

    if (error.response?.status === 415) {
      throw new Error('Unsupported file type. Please check your attachments.');
    }

    // Handle attachment-specific errors
    if (error.message.includes('notNull Violation') && error.message.includes('ReportAttachment')) {
      throw new Error('Failed to process attachments. Please try again or contact support.');
    }

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    if (error.message.includes('timeout')) {
      throw new Error('Request timed out. Please try again.');
    }

    if (error.message.includes('Network Error')) {
      throw new Error('Network error. Please check your connection and try again.');
    }

    throw new Error(error.message || 'Failed to update report. Please try again.');
  }
};

export const deleteReport = async (reportId) => {
  try {
    const headers = getAuthHeaders();
    console.log('Deleting report with auth token:', headers.Authorization);
    
    const response = await axios.delete(`${API_URL}/${reportId}`, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Authentication error: Token might be invalid or expired');
      // Clear invalid token
      localStorage.removeItem('token');
    }
    console.error('Error deleting report:', error.response?.data || error);
    throw error;
  }
};

export const generatePDF = async (reportId) => {
  try {
    const headers = getAuthHeaders();
    console.log('Generating PDF with auth token:', headers.Authorization);
    
    const response = await axios.get(`${API_URL}/${reportId}/pdf`, {
      headers: headers,
      responseType: 'blob'
    });
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${reportId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Authentication error: Token might be invalid or expired');
      // Clear invalid token
      localStorage.removeItem('token');
    }
    console.error('Error generating PDF:', error.response?.data || error);
    throw error;
  }
};

export const getReportById = async (reportId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/${reportId}`, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching report:', error.response?.data || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication failed. Please log in again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Report not found or has been deleted');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch report');
  }
};
