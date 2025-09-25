import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ParcelCard from "../../components/ParcelCard";
import Spinner from "../../components/Spinner";

export default function Dashboard() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const res = await fetch("http://localhost:5000/parcels/my"); // Replace with your backend URL
        const data = await res.json();
        setParcels(data);
      } catch (err) {
        console.error("Error fetching parcels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Parcels</h1>
        <button
          onClick={() => navigate("/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Parcel
        </button>
      </div>

      {parcels.length === 0 ? (
        <p>No parcels yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {parcels.map((parcel) => (
            <ParcelCard key={parcel.id} parcel={parcel} />
          ))}
        </div>
      )}
    </div>
  );
}
