import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/session';

/**
 * A wrapper for routes that require authentication and specific roles.
 * Redirects to login if unauthenticated or unauthorized.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const session = getSession();

  if (!session.token) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Logged in but incorrect role, redirect to their proper dashboard
    switch (session.role) {
      case 'Admin': return <Navigate to="/admin-dashboard" replace />;
      case 'Asset Manager': return <Navigate to="/asset-manager-dashboard" replace />;
      case 'Department Head': return <Navigate to="/department-head-dashboard" replace />;
      default: return <Navigate to="/employee-dashboard" replace />;
    }
  }

  // Authorized
  return children;
};

export default ProtectedRoute;
