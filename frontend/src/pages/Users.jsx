import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { getUsers, createUser, updateUser, updateUserAvatar, deleteUser, updateUserStatus } from '../services/userService';
import { useSearch } from '@/context/SearchContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProjects } from '../context/ProjectContext';

const Users = () => {
  const { t, isRTL } = useLanguage();
  const { globalSearch } = useSearch();
  const { updateUserData } = useProjects();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'Active',
    avatar: ''
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar || ''
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        status: 'Active',
        avatar: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      status: 'Active',
      avatar: ''
    });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(t('avatarSizeError'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.onerror = () => {
        setError(t('avatarUploadError'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (dialogMode === 'create') {
        await createUser({
          ...formData,
          role: formData.role.toLowerCase()
        });
        setSnackbar({
          open: true,
          message: t('userCreatedSuccessfully'),
          severity: 'success'
        });
      } else {
        const { password, ...updateData } = formData;
        if (selectedUser) {
          await updateUser(selectedUser.id, {
            ...updateData,
            role: updateData.role.toLowerCase()
          });
          setSnackbar({
            open: true,
            message: t('userUpdatedSuccessfully'),
            severity: 'success'
          });
        }
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting user:', error);
      setSnackbar({
        open: true,
        message: t(dialogMode === 'create' ? 'failedToCreateUser' : 'failedToUpdateUser'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(userToDelete.id);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      await updateUserStatus(user.id, newStatus);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(globalSearch);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [globalSearch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      pt: !isRTL ? 10 : 3, 
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">{t('users')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
        >
          {t('addUser')}
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <TableCell>{t('email')}</TableCell>
              <TableCell>{t('role')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell>{t('lastActive')}</TableCell>
              <TableCell align="right">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={user.avatar} 
                      alt={user.name}
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: user.avatar ? 'transparent' : 'primary.main',
                        '& img': {
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%'
                        }
                      }}
                    >
                      {!user.avatar && user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={t(user.role.toLowerCase())}
                    size="small"
                    color={user.role === 'Admin' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(user.status.toLowerCase())}
                    size="small"
                    color={user.status === 'Active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.lastActive).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title={user.status === 'Active' ? t('deactivate') : t('activate')}>
                      <IconButton
                        size="small"
                        onClick={() => handleStatusToggle(user)}
                        color={user.status === 'Active' ? 'success' : 'default'}
                      >
                        {user.status === 'Active' ? <CheckCircleIcon /> : <BlockIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('edit')}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('edit', user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(user)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogMode === 'create' ? t('createNewUser') : t('editUser')}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t('username')}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              margin="normal"
              required
              error={formData.username.length > 0 && formData.username.length < 3}
              helperText={formData.username.length > 0 && formData.username.length < 3 ? t('usernameTooShort') : ''}
            />
            <TextField
              fullWidth
              label={t('email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            {dialogMode === 'create' && (
              <TextField
                fullWidth
                label={t('password')}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
                error={formData.password.length > 0 && formData.password.length < 6}
                helperText={formData.password.length > 0 && formData.password.length < 6 ? t('passwordTooShort') : ''}
              />
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('role')}</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label={t('role')}
                required
              >
                <MenuItem value="user">{t('user')}</MenuItem>
                <MenuItem value="admin">{t('admin')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('status')}</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label={t('status')}
                required
              >
                <MenuItem value="Active">{t('active')}</MenuItem>
                <MenuItem value="Inactive">{t('inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || 
              (formData.username.length < 3) || 
              (dialogMode === 'create' && formData.password.length < 6)
            }
          >
            {loading ? <CircularProgress size={24} /> : t(dialogMode === 'create' ? 'create' : 'update')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>
          {t('deleteUser')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('deleteUserConfirmation', { name: userToDelete?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
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

export default Users;
