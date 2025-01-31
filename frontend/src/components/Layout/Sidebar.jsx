import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Typography, Box, ListItemButton, Drawer, Menu, MenuItem, Avatar } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import BackupIcon from '@mui/icons-material/Backup';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  console.log('=== Sidebar Component Start ===');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  console.log('Initial props:', { location: location.pathname, user, loading });

  console.log('=== User Data Changed ===');
  console.log('User object:', user);
  console.log('User role:', user?.role);
  console.log('Loading state:', loading);
  console.log('===================');

  useEffect(() => {
    console.log('=== User Data Changed ===');
    console.log('User object:', user);
    console.log('User role:', user?.role);
    console.log('Loading state:', loading);
    console.log('===================');
  }, [user, loading]);

  if (loading) {
    console.log('Sidebar is in loading state');
    return (
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        <Box sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            {t('loading')}...
          </Typography>
        </Box>
      </Drawer>
    );
  }

  const hasAccess = (roles) => {
    console.log('hasAccess check:', { roles, userRole: user?.role, user });
    if (!user || !user.role) {
      console.log('No user or role found - access denied');
      return false;
    }

    const userRole = user.role.toLowerCase();
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const hasRole = normalizedRoles.includes(userRole);
    
    console.log('Access check result:', {
      userRole,
      normalizedRoles,
      hasRole,
      path: roles
    });
    return hasRole;
  };

  const menuItems = [
    { path: '/dashboard', icon: <DashboardIcon />, label: 'dashboard', roles: ['user', 'admin'] },
    { path: '/reports', icon: <DescriptionIcon />, label: 'reports', roles: ['admin'] },
    { path: '/projects', icon: <DescriptionIcon />, label: 'projects', roles: ['user', 'admin'] },
    { path: '/analytics', icon: <BarChartIcon />, label: 'analytics', roles: ['user', 'admin'] },
    { path: '/extensions', icon: <BackupIcon />, label: 'extensions', roles: ['admin'] },
    { path: '/companies', icon: <GroupIcon />, label: 'companies', roles: ['admin'] },
    { path: '/users', icon: <GroupIcon />, label: 'users', roles: ['admin'] },
    { path: '/help', icon: <HelpIcon />, label: 'helpCenter', roles: ['user', 'admin'] },
    { path: '/notifications', icon: <NotificationsIcon />, label: 'notifications', roles: ['user', 'admin'] }
  ];

  console.log('Menu items to process:', menuItems.length);

  const drawerWidth = 240;

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    handleUserMenuClose();
    navigate(path);
  };

  const renderMenuItem = (item) => {
    console.log('Rendering menu item:', { path: item.path, roles: item.roles });
    const access = hasAccess(item.roles);
    console.log('Access result for', item.path, ':', access);
    
    if (!access) {
      console.log('No access to:', item.path);
      return null;
    }

    console.log('Rendering menu item for:', item.path);
    return (
      <ListItem
        key={item.path}
        disablePadding
        sx={{
          display: 'block',
          backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent'
        }}
      >
        <ListItemButton
          component={Link}
          to={item.path}
          sx={{
            minHeight: 48,
            px: 2.5,
            py: 1.5
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: 2,
              justifyContent: 'center',
              color: location.pathname === item.path ? 'primary.main' : 'text.secondary'
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={t(item.label)}
            sx={{
              '& .MuiListItemText-primary': {
                color: location.pathname === item.path ? 'primary.main' : 'text.primary'
              }
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider'
        },
      }}
    >
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderBottom: '1px solid',
            borderColor: 'divider',
            pl: isRTL ? 0 : 2,
            pr: isRTL ? 2 : 0
          }}
        >
          <Typography variant="h6" component="div" sx={{ 
            fontWeight: 'bold',
            textAlign: isRTL ? 'right' : 'left',
            width: '100%'
          }}>
            {t('dashboard')}
          </Typography>
        </Box>
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.path}>
              {renderMenuItem(item)}
            </React.Fragment>
          ))}
        </List>
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: 2
          }}
        >
          {user ? (
            <Box>
              <Box
                onClick={handleUserMenuClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Avatar
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.name}
                  sx={{
                    width: 40,
                    height: 40
                  }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.role}
                  </Typography>
                </Box>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
              >
                <MenuItem onClick={() => handleNavigate('/profile')}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  {t('profile')}
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  {t('settings')}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  {t('logout')}
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              {t('notSignedIn')}
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
