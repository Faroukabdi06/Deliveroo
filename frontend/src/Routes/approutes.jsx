import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Customer/Dashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import LandingPage from "../pages/LandingPage";

function AppRoutes() {
  const { token, role } = useSelector((state) => state.auth);

  // Wrapper for protected routes
  const PrivateRoute = ({ children, allowedRoles }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />; // unauthorized
    }
    return children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Customer Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={["CUSTOMER"]}>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/dashboard/admin"
        element={
          <PrivateRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* Default */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
