import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        {t('unauthorized')}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center">
        {t('noPermissionToAccess')}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/')}
      >
        {t('backToDashboard')}
      </Button>
    </Box>
  );
};

export default Unauthorized;
