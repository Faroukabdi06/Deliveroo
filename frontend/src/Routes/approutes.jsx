import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ParcelDetails from './pages/ParcelDetails';
import AdminParcelManage from './pages/AdminParcelManage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/parcels/:id" element={<ParcelDetails />} />
        
        {/* Admin Routes */}
        <Route path="/admin/parcels/:id" element={<AdminParcelManage />} />
      </Routes>
    </Router>
  );
}

export default App;