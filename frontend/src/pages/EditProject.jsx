import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useLanguage } from '../context/LanguageContext';
import { useProjects } from '../context/ProjectContext';
import { enUS } from 'date-fns/locale';

const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const { getProjectById, updateProject } = useProjects();
  const [project, setProject] = useState({
    name: '',
    description: '',
    status: '',
    priority: '',
    start_date: null,
    end_date: null,
    progress: 0,
    budget: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const existingProject = getProjectById(id);
    console.log('Existing project:', existingProject);
    if (existingProject) {
      // Ensure dates are properly formatted
      const formattedProject = {
        ...existingProject,
        start_date: existingProject.start_date ? new Date(existingProject.start_date).toISOString() : null,
        end_date: existingProject.end_date ? new Date(existingProject.end_date).toISOString() : null
      };
      console.log('Formatted project:', formattedProject);
      setProject(formattedProject);
    } else {
      navigate('/projects');
    }
  }, [id, getProjectById, navigate]);

  // Add debug logging for project state changes
  useEffect(() => {
    console.log('Project state updated:', project);
  }, [project]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProgressChange = (event, newValue) => {
    setProject(prev => ({
      ...prev,
      progress: newValue
    }));
  };

  const handleDateChange = (field) => (newDate) => {
    console.log(`Date change for ${field}:`, newDate);
    if (!newDate || isNaN(new Date(newDate).getTime())) {
      setProject(prev => ({
        ...prev,
        [field]: null
      }));
      return;
    }

    try {
      // Create a new date object at noon UTC
      const date = new Date(newDate);
      date.setHours(12, 0, 0, 0);
      
      setProject(prev => ({
        ...prev,
        [field]: date.toISOString()
      }));
    } catch (error) {
      console.error('Error processing date:', error);
      setProject(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate project name
      const name = project.name?.trim();
      if (!name || name.length < 3 || name.length > 100) {
        throw new Error('Project name must be between 3 and 100 characters');
      }
      if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
        throw new Error('Project name can only contain letters, numbers, spaces, hyphens, and underscores');
      }

      // Format the project data
      const updatedProject = {
        name,
        description: project.description?.trim() || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        start_date: project.start_date ? new Date(project.start_date).toISOString() : null,
        end_date: project.end_date ? new Date(project.end_date).toISOString() : null,
        budget: project.budget ? parseFloat(project.budget) : null,
        progress: parseInt(project.progress || 0)
      };

      // Validate dates
      if (updatedProject.start_date && updatedProject.end_date) {
        const startDate = new Date(updatedProject.start_date);
        const endDate = new Date(updatedProject.end_date);
        if (endDate < startDate) {
          throw new Error('End date must be after start date');
        }
      }
      
      console.log('Updating project with data:', { id, updatedProject });
      await updateProject(id, updatedProject);
      setSnackbar({
        open: true,
        message: t('projectUpdated'),
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/projects');
      }, 1000);
    } catch (error) {
      console.error('Error updating project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.message || t('error'),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ 
      p: 3,
      pt: !isRTL ? 10 : 3,
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <Typography variant="h4" gutterBottom>
        {t('editProject')}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <LocalizationProvider 
            dateAdapter={AdapterDateFns}
            adapterLocale={enUS}
            dateFormats={{
              keyboardDate: 'MM/dd/yyyy',
              shortDate: 'MMM d, yyyy',
              normalDate: 'MMM d, yyyy',
              fullDate: 'MMM d, yyyy'
            }}
          >
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
                <FormControl fullWidth>
                  <InputLabel>{t('status')}</InputLabel>
                  <Select
                    value={project.status}
                    onChange={handleChange('status')}
                    label={t('status')}
                    required
                  >
                    <MenuItem value="planning">{t('planning')}</MenuItem>
                    <MenuItem value="in_progress">{t('inProgress')}</MenuItem>
                    <MenuItem value="completed">{t('completed')}</MenuItem>
                    <MenuItem value="on_hold">{t('onHold')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('priority')}</InputLabel>
                  <Select
                    value={project.priority}
                    onChange={handleChange('priority')}
                    label={t('priority')}
                    required
                  >
                    <MenuItem value="low">{t('low')}</MenuItem>
                    <MenuItem value="medium">{t('medium')}</MenuItem>
                    <MenuItem value="high">{t('high')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label={t('startDate')}
                  value={project.start_date ? new Date(project.start_date) : null}
                  onChange={handleDateChange('start_date')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      inputProps: {
                        placeholder: 'MM/DD/YYYY'
                      }
                    }
                  }}
                  format="MM/dd/yyyy"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label={t('endDate')}
                  value={project.end_date ? new Date(project.end_date) : null}
                  onChange={handleDateChange('end_date')}
                  minDate={project.start_date ? new Date(project.start_date) : null}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      inputProps: {
                        placeholder: 'MM/DD/YYYY'
                      }
                    }
                  }}
                  format="MM/dd/yyyy"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  {t('progress')}
                </Typography>
                <Slider
                  value={project.progress}
                  onChange={handleProgressChange}
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
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
              <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/projects')}>
                  {t('cancel')}
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {t('save')}
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProject;
