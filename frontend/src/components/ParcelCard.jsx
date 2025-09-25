import { useNavigate } from "react-router-dom";

export default function ParcelCard({ parcel }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/parcels/${parcel.id}`)}
      className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
    >
      <h2 className="font-bold text-lg">Tracking ID: {parcel.tracking_id}</h2>
      <p>Status: <span className="font-medium">{parcel.status}</span></p>
      <p>Pickup: {parcel.pickup_address}</p>
      <p>Destination: {parcel.destination_address}</p>
      <p className="text-sm text-gray-500">
        Last updated: {new Date(parcel.updated_at).toLocaleString()}
      </p>
    </div>
  );
}
