import axios from 'axios';

const API_URL = 'http://localhost:5005/api/reports';

export const getReports = async (search = '') => {
  try {
    const response = await axios.get(API_URL, {
      params: { search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};

export const addReport = async (report) => {
  try {
    const formData = new FormData();
    formData.append('title', report.title);
    formData.append('content', report.content);
    formData.append('address', report.address || '');
    formData.append('date', report.date);
    formData.append('time', report.time);
    formData.append('userId', report.userId);
    formData.append('userName', report.userName);

    // Append attachments if any
    if (report.attachments) {
      report.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};

export const updateReport = async (report) => {
  try {
    const formData = new FormData();
    formData.append('title', report.title);
    formData.append('content', report.content);
    formData.append('address', report.address || '');
    formData.append('date', report.date);
    formData.append('time', report.time);
    formData.append('userId', report.userId);
    formData.append('userName', report.userName);

    if (report.attachments) {
      report.attachments.forEach(file => {
        if (file instanceof File) {
          formData.append('attachments', file);
        }
      });
    }

    const response = await axios.put(`${API_URL}/${report.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

export const deleteReport = async (reportId) => {
  try {
    await axios.delete(`${API_URL}/${reportId}`);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

export const generatePDF = async (reportId) => {
  try {
    const response = await axios.get(`${API_URL}/${reportId}/pdf`, {
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
    console.error('Error generating PDF:', error);
    throw error;
  }
};
