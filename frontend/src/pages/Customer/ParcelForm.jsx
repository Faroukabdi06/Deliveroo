import { useState } from "react";

export default function MultiStepParcelForm({ onClose, onSuccess }) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = 3;

  const [formData, setFormData] = useState({
    pickup_address: {
      name: "",
      street: "",
      city: "",
      postal_code: "",
      country: "",
    },
    delivery_address: {
      name: "",
      street: "",
      city: "",
      postal_code: "",
      country: "",
    },
    weight_kg: "",
    notes: "",
  });

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      style={{
        padding: "24px",
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
        maxWidth: "36rem",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#111827" }}>
        New Parcel
      </h2>

      {/* Progress Bar */}
      <div style={{ width: "100%", backgroundColor: "#e5e7eb", borderRadius: "9999px", height: "8px" }}>
        <div
          style={{
            backgroundColor: "#2563eb",
            height: "8px",
            borderRadius: "9999px",
            transition: "all 0.3s",
            width: `${progress}%`,
          }}
        />
      </div>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {/* Step 1: Pickup Address */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input name="name" placeholder="Pickup Name" value={formData.pickup_address.name} onChange={(e) => handleChange(e, "pickup_address")} required />
          <input name="street" placeholder="Pickup Street" value={formData.pickup_address.street} onChange={(e) => handleChange(e, "pickup_address")} required />
          <input name="city" placeholder="Pickup City" value={formData.pickup_address.city} onChange={(e) => handleChange(e, "pickup_address")} required />
          <input name="postal_code" placeholder="Postal Code" value={formData.pickup_address.postal_code} onChange={(e) => handleChange(e, "pickup_address")} />
          <input name="country" placeholder="Country" value={formData.pickup_address.country} onChange={(e) => handleChange(e, "pickup_address")} required />
          <button type="button" onClick={nextStep}>Next</button>
        </div>
      )}

      {/* Step 2: Delivery Address */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input name="name" placeholder="Receiver Name" value={formData.delivery_address.name} onChange={(e) => handleChange(e, "delivery_address")} required />
          <input name="street" placeholder="Receiver Street" value={formData.delivery_address.street} onChange={(e) => handleChange(e, "delivery_address")} required />
          <input name="city" placeholder="Receiver City" value={formData.delivery_address.city} onChange={(e) => handleChange(e, "delivery_address")} required />
          <input name="postal_code" placeholder="Postal Code" value={formData.delivery_address.postal_code} onChange={(e) => handleChange(e, "delivery_address")} />
          <input name="country" placeholder="Country" value={formData.delivery_address.country} onChange={(e) => handleChange(e, "delivery_address")} required />

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="button" onClick={prevStep}>Back</button>
            <button type="button" onClick={nextStep}>Next</button>
          </div>
        </div>
      )}

      {/* Step 3: Parcel Details */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input type="number" name="weight_kg" placeholder="Weight (kg)" value={formData.weight_kg} onChange={handleChange} required />
          <textarea name="notes" placeholder="Notes (optional)" value={formData.notes} onChange={handleChange} />

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="button" onClick={prevStep}>Back</button>
            <button type="submit" disabled={loading} style={{ backgroundColor: "#2563eb", color: "white", padding: "8px 16px", borderRadius: "4px", border: "none" }}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
