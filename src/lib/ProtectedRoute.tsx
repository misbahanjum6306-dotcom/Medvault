import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRole,
  requireOnboarding = true 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile && requireOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (profile && requireOnboarding && !profile.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRole && profile?.role !== allowedRole) {
    // Redirect to their respective dashboard if they are on the wrong side
    const target = profile?.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};
