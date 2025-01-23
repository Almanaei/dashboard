import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Typography, Box, ListItemButton, Drawer } from '@mui/material';
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

  const drawerWidth = 240;

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
      <Box sx={{ overflow: 'auto' }}>
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
        <List>
          {menuItems.map((item) => (
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
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                      fontSize: '1rem'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
