import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { refreshToken } from "./features/auth/authSlice";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminParcels from "./pages/Admin/AdminParcels";
import AdminParcelManage from "./pages/Admin/AdminParcelManage";
import AdminNotifications from "./pages/Admin/AdminNotifications";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerParcels from "./pages/customer/CustomerParcels";
import CustomerParcelDetail from "./pages/customer/CustomerParcelDetail";
import ParcelForm from "./components/customer/ParcelForm";
import UserProfile from "./components/customer/Profile";
import CustomerNotifications from "./pages/customer/CustomerNotifications";


const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let accessToken = token;

        // If no token in Redux, attempt refresh
        if (!accessToken) {
          await dispatch(refreshToken()).unwrap();
          // Read updated token from localStorage
          accessToken = localStorage.getItem("token");
        }

        if (accessToken) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch, token]);

  if (loading) return <p className="text-center mt-10">Checking authentication...</p>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const normalizedRole = role?.toLowerCase() || localStorage.getItem("role")?.toLowerCase();

  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// -------------------- App Component --------------------
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parcels"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminParcels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parcels/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminParcelManage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminNotifications />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/parcels"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerParcels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/parcels/:id"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerParcelDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/parcels/create"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <ParcelForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerNotifications />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={<h1 className="text-center mt-10">404 - Not Found</h1>}
        />
      </Routes>
    </Router>
  );
}

export default App;
