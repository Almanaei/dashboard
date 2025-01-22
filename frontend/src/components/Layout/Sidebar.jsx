import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Typography, Box, ListItemButton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import BackupIcon from '@mui/icons-material/Backup';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const menuItems = [
    { path: '/dashboard', icon: <DashboardIcon />, label: 'dashboard' },
    { path: '/reports', icon: <DescriptionIcon />, label: 'reports' },
    { path: '/projects', icon: <DescriptionIcon />, label: 'projects' },
    { path: '/analytics', icon: <BarChartIcon />, label: 'analytics' },
    { path: '/extensions', icon: <BackupIcon />, label: 'extensions' },
    { path: '/companies', icon: <GroupIcon />, label: 'companies' },
    { path: '/users', icon: <GroupIcon />, label: 'users' },
    { path: '/help', icon: <HelpIcon />, label: 'helpCenter' },
    { path: '/notifications', icon: <NotificationsIcon />, label: 'notifications' }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isRTL ? 'flex-end' : 'flex-start',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {t('dashboard')}
        </Typography>
      </Box>
      <List sx={{ width: '100%' }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: 'flex-end',
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemText 
                primary={t(item.label)}
                sx={{
                  margin: 0,
                  textAlign: 'right',
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 'bold' : 'regular',
                  }
                }}
              />
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  color: location.pathname === item.path ? 'white' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
