import { useState } from "react";
import {
  Home,
  Package,
  PlusCircle,
  Settings,
  Activity,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import ParcelForm from "./ParcelForm";
import ParcelCard from "../../components/ParcelCard";

export default function CustomerDashboard({ user }) {
  const [view, setView] = useState("dashboard");
  const [filter, setFilter] = useState("");

  // Static parcels (no backend yet)
  const parcels = [
    { id: "123", recipientName: "Alice", deliveryAddress: "123 Main St", status: "in-transit" },
    { id: "124", recipientName: "Bob", deliveryAddress: "456 Park Ave", status: "delivered" },
    { id: "125", recipientName: "Charlie", deliveryAddress: "789 High St", status: "pending" },
  ];

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
        }}
      >
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2563eb" }}>Deliveroo</h1>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Delivery Platform</p>
        </div>

        <nav style={{ flex: 1, padding: "1rem" }}>
          <button
            onClick={() => setView("dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              backgroundColor: view === "dashboard" ? "#eff6ff" : "transparent",
              color: view === "dashboard" ? "#2563eb" : "#374151",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Home size={18} /> Dashboard
          </button>
          <button
            onClick={() => setView("parcels")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              backgroundColor: view === "parcels" ? "#eff6ff" : "transparent",
              color: view === "parcels" ? "#2563eb" : "#374151",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Package size={18} /> My Parcels
          </button>
          <button
            onClick={() => setView("form")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              backgroundColor: view === "form" ? "#eff6ff" : "transparent",
              color: view === "form" ? "#2563eb" : "#374151",
              border: "none",
              cursor: "pointer",
            }}
          >
            <PlusCircle size={18} /> Send Parcel
          </button>
        </nav>

        <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb" }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#374151",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            <Settings size={18} /> Settings
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
            <img
              src="https://via.placeholder.com/40"
              alt="profile"
              style={{ width: "2.5rem", height: "2.5rem", borderRadius: "9999px" }}
            />
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: "500" }}>{user?.name || "John Smith"}</p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Customer Account</p>
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

            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div style={{ padding: "1rem", backgroundColor: "#eff6ff", borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.875rem", color: "#2563eb" }}>Active Deliveries</p>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>1</p>
                <div style={{ display: "flex", gap: "0.25rem", fontSize: "0.75rem", color: "#2563eb" }}>
                  <Activity size={14} /> In progress
                </div>
              </div>
              <div style={{ padding: "1rem", backgroundColor: "#ecfdf5", borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.875rem", color: "#059669" }}>Completed</p>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>0</p>
                <div style={{ display: "flex", gap: "0.25rem", fontSize: "0.75rem", color: "#059669" }}>
                  <CheckCircle size={14} /> Delivered
                </div>
              </div>
              <div style={{ padding: "1rem", backgroundColor: "#f5f3ff", borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.875rem", color: "#7c3aed" }}>Total Parcels</p>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>15</p>
                <div style={{ display: "flex", gap: "0.25rem", fontSize: "0.75rem", color: "#7c3aed" }}>
                  <BarChart3 size={14} /> All time
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <button
                onClick={() => setView("form")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "1.5rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                <PlusCircle style={{ color: "#2563eb", marginBottom: "0.5rem" }} size={28} />
                <p style={{ fontWeight: "500" }}>Send Parcel</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Create new delivery</p>
              </button>
              <button
                onClick={() => setView("parcels")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "1.5rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                <Package style={{ color: "#059669", marginBottom: "0.5rem" }} size={28} />
                <p style={{ fontWeight: "500" }}>My Parcels</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>1 active delivery</p>
              </button>
            </div>

            {/* Recent Parcels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Recent Parcels</h3>
              <button
                onClick={() => setView("parcels")}
                style={{ fontSize: "0.875rem", color: "#2563eb", cursor: "pointer" }}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
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
                }}
              />
            </div>
            <div style={{ display: "grid", gap: "1rem" }}>
              {filteredParcels.map((parcel) => (
                <ParcelCard key={parcel.id} parcel={parcel} />
              ))}
              {filteredParcels.length === 0 && (
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
