import { BrowserRouter, Routes, Route } from "react-router-dom";

// Customer Pages
import Dashboard from "../pages/Customer/Dashboard";
import ParcelForm from "../pages/Customer/ParcelForm";
import ParcelDetails from "../pages/Customer/ParcelDetails";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<ParcelForm />} />
        <Route path="/parcels/:id" element={<ParcelDetails />} />
        <Route path="*" element={<Dashboard />} /> {/* fallback */}
      </Routes>
    </BrowserRouter>
  );
}
