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
  if (!parcel) return <p className="text-center text-gray-600">{error || "Parcel not found."}</p>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Parcel Details</h1>

      {error && <p className="text-red-600">{error}</p>}

      
      <div className="border border-gray-200 p-6 rounded-xl shadow-sm bg-white space-y-2">
        <p>
          <span className="font-semibold">Tracking ID:</span> {parcel.tracking_id}
        </p>
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              parcel.status === "DELIVERED"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {parcel.status}
          </span>
        </p>
        <p>
          <span className="font-semibold">Pickup:</span> {parcel.pickup_address}
        </p>
        <p>
          <span className="font-semibold">Destination:</span>{" "}
          {parcel.destination_address}
        </p>
      </div>

      
      <div className="space-y-6">
        <ParcelTimeline events={parcel.history} />
        <ParcelMap pickup={parcel.pickup_address} destination={parcel.destination_address} />
      </div>

      
      {parcel.status !== "DELIVERED" && (
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : "Cancel Parcel"}
          </button>
          <button
            onClick={handleUpdateDestination}
            disabled={actionLoading}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600 disabled:opacity-50"
          >
            {actionLoading ? "Updating..." : "Update Destination"}
          </button>
        </div>
      )}
    </div>
  );
}
