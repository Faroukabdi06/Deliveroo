import { useState } from "react";

export default function MultiStepParcelForm({ onClose, onSuccess }) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = 3;

  const [formData, setFormData] = useState({
    senderName: "",
    senderAddress: "",
    receiverName: "",
    receiverAddress: "",
    parcelType: "",
    weight: "",
    deliveryDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/parcels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create parcel");

      const data = await res.json();
      onSuccess?.(data);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow rounded-lg space-y-6 w-full max-w-xl"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-2">New Parcel</h2>

      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}

      
      {step === 1 && (
        <div className="space-y-4">
          <input
            type="text"
            name="senderName"
            placeholder="Sender Name"
            value={formData.senderName}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="senderAddress"
            placeholder="Sender Address"
            value={formData.senderAddress}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      
      {step === 2 && (
        <div className="space-y-4">
          <input
            type="text"
            name="receiverName"
            placeholder="Receiver Name"
            value={formData.receiverName}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="receiverAddress"
            placeholder="Receiver Address"
            value={formData.receiverAddress}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
            >
              Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      
      {step === 3 && (
        <div className="space-y-4">
          <input
            type="text"
            name="parcelType"
            placeholder="Parcel Type (e.g., Document, Box)"
            value={formData.parcelType}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
