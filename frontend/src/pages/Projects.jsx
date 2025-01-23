import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Select,
  MenuItem,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assignment as ProjectIcon,
  CheckCircle as CompletedIcon,
  Timeline as ProgressIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useProjects } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';

const ProjectStats = () => {
  const { getProjectStats } = useProjects();
  const { t } = useLanguage();
  const stats = getProjectStats();

  const statCards = [
    {
      title: t('totalProjects'),
      value: stats.totalProjects,
      icon: <ProjectIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      progress: null,
    },
    {
      title: t('completedProjects'),
      value: stats.completedProjects,
      icon: <CompletedIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      progress: null,
    },
    {
      title: t('inProgressProjects'),
      value: stats.inProgressProjects,
      icon: <ProgressIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      progress: null,
    },
    {
      title: t('activeUsers'),
      value: Object.keys(stats.userProjects).length,
      icon: <PersonIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      progress: null,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {stat.icon}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {stat.title}
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stat.value}
              </Typography>
              {stat.progress !== null && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={stat.progress} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();
  const { t, isRTL } = useLanguage();
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, searchQuery, statusFilter, priorityFilter]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Delete handlers
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  // Status chip color mapping
  const getStatusColor = (status) => {
    const colors = {
      planning: 'info',
      in_progress: 'primary',
      completed: 'success',
      on_hold: 'warning'
    };
    return colors[status] || 'default';
  };

  // Priority chip color mapping
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error'
    };
    return colors[priority] || 'default';
  };

  return (
    <Box sx={{ p: 3, pt: !isRTL ? 10 : 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('projects')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/new')}
        >
          {t('newProject')}
        </Button>
      </Box>

      {/* Project Statistics */}
      <ProjectStats />

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label={t('search')}
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">{t('all')}</MenuItem>
          <MenuItem value="planning">{t('planning')}</MenuItem>
          <MenuItem value="in_progress">{t('inProgress')}</MenuItem>
          <MenuItem value="completed">{t('completed')}</MenuItem>
          <MenuItem value="on_hold">{t('onHold')}</MenuItem>
        </Select>
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">{t('all')}</MenuItem>
          <MenuItem value="low">{t('low')}</MenuItem>
          <MenuItem value="medium">{t('medium')}</MenuItem>
          <MenuItem value="high">{t('high')}</MenuItem>
        </Select>
      </Box>

      {/* Projects Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <TableCell>{t('description')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell>{t('priority')}</TableCell>
              <TableCell>{t('startDate')}</TableCell>
              <TableCell>{t('endDate')}</TableCell>
              <TableCell>{t('user')}</TableCell>
              <TableCell>{t('progress')}</TableCell>
              <TableCell align="center">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(project.status)}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(project.priority)}
                      color={getPriorityColor(project.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{project.startDate}</TableCell>
                  <TableCell>{project.endDate}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={`${project.user?.avatar}`}
                        alt={project.user?.name}
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: project.user?.avatar ? 'transparent' : 'primary.main',
                          '& img': {
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%'
                          }
                        }}
                      >
                        {!project.user?.avatar && project.user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {project.user?.name || t('userNotFound')}
                        </Typography>
                        {project.user?.username && (
                          <Typography variant="caption" color="text.secondary">
                            @{project.user.username}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ flexGrow: 1, mr: 1 }}
                      />
                      <Typography variant="body2">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => navigate(`/projects/${project.id}/edit`)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(project)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredProjects.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage={t('rowsPerPage')}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {projectToDelete && t('deleteProjectConfirmation', { name: projectToDelete.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
