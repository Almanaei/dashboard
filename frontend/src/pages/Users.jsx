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
import { formatLastActive } from '../utils/dateUtils';
import axios from 'axios';

const Users = () => {
  const { t, isRTL } = useLanguage();
  const { globalSearch } = useSearch();
  const { updateUserData } = useProjects();
  const API_URL = 'http://localhost:5005';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
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

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith('data:')) return avatarPath;
    return `${API_URL}/uploads/${avatarPath}`;
  };

  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    if (user) {
      console.log('Opening edit dialog with user:', user);
      setFormData({
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role?.toLowerCase() || 'user',
        status: user.status || 'Active',
        avatar: user.avatar || ''
      });
    } else {
      setFormData({
        username: '',
        name: '',
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
      name: '',
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
        setSnackbar({
          open: true,
          message: t('avatarSizeError'),
          severity: 'error'
        });
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: t('invalidFileType'),
          severity: 'error'
        });
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
        setSnackbar({
          open: true,
          message: t('avatarUploadError'),
          severity: 'error'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      if (!selectedUser || formData.password) {
        formDataToSend.append('password', formData.password);
      }
      formDataToSend.append('role', formData.role.toLowerCase());
      formDataToSend.append('status', formData.status);

      // Handle avatar
      if (formData.avatar) {
        if (formData.avatar.startsWith('data:')) {
          // Convert base64 to blob for new uploads
          const response = await fetch(formData.avatar);
          const blob = await response.blob();
          formDataToSend.append('avatar', blob, 'avatar.jpg');
        }
      } else {
        // If avatar was removed
        formDataToSend.append('removeAvatar', 'true');
      }

      console.log('Submitting user data:', {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        hasAvatar: !!formData.avatar,
        isNewAvatar: formData.avatar?.startsWith('data:')
      });

      if (selectedUser) {
        await updateUser(selectedUser.id, formDataToSend);
        setSnackbar({ open: true, message: t('userUpdated'), severity: 'success' });
      } else {
        await createUser(formDataToSend);
        setSnackbar({ open: true, message: t('userCreated'), severity: 'success' });
      }

      // Refresh the users list
      await fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || t('errorOccurred'),
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
    setError(null);
    try {
      const response = await getUsers(globalSearch);
      setUsers(response?.users || []);
    } catch (err) {
      setError(t('failedToLoadUsers'));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [globalSearch]);

  if (loading) {
    return (
      <Box sx={{ 
        p: 3,
        pt: !isRTL ? 10 : 3,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 3,
        pt: !isRTL ? 10 : 3
      }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchUsers}>
              {t('retry')}
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Ensure users is always an array
  const usersList = Array.isArray(users) ? users : [];

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
      
      {usersList.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('noUsersFound')}
        </Alert>
      ) : (
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
              {usersList.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={getAvatarUrl(user.avatar)}
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
                        {!user.avatar && user.name?.charAt(0).toUpperCase()}
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color={user.lastActive ? 'textPrimary' : 'textSecondary'}
                      >
                        {formatLastActive(user.lastActive, isRTL) || t('never')}
                      </Typography>
                    </Box>
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
      )}
      
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={getAvatarUrl(formData.avatar)}
                sx={{ 
                  width: 100, 
                  height: 100,
                  mr: 2,
                  bgcolor: formData.avatar ? 'transparent' : 'primary.main'
                }}
              >
                {!formData.avatar && (formData.name || '').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddIcon />}
                  >
                    {t('uploadAvatar')}
                  </Button>
                </label>
                {formData.avatar && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleRemoveAvatar}
                    sx={{ ml: 1 }}
                  >
                    {t('removeAvatar')}
                  </Button>
                )}
              </Box>
            </Box>
            <TextField
              fullWidth
              label={t('name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
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
