import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

const Security = () => {
  const { isDarkMode } = useTheme();
  const { t, isRTL } = useLanguage();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: t('passwordsDoNotMatch'),
        severity: 'error'
      });
      return;
    }
    // TODO: Implement password change logic
    setSnackbar({
      open: true,
      message: t('passwordChanged'),
      severity: 'success'
    });
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleTwoFactorToggle = () => {
    // TODO: Implement 2FA toggle logic
    const newValue = !formData.twoFactorEnabled;
    setFormData({ ...formData, twoFactorEnabled: newValue });
    setSnackbar({
      open: true,
      message: newValue ? t('twoFactorEnabled') : t('twoFactorDisabled'),
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Typography variant="h4" gutterBottom>
        {t('security')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('changePassword')}
        </Typography>
        <Box component="form" onSubmit={handlePasswordChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="password"
            label={t('currentPassword')}
            value={formData.currentPassword}
            onChange={handleChange('currentPassword')}
            required
          />
          <TextField
            type="password"
            label={t('newPassword')}
            value={formData.newPassword}
            onChange={handleChange('newPassword')}
            required
          />
          <TextField
            type="password"
            label={t('confirmPassword')}
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            required
          />
          <Box>
            <Button type="submit" variant="contained">
              {t('changePassword')}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          {t('twoFactorAuth')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.twoFactorEnabled}
                onChange={handleTwoFactorToggle}
              />
            }
            label={t('enableTwoFactor')}
          />
          <Typography variant="body2" color="text.secondary">
            {t('twoFactorDescription')}
          </Typography>
        </Box>
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

export default Security;
