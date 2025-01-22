import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import NewProject from './pages/NewProject';
import EditProject from './pages/EditProject';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Security from './pages/Security';
import BackupRestore from './pages/BackupRestore';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProjectProvider } from './context/ProjectContext';

const theme = createTheme();

const App = () => {
  return (
    <AuthProvider>
      <SearchProvider>
        <LanguageProvider>
          <ThemeProvider theme={theme}>
            <ProjectProvider>
              <CssBaseline />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/new" element={<NewProject />} />
                  <Route path="projects/:id" element={<ProjectDetails />} />
                  <Route path="projects/:id/edit" element={<EditProject />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="users" element={<Users />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="security" element={<Security />} />
                  <Route path="backup-restore" element={<BackupRestore />} />
                </Route>
              </Routes>
            </ProjectProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SearchProvider>
    </AuthProvider>
  );
};

export default App;
