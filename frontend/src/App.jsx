// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminParcels from "./pages/Admin/AdminParcels";
import AdminParcelManage from "./pages/Admin/AdminParcelManage";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {
  const { token, role } = useSelector((state) => state.auth);

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!token) return <Navigate to="/auth" replace />;

    const normalizedRole = role?.toLowerCase();
    if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

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

        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
