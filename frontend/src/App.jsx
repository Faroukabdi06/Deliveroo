import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminParcelManage from './pages/Admin/AdminParcelManage';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Default route redirects to admin dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/parcels/:id" element={<AdminParcelManage />} />
          
          {/* Add a catch-all route for undefined paths */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;