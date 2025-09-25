import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ParcelTimeline from "../../components/ParcelTimeline";
import ParcelMap from "../../components/ParcelMap";
import Spinner from "../../components/Spinner";

export default function ParcelDetails() {
  const { id } = useParams();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        const res = await fetch(`http://localhost:5000/parcels/${id}`);
        const data = await res.json();
        setParcel(data);
      } catch (err) {
        console.error("Error fetching parcel:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParcel();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this parcel?")) return;
    try {
      const res = await fetch(`http://localhost:5000/parcels/${id}/cancel`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to cancel parcel");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error cancelling parcel");
    }
  };

  const handleUpdateDestination = async () => {
    const newAddress = prompt("Enter new destination address:");
    if (!newAddress) return;

    try {
      const res = await fetch(`http://localhost:5000/parcels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_address: newAddress }),
      });
      if (!res.ok) throw new Error("Failed to update parcel");
      setParcel({ ...parcel, destination_address: newAddress });
    } catch (err) {
      console.error(err);
      alert("Error updating destination");
    }
  };

  if (loading) return <Spinner />;
  if (!parcel) return <p>Parcel not found.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Parcel Details</h1>

      <div className="border p-4 rounded shadow">
        <p><strong>Tracking ID:</strong> {parcel.tracking_id}</p>
        <p><strong>Status:</strong> {parcel.status}</p>
        <p><strong>Pickup:</strong> {parcel.pickup_address}</p>
        <p><strong>Destination:</strong> {parcel.destination_address}</p>
      </div>

      <ParcelTimeline events={parcel.history} />
      <ParcelMap pickup={parcel.pickup_address} destination={parcel.destination_address} />

      {parcel.status !== "DELIVERED" && (
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cancel Parcel
          </button>
          <button
            onClick={handleUpdateDestination}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Update Destination
          </button>
        </div>
      )}
    </div>
  );
}
