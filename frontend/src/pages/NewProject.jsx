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
import { useAuth } from '../context/AuthContext';

// Configure date adapter locale and format
const adapterLocale = {
  formats: {
    keyboardDate: 'MMM d, yyyy',
    shortDate: 'MMM d, yyyy',
    normalDate: 'MMM d, yyyy',
    fullDate: 'MMM d, yyyy',
  }
};

const NewProject = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { createProject } = useProjects();
  const { user: authUser } = useAuth();
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
    start_date: null,
    end_date: null,
    budget: '',
    progress: 0
  });

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
      const utcDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0, 0
      ));

      setProject(prev => ({
        ...prev,
        [field]: utcDate.toISOString()
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
      // Format the project data
      const newProject = {
        ...project,
        budget: project.budget ? parseFloat(project.budget) : undefined,
        // No need for additional date formatting since we're already storing ISO strings
      };
      
      // Remove empty fields
      Object.keys(newProject).forEach(key => {
        if (newProject[key] === undefined || newProject[key] === '') {
          delete newProject[key];
        }
      });

      console.log('Creating project with data:', newProject);
      await createProject(newProject);
      setSnackbar({
        open: true,
        message: t('projectCreated'),
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/projects');
      }, 1000);
    } catch (error) {
      console.error('Error creating project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.message || t('error'),
        severity: 'error'
      });
    }
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                  minDate={project.start_date ? new Date(project.start_date) : new Date()}
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
          </LocalizationProvider>
        </form>
      </Paper>

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
