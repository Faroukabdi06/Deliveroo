import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SideNav from "../../components/admin/SideNav";
import TopBar from "../../components/admin/TopBar";
import api from "../../api/axios";
import MapComponent from "../../components/Maps/Maps";
import { getDistanceDuration } from "../../components/Maps/Distance";
import L from "leaflet";
import "../../styles/Admin.css";
import Spinner from "../../components/customer/spinner";

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
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  // Custom icon for current location
  const currentLocationIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // different color pin
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

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

          // Fetch distance & duration
          if (p.pickup_address?.lat && p.delivery_address?.lat) {
            try {
              const result = await getDistanceDuration(
                { lat: parseFloat(p.pickup_address.lat), lng: parseFloat(p.pickup_address.lng) },
                { lat: parseFloat(p.delivery_address.lat), lng: parseFloat(p.delivery_address.lng) }
              );
              setDistance(result.distance);
              setDuration(result.duration);
            } catch (err) {
              console.error("Failed to get distance/duration:", err);
            }
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

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const payload = { status, notes };

      if (lat !== "" && lng !== "") {
        payload.location = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        };
      }

      const res = await api.post(`/admin/parcels/${id}/status`, payload);

      if (res.data.success) {
        alert(res.data.msg);
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
        err.response?.data?.msg || "Failed to update status. Check console for details."
      );
    }
  };

  if (loading) return <Spinner/>;
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

            <label>Current Location (click on map to set):</label>
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
            {parcel.status_history?.map((h,index) => (
              <li key={h.id || index}>
                <strong>{h.status}</strong> - {new Date(h.timestamp).toLocaleString()}<br />
                Notes: {h.notes || "None"}
              </li>
            ))}
          </ul>
        </section>

        {/* Map & Distance */}
        <section className="parcel-map">
          <h2>Parcel Route</h2>
          {parcel.pickup_address?.lat && parcel.delivery_address?.lat ? (
            <>
              <MapComponent
                pickup={{ lat: parseFloat(parcel.pickup_address.lat), lng: parseFloat(parcel.pickup_address.lng) }}
                destination={{ lat: parseFloat(parcel.delivery_address.lat), lng: parseFloat(parcel.delivery_address.lng) }}
                currentLocation={lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null}
                onMapClick={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
                currentLocationIcon={currentLocationIcon}
                isAdmin={true} // Admin can drag and update location
              />

              <p><strong>Distance:</strong> {distance}</p>
              <p><strong>Estimated Duration:</strong> {duration}</p>
            </>
          ) : (
            <p>Pickup or delivery coordinates are missing.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminParcelManage;
