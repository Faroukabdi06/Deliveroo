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
      // Optionally: refresh list
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
      className="border border-gray-200 rounded-xl p-4 bg-white cursor-pointer shadow transition-shadow hover:shadow-lg"
    >
      <h2 className="text-lg font-bold mb-2">
        Tracking ID: {parcel.tracking_id || parcel.id}
      </h2>
      <p className="mb-1">
        <strong>Status:</strong>{" "}
        <span className="font-medium">{parcel.status}</span>
      </p>
      <p><strong>Pickup:</strong> {parcel.pickup_address || "N/A"}</p>
      <p><strong>Destination:</strong> {parcel.destination_address || "N/A"}</p>
      <p className="text-xs text-slate-500 mb-3">
        Last updated: {parcel.updated_at ? new Date(parcel.updated_at).toLocaleString() : "Not available"}
      </p>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTrack();
          }}
          disabled={loadingAction}
          className="px-3 py-1.5 rounded-md border border-blue-600 bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Track
        </button>

        <button
          onClick={handleUpdateDestination}
          disabled={loadingAction}
          className="px-3 py-1.5 rounded-md border border-gray-200 bg-slate-100 text-sm hover:bg-slate-200 disabled:opacity-50"
        >
          Update
        </button>

        <button
          onClick={handleCancelParcel}
          disabled={loadingAction}
          className="px-3 py-1.5 rounded-md border border-red-600 bg-white text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
