import { useAuth } from '@/context/AuthContext';
import type { LocationWithState } from '@/types';
import { PATH_LOGIN } from '@/utils/vars';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation() as LocationWithState;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={PATH_LOGIN} state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;