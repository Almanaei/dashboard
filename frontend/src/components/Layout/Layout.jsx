import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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

const drawerWidth = 240;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { globalSearch, setGlobalSearch } = useSearch();
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

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Projects', icon: <ProjectsIcon />, path: '/projects', badge: '3/5' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Extensions', icon: <ExtensionsIcon />, path: '/extensions' },
    { text: 'Companies', icon: <CompaniesIcon />, path: '/companies', badge: '17' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users', badge: userCount.toString() },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <img src="/logo.svg" alt="Prody" style={{ width: 32, height: 32 }} />
        <Typography variant="h6" noWrap component="div">
          Prody
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
            placeholder="Search..."
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
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: location.pathname === item.path ? 'white' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
            {item.badge && (
              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  color: location.pathname === item.path ? 'white' : 'text.secondary',
                }}
              >
                {item.badge}
              </Typography>
            )}
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <List sx={{ px: 1 }}>
        <ListItem button>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Help center" />
        </ListItem>
        <ListItem button>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText primary="Notifications" />
          <Badge
            badgeContent="3"
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                right: -3,
                top: 13,
                border: '2px solid #fff',
                padding: '0 4px',
              },
            }}
          />
        </ListItem>
      </List>

      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>EC</Avatar>
            <Typography variant="subtitle2">Ember Crest</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Starter set overview
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
            Get full access 
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={handleShareClick}>
              <ShareIcon />
            </IconButton>
            <Typography variant="body2">Share</Typography>
          </Box>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleManageClick}
              endIcon={<MoreIcon />}
            >
              Manage
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Dashboard</DialogTitle>
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
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleCopyLink}>
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Menu */}
      <Menu
        anchorEl={manageAnchorEl}
        open={Boolean(manageAnchorEl)}
        onClose={handleManageClose}
      >
        <MenuItem onClick={handleManageClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleManageClose}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Security</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleManageClose}>
          <ListItemIcon>
            <BackupIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Backup & Restore</ListItemText>
        </MenuItem>
      </Menu>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={shareSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setShareSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
