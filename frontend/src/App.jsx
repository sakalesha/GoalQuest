// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/shared/Navbar';
import PrivateRoute from './components/shared/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useSelector } from 'react-redux';

const AppContent = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <Layout className="min-h-screen">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/manager' : '/employee'} replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
        />
        
        <Route element={<PrivateRoute allowedRoles={['employee', 'manager', 'admin']} />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['manager', 'admin']} />}>
          <Route path="/manager" element={<ManagerDashboard />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/employee" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
