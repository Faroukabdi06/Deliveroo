import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ParcelTimeline from "../../components/ParcelTimeline";
import ParcelMap from "../../components/ParcelMap";
import Spinner from "../../components/Spinner";

export default function ParcelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_BASE_URL;
        const res = await fetch(`${BASE_URL}/parcels/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch parcel");
        const data = await res.json();
        setParcel(data);
      } catch (err) {
        console.error("Error fetching parcel:", err);
        setError("Could not load parcel details.");
      } finally {
        setLoading(false);
      }
    };

    fetchParcel();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this parcel?")) return;

    setActionLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const res = await fetch(`${BASE_URL}/parcels/${id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to cancel parcel");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Error cancelling parcel. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDestination = async () => {
    const newAddress = prompt("Enter new destination address:");
    if (!newAddress) return;

    setActionLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const res = await fetch(`${BASE_URL}/parcels/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ destination_address: newAddress }),
      });

      if (!res.ok) throw new Error("Failed to update parcel");

      setParcel((prev) => ({
        ...prev,
        destination_address: newAddress,
      }));
    } catch (err) {
      console.error(err);
      setError("Error updating destination. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!parcel)
    return (
      <p style={{ textAlign: "center", color: "#4B5563" }}>
        {error || "Parcel not found."}
      </p>
    );

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#111827" }}>
        Parcel Details
      </h1>

      {error && <p style={{ color: "#DC2626" }}>{error}</p>}

      <div
        style={{
          border: "1px solid #E5E7EB",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          backgroundColor: "white",
        }}
      >
        <p>
          <span style={{ fontWeight: "600" }}>Tracking ID:</span>{" "}
          {parcel.tracking_id}
        </p>
        <p>
          <span style={{ fontWeight: "600" }}>Status:</span>{" "}
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor:
                parcel.status === "DELIVERED" ? "#D1FAE5" : "#FEF3C7",
              color: parcel.status === "DELIVERED" ? "#065F46" : "#92400E",
            }}
          >
            {parcel.status}
          </span>
        </p>
        <p>
          <span style={{ fontWeight: "600" }}>Pickup:</span>{" "}
          {parcel.pickup_address}
        </p>
        <p>
          <span style={{ fontWeight: "600" }}>Destination:</span>{" "}
          {parcel.destination_address}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <ParcelTimeline events={parcel.history} />
        <ParcelMap
          pickup={parcel.pickup_address}
          destination={parcel.destination_address}
        />
      </div>

      {parcel.status !== "DELIVERED" && (
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            style={{
              backgroundColor: "#DC2626",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: actionLoading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              opacity: actionLoading ? 0.5 : 1,
            }}
          >
            {actionLoading ? "Processing..." : "Cancel Parcel"}
          </button>
          <button
            onClick={handleUpdateDestination}
            disabled={actionLoading}
            style={{
              backgroundColor: "#F59E0B",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: actionLoading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              opacity: actionLoading ? 0.5 : 1,
            }}
          >
            {actionLoading ? "Updating..." : "Update Destination"}
          </button>
        </div>
      )}
    </div>
  );
}
