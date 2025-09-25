import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ParcelForm() {
  const [form, setForm] = useState({
    pickup_address: "",
    destination_address: "",
    weight: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create parcel");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error creating parcel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Parcel</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="pickup_address"
          placeholder="Pickup Address"
          value={form.pickup_address}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          name="destination_address"
          placeholder="Destination Address"
          value={form.destination_address}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          name="weight"
          type="number"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Parcel"}
        </button>
      </form>
    </div>
  );
}
