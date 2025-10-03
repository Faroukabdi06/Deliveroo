// src/components/customer/ParcelCard.jsx
import { useNavigate } from "react-router-dom";
import "../../styles/ParcelCard.css";

export default function ParcelCard({ parcel }) {
  const navigate = useNavigate();

  const handleTrack = () => {
    navigate(`/customer/parcels/${parcel.id}`);
  };

  const formatAddress = (addr) => {
    if (!addr) return "N/A";
    if (typeof addr === "string") return addr;
    return `${addr.street || ""}, ${addr.city || ""}, ${addr.postal_code || ""}, ${addr.country || ""}`;
  };

  const isCompleted =
    parcel.status === "DELIVERED" || parcel.status === "CANCELLED";

  return (
    <div className="parcel-card">
      <h2 className="parcel-card-title">
        Tracking ID: {parcel.tracking_id || parcel.id}
      </h2>

      <p className="parcel-card-text">
        <span className="parcel-card-label">Status:</span> {parcel.status}
      </p>

      <p className="parcel-card-text">
        <span className="parcel-card-label">Pickup:</span> {formatAddress(parcel.pickup_address)}
      </p>

      <p className="parcel-card-text">
        <span className="parcel-card-label">Destination:</span> {formatAddress(parcel.delivery_address)}
      </p>

      <p className="parcel-card-updated">
        Last updated: {parcel.updated_at ? new Date(parcel.updated_at).toLocaleString() : "Not available"}
      </p>

      {/* Show Track button only if parcel is active */}
      {!isCompleted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTrack();
          }}
          className="parcel-card-button"
        >
          Track
        </button>
      )}

      {/* Optional: show completed tag instead of button */}
      {isCompleted && (
        <p className="parcel-card-completed">
          {parcel.status === "DELIVERED" ? "Delivered ✅" : "Canceled ❌"}
        </p>
      )}
    </div>
  );
}
