import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'MANAGER' | 'ADMIN';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isManager, isAdmin, token } = useAuthStore();

  // Configurer le token dans axios si disponible
  React.useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'MANAGER' && !isManager()) {
    return <Navigate to="/timesheet" replace />;
  }

  if (requiredRole === 'ADMIN' && !isAdmin()) {
    return <Navigate to="/timesheet" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

