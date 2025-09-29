import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ParcelCard({ parcel }) {
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleTrack = () => {
    navigate(`/parcels/${parcel.id}`);
  };

  const handleUpdateDestination = async (e) => {
    e.stopPropagation();
    const newAddress = prompt("Enter new destination address:");
    if (!newAddress) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`${BASE_URL}/parcels/${parcel.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ destination_address: newAddress }),
      });

      if (!res.ok) throw new Error("Failed to update destination");
      alert("Destination updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating destination");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancelParcel = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Cancel this parcel?")) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`${BASE_URL}/parcels/${parcel.id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to cancel parcel");
      alert("Parcel cancelled.");
    } catch (err) {
      console.error(err);
      alert("Error cancelling parcel");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div
      onClick={handleTrack}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "1rem",
        backgroundColor: "white",
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)")
      }
    >
      <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        Tracking ID: {parcel.tracking_id || parcel.id}
      </h2>
      <p style={{ marginBottom: "0.25rem" }}>
        <strong>Status:</strong>{" "}
        <span style={{ fontWeight: 500 }}>{parcel.status}</span>
      </p>
      <p>
        <strong>Pickup:</strong> {parcel.pickup_address || "N/A"}
      </p>
      <p>
        <strong>Destination:</strong> {parcel.destination_address || "N/A"}
      </p>
      <p
        style={{
          fontSize: "0.75rem",
          color: "#64748b",
          marginBottom: "0.75rem",
        }}
      >
        Last updated:{" "}
        {parcel.updated_at
          ? new Date(parcel.updated_at).toLocaleString()
          : "Not available"}
      </p>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTrack();
          }}
          disabled={loadingAction}
          style={{
            padding: "0.375rem 0.75rem",
            borderRadius: "0.375rem",
            border: "1px solid #2563eb",
            backgroundColor: "#2563eb",
            color: "white",
            fontSize: "0.875rem",
            cursor: "pointer",
            opacity: loadingAction ? 0.5 : 1,
          }}
        >
          Track
        </button>

        <button
          onClick={handleUpdateDestination}
          disabled={loadingAction}
          style={{
            padding: "0.375rem 0.75rem",
            borderRadius: "0.375rem",
            border: "1px solid #e5e7eb",
            backgroundColor: "#f1f5f9",
            fontSize: "0.875rem",
            cursor: "pointer",
            opacity: loadingAction ? 0.5 : 1,
          }}
        >
          Update
        </button>

        <button
          onClick={handleCancelParcel}
          disabled={loadingAction}
          style={{
            padding: "0.375rem 0.75rem",
            borderRadius: "0.375rem",
            border: "1px solid #dc2626",
            backgroundColor: "white",
            color: "#dc2626",
            fontSize: "0.875rem",
            cursor: "pointer",
            opacity: loadingAction ? 0.5 : 1,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
