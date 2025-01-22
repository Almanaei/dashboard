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
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { getReports, addReport, updateReport, deleteReport, generatePDF } from '../services/reportService';
import debounce from 'lodash.debounce';
import { useSearch } from '@/context/SearchContext';
import { useLanguage } from '@/context/LanguageContext';

const Reports = () => {
  const { t, isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { globalSearch } = useSearch();

  // Add debounce for search
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      setLoading(true);
      try {
        const data = await getReports(query);
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(globalSearch);
  }, [globalSearch]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getReports();
        setReports(data);
      } catch (err) {
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
      setAddress(report.address);
      setSelectedDate(new Date(report.date));
      setSelectedTime(report.time);
      setAttachments(report.attachments || []);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTitle('');
    setContent('');
    setAddress('');
    setSelectedDate(new Date());
    setSelectedTime('');
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
          address,
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
        handleClose();
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to save report',
          severity: 'error'
        });
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
        setDeleteConfirmOpen(false);
        setReportToDelete(null);
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete report',
          severity: 'error'
        });
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

  const handleOpenFile = (url) => {
    // Create full URL using backend URL
    const fullUrl = `http://localhost:5005${url}`;
    window.open(fullUrl, '_blank');
  };

  const handleGeneratePDF = async (report) => {
    try {
      await generatePDF(report.id);
      setSnackbar({
        open: true,
        message: 'PDF generated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to generate PDF',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      direction: isRTL ? 'rtl' : 'ltr',
      '& *': { fontFamily: isRTL ? 'Arial, sans-serif' : 'inherit' }
    }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          {t('reports')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={isRTL ? null : <AddIcon />}
          endIcon={isRTL ? <AddIcon /> : null}
          onClick={() => handleOpen()}
          sx={{
            minWidth: 140,
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          {t('newReport')}
        </Button>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          width: '100%',
          overflowX: 'auto',
          direction: isRTL ? 'rtl' : 'ltr',
          boxShadow: 3,
          borderRadius: 2,
          '& .MuiTableCell-root': {
            borderColor: 'divider',
            py: 2,
            px: 2
          }
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  textAlign: isRTL ? 'right' : 'left',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('reportTitle')}
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  textAlign: isRTL ? 'right' : 'left'
                }}
              >
                {t('reportContent')}
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  textAlign: isRTL ? 'right' : 'left',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('reportAddress')}
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  textAlign: isRTL ? 'right' : 'left',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('reportDateAndTime')}
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  textAlign: isRTL ? 'right' : 'left'
                }}
              >
                {t('reportAttachments')}
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  textAlign: isRTL ? 'left' : 'right',
                  minWidth: '150px',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('reportActions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow 
                key={report.id}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'action.hover'
                  },
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <TableCell sx={{ 
                  textAlign: isRTL ? 'right' : 'left',
                  fontWeight: 'medium'
                }}>
                  {report.title}
                </TableCell>
                <TableCell sx={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {report.content}
                </TableCell>
                <TableCell sx={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {report.address}
                </TableCell>
                <TableCell sx={{ 
                  textAlign: isRTL ? 'right' : 'left',
                  whiteSpace: 'nowrap'
                }}>
                  {isRTL 
                    ? t('reportDateTime', { 
                        date: new Date(report.date).toLocaleDateString('ar-SA'),
                        time: report.time
                      })
                    : `${report.date} ${report.time}`
                  }
                </TableCell>
                <TableCell sx={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {report.attachments?.map((attachment, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mb: 1,
                        flexDirection: isRTL ? 'row-reverse' : 'row'
                      }}
                    >
                      <AttachFileIcon fontSize="small" />
                      <Typography variant="body2">
                        {`${attachment.name} (${(attachment.size / 1024).toFixed(2)} KB)`}
                      </Typography>
                    </Box>
                  ))}
                </TableCell>
                <TableCell align={isRTL ? 'left' : 'right'}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      justifyContent: isRTL ? 'flex-start' : 'flex-end',
                      '& .MuiIconButton-root': {
                        visibility: 'visible',
                        opacity: 1,
                        padding: 1
                      }
                    }}
                  >
                    <Tooltip title={t('downloadPdf')} placement={isRTL ? 'bottom-end' : 'bottom-start'}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleGeneratePDF(report)}
                        sx={{ 
                          color: 'primary.main',
                          backgroundColor: 'primary.lighter',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark'
                          }
                        }}
                      >
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('edit')} placement={isRTL ? 'bottom-end' : 'bottom-start'}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(report)}
                        sx={{ 
                          color: 'primary.main',
                          backgroundColor: 'primary.lighter',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark'
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')} placement={isRTL ? 'bottom-end' : 'bottom-start'}>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(report)}
                        sx={{ 
                          color: 'error.main',
                          backgroundColor: 'error.lighter',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.dark'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{ 
          '& .MuiDialog-paper': { 
            direction: isRTL ? 'rtl' : 'ltr',
            minWidth: { sm: '600px' }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold',
          backgroundColor: 'primary.main',
          color: 'white',
          px: 3
        }}>
          {editingReport ? t('editReport') : t('newReport')}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            pt: 2,
            '& .MuiFormLabel-root': {
              textAlign: isRTL ? 'right' : 'left',
              left: isRTL ? 'auto' : 12,
              right: isRTL ? 12 : 'auto',
              transformOrigin: isRTL ? 'right' : 'left'
            }
          }}>
            <TextField
              label={t('reportTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              sx={{ 
                '& .MuiInputBase-input': {
                  textAlign: isRTL ? 'right' : 'left'
                }
              }}
            />
            <TextField
              label={t('reportContent')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              rows={4}
              fullWidth
              required
              sx={{ 
                '& .MuiInputBase-input': {
                  textAlign: isRTL ? 'right' : 'left'
                }
              }}
            />
            <TextField
              label={t('reportAddress')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              required
              sx={{ 
                '& .MuiInputBase-input': {
                  textAlign: isRTL ? 'right' : 'left'
                }
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                flexDirection: isRTL ? 'row-reverse' : 'row'
              }}>
                <DatePicker
                  label={t('reportDate')}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth
                      sx={{ 
                        '& .MuiInputBase-input': {
                          textAlign: isRTL ? 'right' : 'left'
                        }
                      }}
                    />
                  )}
                />
                <TimePicker
                  label={t('reportTime')}
                  value={selectedTime}
                  onChange={setSelectedTime}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth
                      sx={{ 
                        '& .MuiInputBase-input': {
                          textAlign: isRTL ? 'right' : 'left'
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </LocalizationProvider>
            <input
              type="file"
              id="report-attachments"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="report-attachments">
              <Button
                component="span"
                variant="outlined"
                startIcon={isRTL ? null : <AttachFileIcon />}
                endIcon={isRTL ? <AttachFileIcon /> : null}
                sx={{
                  minWidth: 140,
                  fontWeight: 'medium'
                }}
              >
                {t('attachFiles')}
              </Button>
            </label>
            {attachments.map((file, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  px: 1
                }}
              >
                <AttachFileIcon fontSize="small" />
                <Typography variant="body2">
                  {`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          gap: 1,
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              minWidth: 100,
              color: 'text.secondary'
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ 
              minWidth: 100,
              fontWeight: 'medium'
            }}
          >
            {loading ? <CircularProgress size={24} /> : t(editingReport ? 'save' : 'create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        sx={{ 
          '& .MuiDialog-paper': { 
            direction: isRTL ? 'rtl' : 'ltr',
            minWidth: { sm: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold',
          backgroundColor: 'error.main',
          color: 'white',
          px: 3
        }}>
          {t('deleteReport')}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography>
            {t('deleteReportConfirmation', { title: reportToDelete?.title })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          gap: 1,
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ 
              minWidth: 100,
              color: 'text.secondary'
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{ 
              minWidth: 100,
              fontWeight: 'medium'
            }}
          >
            {loading ? <CircularProgress size={24} /> : t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
