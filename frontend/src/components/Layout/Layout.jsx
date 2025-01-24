import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Badge,
  InputBase,
  Paper,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as ProjectsIcon,
  Analytics as AnalyticsIcon,
  Description as ReportsIcon,
  Extension as ExtensionsIcon,
  Business as CompaniesIcon,
  People as PeopleIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  MoreHoriz as MoreIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
} from '@mui/icons-material';
import { useSearch } from '@/context/SearchContext';
import { getUserCount } from '@/services/userService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { globalSearch, setGlobalSearch } = useSearch();
  const { t, isRTL, toggleLanguage, language } = useLanguage();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCommandK, setIsCommandK] = useState(false);
  const [userCount, setUserCount] = useState(0);
  
  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareSnackbarOpen, setShareSnackbarOpen] = useState(false);
  
  // Manage menu state
  const [manageAnchorEl, setManageAnchorEl] = useState(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      const count = await getUserCount();
      setUserCount(count);
    };
    fetchUserCount();
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'k')) {
        e.preventDefault();
        setIsCommandK(true);
        document.querySelector('#global-search').focus();
      }
      if (e.key === 'Escape') {
        setIsCommandK(false);
        document.querySelector('#global-search').blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Share functionality
  const handleShareClick = () => {
    const currentPath = window.location.href;
    setShareLink(currentPath);
    setShareDialogOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setShareSnackbarOpen(true);
    setShareDialogOpen(false);
  };

  // Manage functionality
  const handleManageClick = (event) => {
    setManageAnchorEl(event.currentTarget);
  };

  const handleManageClose = () => {
    setManageAnchorEl(null);
  };

  const handleManageOption = (option) => {
    handleManageClose();
    switch (option) {
      case 'settings':
        navigate('/settings');
        break;
      case 'security':
        navigate('/security');
        break;
      case 'backup':
        navigate('/backup-restore');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { text: t('dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('projects'), icon: <ProjectsIcon />, path: '/projects', badge: '3/5' },
    { text: t('analytics'), icon: <AnalyticsIcon />, path: '/analytics' },
    { text: t('companies'), icon: <CompaniesIcon />, path: '/companies', badge: '17' },
    { text: t('extensions'), icon: <ExtensionsIcon />, path: '/extensions' },
    // Admin only items
    ...(user?.role === 'admin' ? [
      { text: t('reports'), icon: <ReportsIcon />, path: '/reports' },
      { text: t('users'), icon: <PeopleIcon />, path: '/users', badge: userCount.toString() },
    ] : []),
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <img src="/logo.svg" alt="Prody" style={{ width: 32, height: 32 }} />
        <Typography variant="h6" noWrap component="div">
          {t('prody')}
        </Typography>
      </Box>
      
      <Box sx={{ px: 2, py: 1 }}>
        <Paper
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.default',
            transition: 'all 0.2s',
            ...(isCommandK && {
              bgcolor: 'background.paper',
              boxShadow: '0 0 0 2px #2196f3'
            })
          }}
        >
          <InputBase
            id="global-search"
            sx={{ ml: 1, flex: 1 }}
            placeholder={t('search')}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onFocus={() => setIsCommandK(true)}
            onBlur={() => setIsCommandK(false)}
            inputProps={{ 'aria-label': 'global search' }}
          />
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.5,
              bgcolor: 'background.paper',
              borderRadius: 1,
              color: 'text.secondary',
            }}
          >
            ⌘F
          </Typography>
        </Paper>
      </Box>

      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            disablePadding
            sx={{
              mb: 0.5,
              display: 'block',
              borderRadius: 1,
              bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: 'initial',
                px: 2.5,
                position: 'relative', // Added for badge positioning
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ opacity: 1 }}
              />
              {item.badge && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <Badge
                    badgeContent={item.badge}
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        position: 'relative',
                        transform: 'none',
                        border: `2px solid ${theme.palette.background.paper}`,
                      },
                    }}
                  />
                </Box>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 1,
              mb: 0.5,
              display: 'flex',
              flexDirection: isRTL ? 'row-reverse' : 'row',
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              marginRight: isRTL ? 0 : 2,
              marginLeft: isRTL ? 2 : 0
            }}>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText 
              primary={t('helpCenter')} 
              sx={{
                margin: 0,
                textAlign: isRTL ? 'right' : 'left'
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 1,
              display: 'flex',
              flexDirection: isRTL ? 'row-reverse' : 'row',
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              marginRight: isRTL ? 0 : 2,
              marginLeft: isRTL ? 2 : 0
            }}>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText 
              primary={t('notifications')} 
              sx={{
                margin: 0,
                textAlign: isRTL ? 'right' : 'left'
              }}
            />
            <Badge
              badgeContent="3"
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  right: isRTL ? 'auto' : -3,
                  left: isRTL ? -3 : 'auto',
                  top: 13,
                  border: `2px solid ${theme.palette.background.paper}`,
                  padding: '0 4px',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>EC</Avatar>
            <Typography variant="subtitle2">Ember Crest</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {t('starterSetOverview')}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            3 of 5 projects created
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: 0.5,
                  bgcolor: i < 3 ? 'primary.main' : 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              />
            ))}
          </Box>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mt: 2 }}
          >
            {t('getFullAccess')}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        direction: isRTL ? 'rtl' : 'ltr'
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: isRTL ? 10 : 3, // Extra top padding for Arabic version
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: isRTL ? 0 : `${drawerWidth}px` },
          mr: { sm: isRTL ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: isRTL ? 0 : `${drawerWidth}px` },
            mr: { sm: isRTL ? `${drawerWidth}px` : 0 },
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 'none',
            borderBottom: 1,
            borderColor: 'divider',
            mb: isRTL ? 4 : 0, // Add margin bottom for Arabic version
          }}
        >
          <Toolbar 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              minHeight: isRTL ? 72 : 64, // Increase toolbar height for Arabic
              py: isRTL ? 1.5 : 1, // Add extra padding for Arabic
            }}
          >
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: isRTL ? 0 : 2,
                ml: isRTL ? 2 : 0, 
                display: { sm: 'none' } 
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ 
              order: isRTL ? 2 : 0,
              display: 'flex', 
              gap: 1 
            }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleManageClick}
                startIcon={isRTL ? <MoreIcon /> : null}
                endIcon={isRTL ? null : <MoreIcon />}
              >
                {t('manage')}
              </Button>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              order: isRTL ? 0 : 2
            }}>
              <Button
                size="small"
                onClick={toggleLanguage}
                sx={{ 
                  minWidth: 'auto',
                  mr: 2,
                  textTransform: 'none'
                }}
              >
                {language === 'en' ? 'العربية' : 'English'}
              </Button>
              <IconButton size="small" onClick={handleShareClick}>
                <ShareIcon />
              </IconButton>
              <Typography variant="body2">{t('share')}</Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <Outlet />
      </Box>
      <Box
        component="nav"
        sx={{
          width: 240,
          flexShrink: 0,
          position: 'fixed',
          [isRTL ? 'right' : 'left']: 0,
          top: 0,
          height: '100vh',
          zIndex: (theme) => theme.zIndex.drawer
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          anchor={isRTL ? 'right' : 'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              direction: isRTL ? 'rtl' : 'ltr'
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          anchor={isRTL ? 'right' : 'left'}
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              direction: isRTL ? 'rtl' : 'ltr'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>{t('shareDashboard')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <TextField
              fullWidth
              value={shareLink}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={handleCopyLink}>
                    <CopyIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>{t('close')}</Button>
          <Button variant="contained" onClick={handleCopyLink}>{t('copyLink')}</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Menu */}
      <Menu
        anchorEl={manageAnchorEl}
        open={Boolean(manageAnchorEl)}
        onClose={handleManageClose}
      >
        <MenuItem onClick={() => handleManageOption('settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          {t('settings')}
        </MenuItem>
        <MenuItem onClick={() => handleManageOption('security')}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          {t('security')}
        </MenuItem>
        <MenuItem onClick={() => handleManageOption('backup')}>
          <ListItemIcon>
            <BackupIcon fontSize="small" />
          </ListItemIcon>
          {t('backup')}
        </MenuItem>
      </Menu>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={shareSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setShareSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {t('linkCopied')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;
