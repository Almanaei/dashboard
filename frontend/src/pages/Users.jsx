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
import { getUsers, createUser, updateUser, deleteUser, updateUserStatus } from '../services/userService';
import { useSearch } from '@/context/SearchContext';
import { useLanguage } from '@/context/LanguageContext';

const Users = () => {
  const { t, isRTL } = useLanguage();
  const { globalSearch } = useSearch();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'User',
    status: 'Active',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        username: user.username,
        password: '',
        role: user.role,
        status: user.status,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'User',
        status: 'Active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'User',
      status: 'Active',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await createUser(formData);
      } else {
        await updateUser(selectedUser.id, formData);
      }
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      setError(dialogMode === 'create' ? 'Failed to create user' : 'Failed to update user');
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
                    <Avatar src={user.avatar}>{user.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body1">{user.name}</Typography>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? t('addUser') : t('editUser')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label={t('name')}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label={t('email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label={t('username')}
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              fullWidth
              required
            />
            {dialogMode === 'create' && (
              <TextField
                label={t('password')}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required
              />
            )}
            <FormControl fullWidth>
              <InputLabel>{t('role')}</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label={t('role')}
              >
                <MenuItem value="Admin">{t('admin')}</MenuItem>
                <MenuItem value="User">{t('user')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('status')}</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label={t('status')}
              >
                <MenuItem value="Active">{t('active')}</MenuItem>
                <MenuItem value="Inactive">{t('inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'create' ? t('add') : t('save')}
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
