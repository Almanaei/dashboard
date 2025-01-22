import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';
import { useProjects } from '../context/ProjectContext';

const NewProject = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { createProject } = useProjects();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [project, setProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: ''
  });

  const handleChange = (field) => (event) => {
    setProject(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      ...project,
      budget: parseFloat(project.budget)
    };
    createProject(newProject);
    setSnackbar({
      open: true,
      message: t('projectCreated'),
      severity: 'success'
    });
    setTimeout(() => {
      navigate('/projects');
    }, 1000);
  };

  return (
    <Box sx={{ 
      p: 3,
      pt: !isRTL ? 10 : 3,
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <Typography variant="h4" gutterBottom>
        {t('newProject')}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('name')}
                value={project.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('description')}
                value={project.description}
                onChange={handleChange('description')}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label={t('status')}
                value={project.status}
                onChange={handleChange('status')}
                required
              >
                <MenuItem value="planning">{t('planning')}</MenuItem>
                <MenuItem value="in_progress">{t('inProgress')}</MenuItem>
                <MenuItem value="completed">{t('completed')}</MenuItem>
                <MenuItem value="on_hold">{t('onHold')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label={t('priority')}
                value={project.priority}
                onChange={handleChange('priority')}
                required
              >
                <MenuItem value="low">{t('low')}</MenuItem>
                <MenuItem value="medium">{t('medium')}</MenuItem>
                <MenuItem value="high">{t('high')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('startDate')}
                type="date"
                value={project.startDate}
                onChange={handleChange('startDate')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('endDate')}
                type="date"
                value={project.endDate}
                onChange={handleChange('endDate')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('budget')}
                type="number"
                value={project.budget}
                onChange={handleChange('budget')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/projects')}>
                  {t('cancel')}
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {t('create')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewProject;
