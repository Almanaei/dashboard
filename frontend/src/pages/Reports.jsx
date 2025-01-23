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
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { getReports, addReport, updateReport, deleteReport, generatePDF } from '../services/reportService';
import debounce from 'lodash.debounce';
import { useSearch } from '@/context/SearchContext';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

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
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { globalSearch } = useSearch();

  useEffect(() => {
    fetchReports();
  }, [globalSearch]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return format(d, isRTL ? 'dd/MM/yyyy' : 'MM/dd/yyyy', { locale: isRTL ? arSA : undefined });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return format(new Date(`2000-01-01T${time}`), isRTL ? 'HH:mm' : 'hh:mm a', { locale: isRTL ? arSA : undefined });
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReports(globalSearch);
      setReports(data);
      setError(null);
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (report = null) => {
    if (report) {
      setEditingReport(report);
      setTitle(report.title);
      setContent(report.content);
      setAddress(report.address);
      setSelectedDate(new Date(report.date));
      setSelectedTime(report.time);
      setAttachments(report.attachments || []);
    } else {
      setEditingReport(null);
      setTitle('');
      setContent('');
      setAddress('');
      setSelectedDate(new Date());
      setSelectedTime('');
      setAttachments([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingReport(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('address', address);
    formData.append('date', format(selectedDate, 'yyyy-MM-dd'));
    formData.append('time', selectedTime);
    attachments.forEach(file => {
      if (file instanceof File) {
        formData.append('attachments', file);
      }
    });

    try {
      if (editingReport) {
        await updateReport(editingReport.id, formData);
      } else {
        await addReport(formData);
      }
      handleClose();
      fetchReports();
    } catch (error) {
      console.error('Error:', error);
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
        await fetchReports();
        setDeleteConfirmOpen(false);
        setReportToDelete(null);
        setSnackbar({
          open: true,
          message: t('reportDeletedSuccessfully'),
          severity: 'success'
        });
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: t('failedToDeleteReport'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
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

  const handleOpenFile = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
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
          onClick={() => handleOpen()}
        >
          {t('newReport')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t('title').charAt(0).toUpperCase() + t('title').slice(1)}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('content').charAt(0).toUpperCase() + t('content').slice(1)}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('address').charAt(0).toUpperCase() + t('address').slice(1)}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('dateAndTime').charAt(0).toUpperCase() + t('dateAndTime').slice(1)}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('attachments').charAt(0).toUpperCase() + t('attachments').slice(1)}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>{t('actions').charAt(0).toUpperCase() + t('actions').slice(1)}</TableCell>
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
                  {report.attachments && report.attachments.map((attachment, index) => (
                    <Chip
                      key={index}
                      icon={<AttachFileIcon />}
                      label={attachment.name}
                      size="small"
                      onClick={() => handleOpenFile(attachment.url)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title={t('generatePDF')}>
                      <IconButton
                        size="small"
                        onClick={() => handleGeneratePDF(report)}
                        color="primary"
                      >
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('edit')}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(report)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(report)}
                        color="error"
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

      {/* Create/Edit Report Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingReport ? t('editReport') : t('newReport')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label={t('title')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label={t('content')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label={t('address')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={isRTL ? arSA : undefined}>
                  <DatePicker
                    label={t('date')}
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={isRTL ? arSA : undefined}>
                  <TimePicker
                    label={t('time')}
                    value={selectedTime}
                    onChange={(newValue) => setSelectedTime(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <input
              type="file"
              multiple
              onChange={(e) => setAttachments([...e.target.files])}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
              >
                {t('attachFiles')}
              </Button>
            </label>
            {attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => {
                      const newAttachments = [...attachments];
                      newAttachments.splice(index, 1);
                      setAttachments(newAttachments);
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingReport ? t('save') : t('create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {reportToDelete && t('deleteReportConfirmation', { title: reportToDelete.title })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
