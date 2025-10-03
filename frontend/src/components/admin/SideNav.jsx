import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaAngleLeft,
  FaBell,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import "../../styles/Admin.css";
import { useState } from "react";

const SideNav = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    navigate("/auth");
  };



  return (
    <aside className={`side-nav ${collapsed ? "collapsed" : ""}`}>
      {/* Toggle Button */}
      <button
        className="toggle-btn"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        {collapsed ? <FaBars /> : <FaAngleLeft />}
      </button>

      {!collapsed && <h2 className="logo">Courier Admin</h2>}

      <ul>
        <li>
          <NavLink to="/admin">
            <FaTachometerAlt />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/parcels">
            <FaBox />
            {!collapsed && <span>Parcels</span>}
          </NavLink>
        </li>

        {/* Notifications Link */}
        <li>
          <NavLink to="/admin/notifications">
            <FaBell />
            {!collapsed && (
              <>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </>
            )}
          </NavLink>
        </li>
      </ul>

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt />
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
};

export default SideNav;
