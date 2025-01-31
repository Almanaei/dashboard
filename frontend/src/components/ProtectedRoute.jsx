import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  // If a specific role is required, check if user has that role
  // Admin role has access to everything
  if (requiredRole) {
    const userRole = user.role?.toLowerCase() || '';
    const requiredRoleLower = requiredRole.toLowerCase();
    
    console.log('Role check:', { 
      userRole, 
      requiredRole: requiredRoleLower,
      hasAccess: userRole === requiredRoleLower
    });
    
    if (userRole !== requiredRoleLower) {
      console.log('Access denied, redirecting to unauthorized');
      return <Navigate to="/unauthorized" />;
    }
  }

  return children;
};

export default ProtectedRoute;
