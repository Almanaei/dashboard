import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Snackbar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useLanguage } from '@/context/LanguageContext';

const BackupRestore = () => {
  const { t, isRTL } = useLanguage();
  
  const [backups, setBackups] = useState([
    { id: 1, date: '2025-01-21', size: '2.5 MB' },
    { id: 2, date: '2025-01-20', size: '2.3 MB' }
  ]);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleBackup = async () => {
    setLoading(true);
    try {
      // TODO: Implement backup logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      const newBackup = {
        id: backups.length + 1,
        date: new Date().toISOString().split('T')[0],
        size: '2.4 MB'
      };
      setBackups([newBackup, ...backups]);
      setSnackbar({
        open: true,
        message: t('backupCreated'),
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('backupError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId) => {
    setLoading(true);
    try {
      // TODO: Implement restore logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      setSnackbar({
        open: true,
        message: t('restoreComplete'),
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('restoreError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (backupId) => {
    try {
      // TODO: Implement delete logic
      setBackups(backups.filter(backup => backup.id !== backupId));
      setSnackbar({
        open: true,
        message: t('backupDeleted'),
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('deleteError'),
        severity: 'error'
      });
    }
  };

  const handleDownload = async (backupId) => {
    try {
      // TODO: Implement download logic
      setSnackbar({
        open: true,
        message: t('backupDownloaded'),
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('downloadError'),
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Typography variant="h4" gutterBottom>
        {t('backup')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={handleBackup}
            disabled={loading}
          >
            {t('createBackup')}
          </Button>
        </Box>

        {loading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        <Typography variant="h6" gutterBottom>
          {t('availableBackups')}
        </Typography>

        <List>
          {backups.map((backup) => (
            <ListItem key={backup.id} divider>
              <ListItemText
                primary={t('backupFromDate', { date: backup.date })}
                secondary={t('backupSize', { size: backup.size })}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="restore"
                  onClick={() => handleRestore(backup.id)}
                  disabled={loading}
                  sx={{ mr: 1 }}
                  title={t('restore')}
                >
                  <RestoreIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="download"
                  onClick={() => handleDownload(backup.id)}
                  disabled={loading}
                  sx={{ mr: 1 }}
                  title={t('download')}
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(backup.id)}
                  disabled={loading}
                  title={t('delete')}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BackupRestore;
