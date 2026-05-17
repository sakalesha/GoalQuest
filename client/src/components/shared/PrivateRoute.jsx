// client/src/components/shared/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home dashboard based on role
    const dest = user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/employee';
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
