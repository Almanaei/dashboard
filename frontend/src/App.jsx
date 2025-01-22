import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import NewProject from './pages/NewProject';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Security from './pages/Security';
import BackupRestore from './pages/BackupRestore';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

const App = () => {
  return (
    <AuthProvider>
      <SearchProvider>
        <LanguageProvider>
          <ThemeProvider>
            <CssBaseline />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="projects"
                  element={
                    <ProtectedRoute>
                      <Projects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="projects/:id"
                  element={
                    <ProtectedRoute>
                      <ProjectDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="projects/new"
                  element={
                    <ProtectedRoute>
                      <NewProject />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="security"
                  element={
                    <ProtectedRoute>
                      <Security />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="backup-restore"
                  element={
                    <ProtectedRoute>
                      <BackupRestore />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </ThemeProvider>
        </LanguageProvider>
      </SearchProvider>
    </AuthProvider>
  );
};

export default App;
