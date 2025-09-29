// pages/AdminParcelManage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SideNav from "../../components/admin/SideNav";
import TopBar from "../../components/admin/TopBar";
import api from "../../api/axios";
import "../../styles/Admin.css";

const statusOptions = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const AdminParcelManage = () => {
  const { id } = useParams();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState("");

  // Fetch parcel details
  useEffect(() => {
    const fetchParcel = async () => {
      try {
        const res = await api.get(`/admin/parcels/${id}`);
        if (res.data.success) {
          const p = res.data.data;
          setParcel(p);
          setStatus(p.status);
          if (p.current_location) {
            setLat(p.current_location.lat ?? "");
            setLng(p.current_location.lng ?? "");
          }
        }
      } catch (err) {
        console.error(err.response || err);
        setError("Failed to fetch parcel. Check console for details.");
      } finally {
        setLoading(false);
      }
    };
    fetchParcel();
  }, [id]);

  // Handle status update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const payload = { status, notes };

      // Only include location if both lat and lng are provided
      if (lat !== "" && lng !== "") {
        payload.location = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        };
      }

      const res = await api.post(`/admin/parcels/${id}/status`, payload);

      if (res.data.success) {
        alert(res.data.msg);
        // Refresh parcel data
        const updated = await api.get(`/admin/parcels/${id}`);
        setParcel(updated.data.data);
        setNotes("");
        setLat("");
        setLng("");
        setError("");
      }
    } catch (err) {
      console.error(err.response || err);
      setError(
        err.response?.data?.msg ||
        "Failed to update status. Check console for details."
      );
    }
  };

  if (loading) return <p>Loading parcel...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!parcel) return <p>Parcel not found</p>;

  return (
    <div className="admin-container">
      <SideNav />
      <main className="admin-main">
        <TopBar title={`Manage Parcel ${parcel.tracking_id}`} />

        {/* Parcel Info */}
        <section className="parcel-details">
          <h2>Parcel Information</h2>
          <p><strong>Tracking ID:</strong> {parcel.tracking_id}</p>
          <p><strong>Customer:</strong> {parcel.customer?.name}</p>
          <p><strong>Status:</strong> {parcel.status}</p>
          <p>
            <strong>Pickup:</strong> {parcel.pickup_address?.street}, {parcel.pickup_address?.city}
          </p>
          <p>
            <strong>Delivery:</strong> {parcel.delivery_address?.street}, {parcel.delivery_address?.city}
          </p>
        </section>

        {/* Update Status Form */}
        <section className="update-status-form">
          <h2>Update Status</h2>
          <form onSubmit={handleUpdateStatus}>
            <label>Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <label>Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
            />

            <label>Location (optional):</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                step="0.000001"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                step="0.000001"
              />
            </div>

            <button type="submit">Update Parcel</button>
          </form>
        </section>

        {/* Status History */}
        <section className="status-history">
          <h2>Status History</h2>
          <ul>
            {parcel.status_history?.map((h) => (
              <li key={h.id}>
                <strong>{h.status}</strong> - {new Date(h.timestamp).toLocaleString()}<br />
                Notes: {h.notes || "None"}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default AdminParcelManage;
