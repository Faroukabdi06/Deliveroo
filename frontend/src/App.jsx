// <<<<<<< admin-features
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import AdminDashboard from './pages/Admin/AdminDashboard';
// import AdminParcelManage from './pages/Admin/AdminParcelManage';

// const App = () => {
//   return (
//     <Router>
//       <div>
//         <Routes>
//           {/* Default route redirects to admin dashboard */}
//           <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          
//           {/* Admin routes */}
//           <Route path="/admin/dashboard" element={<AdminDashboard />} />
//           <Route path="/admin/parcels/:id" element={<AdminParcelManage />} />
          
//           {/* Add a catch-all route for undefined paths */}
//           <Route path="*" element={<div>Page not found</div>} />
//         </Routes>
//       </div>
// =======
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Customer/Dashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}


export default App;


