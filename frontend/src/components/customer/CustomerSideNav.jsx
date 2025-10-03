import React from "react";
import { Home, Package, PlusCircle, Bell, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import "../../styles/customersidenav.css";

export default function CustomerSideNav({ user, onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    onLogout?.();
    navigate("/login"); // redirect to login after logout
  };

  // Check if current path matches target
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="customer-dashboard-sidebar">
      <div className="customer-dashboard-sidebar-header">
        <h1>Deliveroo</h1>
        <p>Delivery Platform</p>
      </div>

      <nav className="customer-dashboard-nav">
        <button
          className={isActive("/customer") ? "active" : ""}
          onClick={() => navigate("/customer")}
        >
          <Home size={18} /> Dashboard
        </button>

        <button
          className={isActive("/customer/parcels") ? "active" : ""}
          onClick={() => navigate("/customer/parcels")}
        >
          <Package size={18} /> My Parcels
        </button>

        <button
          className={isActive("/customer/parcels/create") ? "active" : ""}
          onClick={() => navigate("/customer/parcels/create")}
        >
          <PlusCircle size={18} /> Send Parcel
        </button>

        <button
          className={isActive("/customer/notifications") ? "active" : ""}
          onClick={() => navigate("/customer/notifications")}
        >
          <Bell size={18} /> Notifications
        </button>
      </nav>

      <div className="customer-dashboard-profile">
        <div className="customer-dashboard-profile-content">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="profile" />
          ) : (
            <div className="profile-placeholder">
              {user?.name?.[0] || "U"}
            </div>
          )}
          <div className="customer-dashboard-profile-info">
            <p>{user?.name || ""}</p>
            <p>Customer Account</p>
            <button onClick={() => navigate("/customer/profile")}>
              View Profile
            </button>
          </div>
        </div>
      </div>

      <div className="customer-dashboard-logout">
        <button onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
