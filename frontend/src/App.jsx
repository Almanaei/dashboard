import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';
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
import Unauthorized from './pages/Unauthorized'; 
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <AuthProvider>
      <SearchProvider>
        <LanguageProvider>
          <ThemeProvider>
            <LocalizationProvider 
              dateAdapter={AdapterDateFns} 
              adapterLocale={enUS}
              dateFormats={{ 
                fullDate: 'MMM dd, yyyy',
                keyboardDate: 'MM/DD/YYYY',
                monthAndYear: 'MMMM yyyy',
                normalDate: 'MMM dd, yyyy',
                shortDate: 'MMM dd'
              }}
            >
              <ProjectProvider>
                <CssBaseline />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/new" element={<NewProject />} />
                    <Route path="projects/:id" element={<ProjectDetails />} />
                    <Route path="projects/:id/edit" element={<EditProject />} />
                    <Route path="reports" element={
                      <ProtectedRoute requiredRole="admin">
                        <Reports />
                      </ProtectedRoute>
                    } />
                    <Route path="users" element={
                      <ProtectedRoute requiredRole="admin">
                        <Users />
                      </ProtectedRoute>
                    } />
                    <Route path="settings" element={<Settings />} />
                    <Route path="security" element={<Security />} />
                    <Route path="backup-restore" element={<BackupRestore />} />
                  </Route>
                </Routes>
              </ProjectProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SearchProvider>
    </AuthProvider>
  );
};

export default App;
