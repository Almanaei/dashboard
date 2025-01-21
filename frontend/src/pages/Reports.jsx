import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { getReports, addReport, updateReport, deleteReport } from '../services/reportService';

const Reports = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [attachments, setAttachments] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getReports();
        setReports(data);
        setError(null);
      } catch (err) {
        setError('Failed to load reports');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleOpen = (report = null) => {
    if (report) {
      setEditingReport(report);
      setTitle(report.title);
      setContent(report.content);
      setSelectedDate(new Date(report.date));
      setSelectedTime(new Date(`2024-01-01T${report.time}`));
      setAttachments(report.attachments || []);
    } else {
      setEditingReport(null);
      setTitle('');
      setContent('');
      setSelectedDate(new Date());
      setSelectedTime(new Date());
      setAttachments([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTitle('');
    setContent('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setAttachments([]);
    setEditingReport(null);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => {
      // Store the actual file object for upload
      return {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: URL.createObjectURL(file)
      };
    });
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveFile = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
  };

  const handleSubmit = async () => {
    if (title && content) {
      setLoading(true);
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const formattedTime = selectedTime.toTimeString().slice(0, 5);

        const reportData = {
          title,
          content,
          date: formattedDate,
          time: formattedTime,
          // Send only the file objects for upload
          attachments: attachments.map(att => att.file)
        };

        if (editingReport) {
          await updateReport({ ...reportData, id: editingReport.id });
        } else {
          await addReport(reportData);
        }

        const updatedReports = await getReports();
        setReports(updatedReports);
        setError(null);
        handleClose();
      } catch (err) {
        setError('Failed to save report');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (reportToDelete) {
      setLoading(true);
      try {
        await deleteReport(reportToDelete.id);
        const updatedReports = await getReports();
        setReports(updatedReports);
        setError(null);
        setDeleteConfirmOpen(false);
        setReportToDelete(null);
      } catch (err) {
        setError('Failed to delete report');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setReportToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box sx={{ 
          bgcolor: '#ffebee', 
          color: '#c62828', 
          p: 2, 
          borderRadius: 1,
          mb: 2 
        }}>
          {error}
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Reports</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            bgcolor: '#2196f3',
            '&:hover': {
              bgcolor: '#1976d2'
            }
          }}
        >
          New Report
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Content</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Attachments</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.title}</TableCell>
                <TableCell>{report.content}</TableCell>
                <TableCell>
                  {report.date} {report.time}
                </TableCell>
                <TableCell>
                  {report.attachments?.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {report.attachments.map((file, index) => (
                        <Chip
                          key={index}
                          label={`${getFileIcon(file.name)} ${file.name}`}
                          size="small"
                          sx={{ maxWidth: 150 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#2196f3', mr: 1 }}
                    onClick={() => handleOpen(report)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#f44336' }}
                    onClick={() => handleDeleteClick(report)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingReport ? 'Edit Report' : 'New Report'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={setSelectedDate}
                sx={{ flex: 1 }}
              />
              <TimePicker
                label="Time"
                value={selectedTime}
                onChange={setSelectedTime}
                sx={{ flex: 1 }}
              />
            </Box>
          </LocalizationProvider>

          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              multiple
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                sx={{ mb: 2 }}
              >
                Attach Files
              </Button>
            </label>

            {attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {attachments.map((file, index) => (
                  <Chip
                    key={index}
                    icon={getFileIcon(file.type)}
                    label={`${file.name} (${formatFileSize(file.size)})`}
                    onDelete={() => handleRemoveFile(index)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} sx={{ color: '#666666' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              bgcolor: '#2196f3',
              '&:hover': {
                bgcolor: '#1976d2'
              }
            }}
          >
            {editingReport ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete Report
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{reportToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteCancel} sx={{ color: '#666666' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained" 
            sx={{
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
