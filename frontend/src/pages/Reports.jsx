import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  Link,
  Avatar,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { getReports, addReport, updateReport, deleteReport, generatePDF } from '../services/reportService';
import debounce from 'lodash.debounce';
import { useSearch } from '@/context/SearchContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

const Reports = () => {
  const API_URL = 'http://localhost:5005';
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { searchTerm } = useSearch();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    address: '',
    date: new Date(),
    time: new Date(),
    attachments: []
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    attachment: null
  });

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return undefined;
    
    console.log('Processing avatar path:', avatarPath);
    
    if (avatarPath.startsWith('data:')) return avatarPath;
    
    // If the path already starts with http://, return it as is
    if (avatarPath.startsWith('http://')) return avatarPath;
    
    // Clean up the path by removing any duplicate URL prefixes
    const cleanPath = avatarPath.replace(/^http:\/\/localhost:5005\//, '').replace(/^uploads\//, '');
    const finalUrl = `${API_URL}/uploads/${cleanPath}`;
    
    console.log('Final avatar URL:', finalUrl);
    return finalUrl;
  };

  useEffect(() => {
    console.log('Reports component mounted or search changed');
    fetchReports();
  }, [searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching reports...');
      const data = await getReports();
      console.log('Reports data received:', data);
      setReports(Array.isArray(data) ? data : []);
      console.log('Reports state updated:', Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(t('failedToFetchReports'));
      setReports([]); // Reset reports on error
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setSelectedReport(null);
    setFormData({
      title: '',
      content: '',
      address: '',
      date: new Date(),
      time: new Date(),
      attachments: []
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedReport(null);
  };

  const handleEdit = (report) => {
    console.log('Editing report:', report);
    setEditMode(true);
    setSelectedReport(report);
    setFormData({
      title: report.title,
      content: report.content,
      date: new Date(report.date),
      time: new Date(`2025-01-25T${report.time}`),
      address: report.address,
      attachments: Array.isArray(report.attachments) ? [...report.attachments] : []
    });
    setOpen(true);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
  };

  const handleTimeChange = (newTime) => {
    if (!newTime) return;
    
    const date = new Date(newTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const updatedTime = new Date();
    updatedTime.setHours(hours);
    updatedTime.setMinutes(minutes);
    updatedTime.setSeconds(0);
    updatedTime.setMilliseconds(0);
    
    setFormData(prev => ({
      ...prev,
      time: updatedTime
    }));
  };

  const handleFileChange = (event) => {
    try {
      const files = Array.from(event.target.files);
      
      // Validate file size (max 5MB per file)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      const invalidFiles = files.filter(file => file.size > maxSize);
      
      if (invalidFiles.length > 0) {
        setError(t('fileSizeExceedsLimit', { maxSize: '5MB' }));
        setSnackbar({
          open: true,
          message: t('fileSizeExceedsLimit', { maxSize: '5MB' }),
          severity: 'error'
        });
        return;
      }

      // Validate file types
      const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const invalidTypeFiles = files.filter(file => !allowedTypes.some(type => file.type.startsWith(type)));

      if (invalidTypeFiles.length > 0) {
        setError(t('invalidFileType'));
        setSnackbar({
          open: true,
          message: t('invalidFileType'),
          severity: 'error'
        });
        return;
      }

      // Add files to form data
      setFormData(prev => {
        const newAttachments = [...(prev.attachments || []), ...files];
        console.log('Updated attachments after adding files:', newAttachments);
        return {
          ...prev,
          attachments: newAttachments
        };
      });

      // Clear any previous errors
      setError(null);
      
      // Clear the file input
      event.target.value = '';
    } catch (err) {
      console.error('Error handling file upload:', err);
      setError(t('errorUploadingFile'));
      setSnackbar({
        open: true,
        message: t('errorUploadingFile'),
        severity: 'error'
      });
    }
  };

  const handleRemoveFile = (index) => {
    console.log('Removing file at index:', index);
    console.log('Current attachments:', formData.attachments);
    
    setFormData(prevFormData => {
      // Get the file being removed
      const fileToRemove = prevFormData.attachments[index];
      console.log('File being removed:', fileToRemove);
      
      // If it's an existing attachment, log its details
      if (fileToRemove && !(fileToRemove instanceof File)) {
        console.log('Removing existing attachment:', {
          id: fileToRemove.id,
          name: fileToRemove.originalName || fileToRemove.name,
          type: fileToRemove.mimeType
        });
      }
      
      // Remove the file from attachments array
      const updatedAttachments = prevFormData.attachments.filter((_, i) => i !== index);
      console.log('Updated attachments array:', updatedAttachments);
      
      return {
        ...prevFormData,
        attachments: updatedAttachments
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.title || !formData.content || !formData.date || !formData.time || !formData.address) {
        throw new Error(t('pleaseCompleteAllRequiredFields'));
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('date', format(formData.date, 'yyyy-MM-dd'));
      formDataToSend.append('time', format(formData.time, 'HH:mm:ss'));
      formDataToSend.append('address', formData.address || '');

      // Handle attachments for update
      if (editMode) {
        // Get existing attachments (not File objects)
        const existingAttachments = formData.attachments.filter(file => !(file instanceof File));
        
        // Get IDs of attachments to keep
        const attachmentsToKeep = existingAttachments.map(file => file.id.toString());
        
        // Always send an array of IDs, even if empty
        formDataToSend.append('attachmentsToKeep', JSON.stringify(attachmentsToKeep));
      }

      // Handle new file attachments
      const newFiles = formData.attachments.filter(file => file instanceof File);
      
      // Validate files before appending
      for (const file of newFiles) {
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error(t('fileSizeExceedsLimit', { maxSize: '5MB', filename: file.name }));
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
          throw new Error(t('fileTypeNotAllowed', { filename: file.name, type: file.type }));
        }

        formDataToSend.append('attachments', file);
      }

      let response;
      if (editMode && selectedReport) {
        try {
          response = await updateReport(selectedReport.id, formDataToSend);
          
          // Update the reports list with the new data
          setReports(prevReports => {
            return prevReports.map(r => {
              if (r.id === response.id) {
                return {
                  ...response,
                  attachments: response.attachments || [],
                  user: response.user || r.user // Preserve user info if not in response
                };
              }
              return r;
            });
          });

          // Update selected report and form data
          setSelectedReport(response);
          setFormData(prev => ({
            ...prev,
            attachments: response.attachments || []
          }));

          setSnackbar({
            open: true,
            message: t('reportUpdated'),
            severity: 'success'
          });

          handleClose();
        } catch (err) {
          setError(err.message);
          setSnackbar({
            open: true,
            message: err.message,
            severity: 'error'
          });
        }
      } else {
        try {
          response = await addReport(formDataToSend);
          setReports(prevReports => [{
            ...response,
            attachments: response.attachments || []
          }, ...prevReports]);

          setSnackbar({
            open: true,
            message: t('reportCreated'),
            severity: 'success'
          });

          handleClose();
        } catch (err) {
          setError(err.message);
          setSnackbar({
            open: true,
            message: err.message,
            severity: 'error'
          });
        }
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err.message || t('failedToSubmitReport'));
      setSnackbar({
        open: true,
        message: err.message || t('failedToSubmitReport'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (report) => {
    try {
      await deleteReport(report.id);
      setSnackbar({
        open: true,
        message: t('reportDeletedSuccessfully'),
        severity: 'success'
      });
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      setSnackbar({
        open: true,
        message: t('failedToDeleteReport'),
        severity: 'error'
      });
    }
  };

  const handleGeneratePDF = async (report) => {
    try {
      await generatePDF(report.id);
      setSnackbar({
        open: true,
        message: t('pdfGeneratedSuccessfully'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbar({
        open: true,
        message: t('failedToGeneratePDF'),
        severity: 'error'
      });
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), isRTL ? 'dd/MM/yyyy' : 'MM/dd/yyyy', { locale: isRTL ? arSA : undefined });
  };

  const formatTime = (time) => {
    // Handle time string from backend (HH:mm:ss)
    if (typeof time === 'string' && time.includes(':')) {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, isRTL ? 'HH:mm' : 'hh:mm a', { locale: isRTL ? arSA : undefined });
    }
    // Handle Date object (for form inputs)
    if (time instanceof Date) {
      return format(time, isRTL ? 'HH:mm' : 'hh:mm a', { locale: isRTL ? arSA : undefined });
    }
    return '';
  };

  const handlePreviewAttachment = (attachment) => {
    console.log('Previewing attachment:', attachment);
    
    // Ensure we have a valid URL by properly constructing it
    const fileUrl = attachment.url.startsWith('http') 
      ? attachment.url 
      : `${API_URL}${attachment.url}`;
    
    console.log('Opening file URL:', fileUrl);
    
    // For images and PDFs, show in dialog
    if (attachment.mimeType?.startsWith('image/') || attachment.mimeType === 'application/pdf') {
      setPreviewDialog({
        open: true,
        attachment: { 
          ...attachment, 
          fullUrl: fileUrl,
          downloadUrl: fileUrl
        }
      });
    } else {
      // For other files, trigger download
      window.open(fileUrl, '_blank');
    }
  };

  const handleClosePreview = () => {
    setPreviewDialog({
      open: false,
      attachment: null
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: 3,
        pt: !isRTL ? 10 : 3,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 3,
        pt: !isRTL ? 10 : 3
      }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchReports}>
              {t('retry')}
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      pt: !isRTL ? 10 : 3,
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">{t('reports')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          {t('newReport')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t('title')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('content')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('address')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('dateAndTime')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('attachments')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('createdBy')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DescriptionIcon color="primary" />
                    <Typography variant="body1">{report.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {report.content}
                  </Typography>
                </TableCell>
                <TableCell>{report.address}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{formatDate(report.date)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(report.time)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {report.attachments?.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {report.attachments.map((attachment, index) => {
                        const FileIcon = getFileIcon(attachment.mimeType);
                        return (
                          <Tooltip key={index} title={attachment.originalName || attachment.filename}>
                            <IconButton 
                              size="small"
                              onClick={() => handlePreviewAttachment(attachment)}
                            >
                              <FileIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {t('noAttachments')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={report.user?.avatar ? getAvatarUrl(report.user.avatar) : undefined}
                      alt={report.user?.name}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: 'primary.main'
                      }}
                    >
                      {report.user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {report.user?.name || t('unknown')}
                      </Typography>
                      {report.user?.email && (
                        <Typography variant="caption" color="text.secondary">
                          {report.user.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(report)}
                      disabled={user.role.toLowerCase() !== 'admin' && report.user?.id !== user.id}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(report)}
                      disabled={user.role.toLowerCase() !== 'admin' && report.user?.id !== user.id}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleGeneratePDF(report)}
                    >
                      <PictureAsPdfIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Report Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <DialogTitle>
            {editMode ? t('editReport') : t('newReport')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label={t('title')}
                value={formData.title}
                onChange={handleInputChange('title')}
                fullWidth
                required
              />
              <TextField
                label={t('content')}
                value={formData.content}
                onChange={handleInputChange('content')}
                multiline
                rows={4}
                fullWidth
                required
              />
              <TextField
                label={t('address')}
                value={formData.address}
                onChange={handleInputChange('address')}
                fullWidth
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={isRTL ? arSA : undefined}>
                    <DatePicker
                      label={t('date')}
                      value={formData.date}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={isRTL ? arSA : undefined}>
                    <TimeField
                      label={t('time')}
                      value={formData.time}
                      onChange={handleTimeChange}
                      format="HH:mm"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
              <Box>
                <input
                  type="file"
                  id="attachments"
                  name="attachments"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <label htmlFor="attachments">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFileIcon />}
                  >
                    {t('attachFiles')}
                  </Button>
                </label>
                {formData.attachments?.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.attachments.map((file, index) => {
                      // Handle both new File objects and existing server attachments
                      const isNewFile = file instanceof File;
                      const FileIcon = getFileIcon(isNewFile ? file.type : file.mimeType);
                      const fileName = isNewFile ? file.name : file.originalName || file.filename;
                      const fileSize = isNewFile ? formatFileSize(file.size) : formatFileSize(file.size);
                      
                      return (
                        <Chip
                          key={index}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption">{fileName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({fileSize})
                              </Typography>
                            </Box>
                          }
                          onDelete={() => handleRemoveFile(index)}
                          icon={<FileIcon fontSize="small" />}
                          sx={{ maxWidth: '300px' }}
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('cancel')}</Button>
            <Button 
              type="submit"
              variant="contained" 
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {editMode ? t('update') : t('create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewDialog.attachment?.originalName || previewDialog.attachment?.filename || t('preview')}
        </DialogTitle>
        <DialogContent>
          {previewDialog.attachment ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px',
              bgcolor: 'background.default'
            }}>
              {previewDialog.attachment.mimeType?.startsWith('image/') ? (
                <img
                  src={previewDialog.attachment.fullUrl}
                  alt={previewDialog.attachment.originalName || previewDialog.attachment.filename}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              ) : previewDialog.attachment.mimeType === 'application/pdf' ? (
                <iframe
                  src={previewDialog.attachment.fullUrl}
                  width="100%"
                  height="600px"
                  title={previewDialog.attachment.originalName || previewDialog.attachment.filename}
                  style={{ border: 'none' }}
                />
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" gutterBottom>
                    {t('fileCannotBePreviewedDirectly')}
                  </Typography>
                  <Button
                    variant="contained"
                    href={previewDialog.attachment.fullUrl}
                    download
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(previewDialog.attachment.fullUrl, '_blank');
                    }}
                  >
                    {t('downloadFile')}
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">
                {t('noFileToPreview')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>{t('close')}</Button>
          {previewDialog.attachment && (
            <Button
              variant="contained"
              onClick={() => window.open(previewDialog.attachment.fullUrl, '_blank')}
            >
              {t('download')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
