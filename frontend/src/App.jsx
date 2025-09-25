import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Customer/Dashboard";
import ParcelForm from "./pages/Customer/ParcelForm";
// import ParcelDetails from "./pages/Customer/ParcelDetails";
import AppRoutes from './Routes/approutes';

export default function App() {
  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}
