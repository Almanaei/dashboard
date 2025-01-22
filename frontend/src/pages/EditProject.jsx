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
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';
import { useProjects } from '../context/ProjectContext';

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
    startDate: '',
    endDate: '',
    progress: 0
  });

  useEffect(() => {
    const existingProject = getProjectById(parseInt(id));
    if (existingProject) {
      setProject(existingProject);
    } else {
      navigate('/projects');
    }
  }, [id, getProjectById, navigate]);

  const handleChange = (field) => (event) => {
    setProject(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleProgressChange = (event, newValue) => {
    setProject(prev => ({
      ...prev,
      progress: newValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProject(project);
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
            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => navigate('/projects')}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {t('save')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditProject;
