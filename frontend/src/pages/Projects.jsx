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
      icon: <ProjectIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      color: 'primary.main',
      bgColor: 'primary.lighter',
    },
    {
      title: t('completedProjects'),
      value: stats.completedProjects,
      icon: <CompletedIcon sx={{ fontSize: 32, color: 'success.main' }} />,
      color: 'success.main',
      bgColor: 'success.lighter',
    },
    {
      title: t('inProgressProjects'),
      value: stats.inProgressProjects,
      icon: <ProgressIcon sx={{ fontSize: 32, color: 'warning.main' }} />,
      color: 'warning.main',
      bgColor: 'warning.lighter',
    },
    {
      title: t('activeUsers'),
      value: Object.keys(stats.userProjects).length,
      icon: <PersonIcon sx={{ fontSize: 32, color: 'info.main' }} />,
      color: 'info.main',
      bgColor: 'info.lighter',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statCards.map((stat, index) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={3} 
          key={index}
          sx={{
            display: 'flex',
            '@media (max-width: 600px)': {
              paddingTop: '16px',
              paddingBottom: '16px',
            }
          }}
        >
          <Card 
            sx={{ 
              boxShadow: 2,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-4px)',
              },
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              },
              animation: 'fadeIn 0.5s ease-out',
              animationFillMode: 'both',
              animationDelay: `${index * 0.1}s`
            }}
          >
            <CardContent 
              sx={{ 
                flex: 1, 
                p: { xs: 2, sm: 3 },
                '&:last-child': {
                  paddingBottom: { xs: 2, sm: 3 }
                }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: { xs: 2, sm: 3 }
                }}
              >
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      mb: 1
                    }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 600,
                      color: stat.color,
                      transition: 'color 0.3s ease',
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: 2,
                    backgroundColor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: `${stat.bgColor}`,
                    }
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
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
      <TableContainer 
        component={Paper}
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t('name')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('description')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('priority')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('startDate')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('endDate')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('user')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('progress')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(project.status.toLowerCase().replace(/_/g, ' ')).split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                      color={getStatusColor(project.status)}
                      size="small"
                      sx={{
                        minWidth: '90px',
                        '& .MuiChip-label': {
                          textTransform: 'none'
                        }
                      }}
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
                          bgcolor: project.user?.avatar ? 'transparent' : 'primary.main'
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ flexGrow: 1 }}
                      />
                      <Typography variant="body2">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                        size="small"
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.lighter'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(project)}
                        size="small"
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.lighter'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
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
          sx={{
            borderTop: 1,
            borderColor: 'divider'
          }}
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
