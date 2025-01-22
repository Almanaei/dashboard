import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  MenuItem
} from '@mui/material';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    timezone: 'UTC+3'
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({ ...settings, [name]: value });
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    setSnackbar({
      open: true,
      message: t('languageChanged'),
      severity: 'success'
    });
  };

  const handleSave = () => {
    setSnackbar({
      open: true,
      message: t('settingsSaved'),
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Typography variant="h4" gutterBottom>
        {t('settings')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('appearance')}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
            />
          }
          label={t('darkMode')}
        />

        <Box sx={{ mt: 3 }}>
          <TextField
            select
            label={t('language')}
            value={language}
            onChange={handleLanguageChange}
            fullWidth
            sx={{
              textAlign: isRTL ? 'right' : 'left',
              '& .MuiSelect-select': {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">العربية</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('notifications')}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications}
              onChange={handleChange('notifications')}
            />
          }
          label={t('enableNotifications')}
        />
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange('emailNotifications')}
                disabled={!settings.notifications}
              />
            }
            label={t('emailNotifications')}
          />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
        >
          {t('saveChanges')}
        </Button>
      </Box>

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

export default Settings;
