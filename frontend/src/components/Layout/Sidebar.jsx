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
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      direction: isRTL ? 'rtl' : 'ltr'
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
      <List sx={{ 
        width: '100%',
        '& .MuiListItem-root': {
          display: 'flex',
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }
      }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ pr: isRTL ? 2 : 0, pl: isRTL ? 0 : 2 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                width: '100%',
                display: 'flex',
                flexDirection: isRTL ? 'row-reverse' : 'row',
                justifyContent: 'flex-start',
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
              <ListItemIcon
                sx={{
                  minWidth: 'auto',
                  marginRight: isRTL ? 0 : 3,
                  marginLeft: isRTL ? 3 : 0,
                  color: location.pathname === item.path ? 'white' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={t(item.label)}
                sx={{
                  margin: 0,
                  flex: 1,
                  '& .MuiTypography-root': {
                    textAlign: isRTL ? 'right' : 'left',
                    fontWeight: location.pathname === item.path ? 'bold' : 'regular',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
