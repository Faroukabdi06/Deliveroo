import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  BarChart3,
  PlusCircle,
  Package,
  Bell,
  User,
} from "lucide-react";

import { fetchCustomerParcels } from "../../features/customer/customerSlice";
import { logout } from "../../features/auth/authSlice";
import "../../styles/customerDashboard.css";

import ParcelCard from "../../components/customer/ParcelCard";
import ParcelForm from "../../components/customer/ParcelForm";
import CustomerSideNav from "../../components/customer/CustomerSideNav";

export default function CustomerDashboard({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [filter, setFilter] = useState("");

  const { parcels, loading, error } = useSelector((state) => state.customer);

  useEffect(() => {
    dispatch(fetchCustomerParcels());
  }, [dispatch]);

  const filteredParcels = (parcels || []).filter(
    (p) =>
      p.recipientName?.toLowerCase().includes(filter.toLowerCase()) ||
      p.status?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="customer-dashboard">
      {/* Customer SideNav */}
      <CustomerSideNav
        user={user}
        view={view}
        setView={setView}
        onLogout={handleLogout}
      />

      <main className="customer-dashboard-main">
        {/* Dashboard View */}
        {view === "dashboard" && (
          <>
            <h2>Welcome back {user?.name || ""}!</h2>
            <p>
              Manage your deliveries, track shipments, and stay updated with
              real-time notifications.
            </p>

            <div className="customer-dashboard-stats">
              <div className="customer-dashboard-stat-card active">
                <p>Active Deliveries</p>
                <p>
                  {(parcels || []).filter((p) => p.status !== "delivered")
                    .length}
                </p>
                <div>
                  <Activity size={14} /> In progress
                </div>
              </div>
              <div className="customer-dashboard-stat-card completed">
                <p>Completed</p>
                <p>
                  {(parcels || []).filter((p) => p.status === "delivered")
                    .length}
                </p>
                <div>
                  <CheckCircle size={14} /> Delivered
                </div>
              </div>
              <div className="customer-dashboard-stat-card total">
                <p>Total Parcels</p>
                <p>{parcels?.length || 0}</p>
                <div>
                  <BarChart3 size={14} /> All time
                </div>
              </div>
            </div>

            <div className="customer-dashboard-quick-actions">
              <button onClick={() => setView("form")}>
                <PlusCircle size={28} /> Send Parcel
              </button>
              <button onClick={() => setView("parcels")}>
                <Package size={28} /> My Parcels
              </button>
            </div>

            <h3>Recent Parcels</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="customer-dashboard-parcels">
                {filteredParcels.slice(0, 3).map((p) => (
                  <ParcelCard key={p.id} parcel={p} />
                ))}
              </div>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </>
        )}

        {/* Parcels View */}
        {view === "parcels" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2>My Parcels</h2>
              <input
                type="text"
                placeholder="Filter by name or status..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="customer-dashboard-parcels">
              {filteredParcels.length > 0 ? (
                filteredParcels.map((parcel) => (
                  <ParcelCard key={parcel.id} parcel={parcel} />
                ))
              ) : (
                <p>No parcels found.</p>
              )}
            </div>
          </>
        )}

        {/* Send Parcel Form View */}
        {view === "form" && <ParcelForm />}

        {/* Notifications View */}
        {view === "notifications" && (
          <>
            <h2>
              <Bell size={22} /> Notifications
            </h2>
            <p>
              Here you’ll see real-time updates about your parcels (e.g.,
              status changes, delivery updates).
            </p>
            <div className="customer-dashboard-parcels">
              {/* Later: map over notifications from Redux or API */}
              <p>No notifications yet.</p>
            </div>
          </>
        )}

        {/* Profile View */}
        {view === "profile" && (
          <>
            <h2>
              <User size={22} /> My Profile
            </h2>
            <div className="profile-section">
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Role:</strong> Customer
              </p>
              <button
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
