import { useState, useEffect } from "react";
import {
  Home,
  Package,
  PlusCircle,
  Activity,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import ParcelForm from "./ParcelForm";
import ParcelCard from "../../components/ParcelCard";
import { data, useNavigate } from "react-router-dom";

export default function CustomerDashboard({ user }) {
  const [view, setView] = useState("dashboard");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  const [parcels, setParcels] = useState([]);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [error, setError] = useState(null);

  // Fetch parcels when "parcels" view is active
  useEffect(() => {
    if (view !== "parcels") return;

    const fetchParcels = async () => {
      setLoadingParcels(true);
      setError(null);
      try {
        const BASE_URL = import.meta.env.VITE_BASE_URL;
        const res = await fetch(`${BASE_URL}/parcels`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch parcels");

        const data = await res.json();
        setParcels(data || data); // adjust if API returns data differently
      } catch (err) {
        console.error(err);
        console.log(parcels)
        setError("Could not load parcels.");
      } finally {
        setLoadingParcels(false);
      }
    };

    fetchParcels();
  }, [view]);

  const filteredParcels = parcels.filter(
    (p) =>
      p.recipientName?.toLowerCase().includes(filter.toLowerCase()) ||
      p.status?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "16rem",
          backgroundColor: "#fff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100%",
          boxShadow: "2px 0 6px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2563eb" }}>Deliveroo</h1>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Delivery Platform</p>
        </div>

        <nav style={{ flex: 1, padding: "1rem" }}>
          {[
            { label: "Dashboard", icon: <Home size={18} />, key: "dashboard" },
            { label: "My Parcels", icon: <Package size={18} />, key: "parcels" },
            { label: "Send Parcel", icon: <PlusCircle size={18} />, key: "form" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                width: "100%",
                padding: "0.5rem 0.75rem",
                marginBottom: "0.5rem",
                borderRadius: "0.5rem",
                backgroundColor: view === item.key ? "#eff6ff" : "transparent",
                color: view === item.key ? "#2563eb" : "#374151",
                border: "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid #d1d5db";
                e.currentTarget.style.backgroundColor =
                  view === item.key ? "#eff6ff" : "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid transparent";
                e.currentTarget.style.backgroundColor =
                  view === item.key ? "#eff6ff" : "transparent";
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img
              src="https://wallpapers.com/images/hd/cartoon-profile-pictures-3opqz8op53khmhjp.jpg"
              alt="profile"
              style={{ width: "2.5rem", height: "2.5rem", borderRadius: "9999px", border: "2px solid #e5e7eb" }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ fontSize: "0.875rem", fontWeight: "500" }}>{user?.name || "John Smith"}</p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Customer Account</p>
              <button
                onClick={() => navigate("/profile")}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  color: "#2563eb",
                  backgroundColor: "#fff",
                  border: "1px solid #2563eb",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: "16rem", padding: "2rem" }}>
        {view === "dashboard" && (
          <>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "0.75rem",
              }}
            >
              Welcome back, {user?.name || "John Smith"}!
            </h2>
            <p style={{ fontSize: "1rem", color: "#4b5563", marginBottom: "1.5rem" }}>
              Manage your deliveries, track shipments, and stay updated with real-time notifications.
            </p>

            {/* Stats cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {[
                {
                  label: "Active Deliveries",
                  value: 1,
                  color: "#2563eb",
                  bg: "#eff6ff",
                  icon: <Activity size={14} />,
                },
                {
                  label: "Completed",
                  value: 0,
                  color: "#059669",
                  bg: "#ecfdf5",
                  icon: <CheckCircle size={14} />,
                },
                {
                  label: "Total Parcels",
                  value: 15,
                  color: "#7c3aed",
                  bg: "#f5f3ff",
                  icon: <BarChart3 size={14} />,
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "1rem",
                    backgroundColor: card.bg,
                    borderRadius: "0.5rem",
                    border: "1px solid #d1d5db",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <p style={{ fontSize: "0.875rem", color: card.color }}>{card.label}</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{card.value}</p>
                  <div style={{ display: "flex", gap: "0.25rem", fontSize: "0.75rem", color: card.color }}>
                    {card.icon} {card.label === "Total Parcels" ? "All time" : card.label === "Completed" ? "Delivered" : "In progress"}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {[
                {
                  label: "Send Parcel",
                  desc: "Create new delivery",
                  icon: <PlusCircle style={{ color: "#2563eb", marginBottom: "0.5rem" }} size={28} />,
                  onClick: () => setView("form"),
                },
                {
                  label: "My Parcels",
                  desc: "1 active delivery",
                  icon: <Package style={{ color: "#059669", marginBottom: "0.5rem" }} size={28} />,
                  onClick: () => setView("parcels"),
                },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "1.5rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                >
                  {action.icon}
                  <p style={{ fontWeight: "500" }}>{action.label}</p>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{action.desc}</p>
                </button>
              ))}
            </div>

            {/* Recent Parcels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Recent Parcels</h3>
              <button
                onClick={() => setView("parcels")}
                style={{ fontSize: "0.875rem", color: "#2563eb", cursor: "pointer", border: "none", background: "none" }}
              >
                View All
              </button>
            </div>
            <div style={{ display: "grid", gap: "1rem" }}>
              <ParcelCard
                parcel={{
                  id: "12345",
                  recipientName: "Alice",
                  deliveryAddress: "123 Main St",
                  status: "in-transit",
                }}
              />
            </div>
          </>
        )}

        {view === "parcels" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>My Parcels</h2>
              <input
                type="text"
                placeholder="Filter by name or status..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  border: "1px solid #d1d5db",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              />
            </div>

            {loadingParcels && <p style={{ color: "#6b7280" }}>Loading parcels...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ display: "grid", gap: "1rem" }}>
              {filteredParcels.map((parcel) => (
                <ParcelCard key={parcel.id} parcel={parcel} />
              ))}
              {filteredParcels.length === 0 && !loadingParcels && !error && (
                <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No parcels found.</p>
              )}
            </div>
          </>
        )}

        {view === "form" && <ParcelForm />}
      </main>
    </div>
  );
}
