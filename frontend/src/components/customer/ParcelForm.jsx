// src/pages/customer/ParcelForm.jsx
import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createCustomerParcel } from "../../features/customer/customerSlice";
import MapComponent from "../Maps/Maps";
import { reverseGeocode as getAddressFromCoords } from "../Maps/Distance";
import "../../styles/ParcelForm.css";
import CustomerSideNav from "./CustomerSideNav";

export default function ParcelForm({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.customer);

  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    senderStreet: "",
    senderCity: "",
    senderCountry: "",
    senderPostal: "",
    senderLat: null,
    senderLng: null,
    receiverStreet: "",
    receiverCity: "",
    receiverCountry: "",
    receiverPostal: "",
    receiverLat: null,
    receiverLng: null,
    weight: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // 🔹 Handle map click → update address automatically
  const handleMapClick = async (lat, lng, type) => {
    try {
      const address = await getAddressFromCoords(lat, lng);

      if (type === "pickup") {
        setFormData((prev) => ({
          ...prev,
          senderLat: lat,
          senderLng: lng,
          senderStreet: address.street,
          senderCity: address.city,
          senderCountry: address.country,
          senderPostal: address.postal_code,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          receiverLat: lat,
          receiverLng: lng,
          receiverStreet: address.street,
          receiverCity: address.city,
          receiverCountry: address.country,
          receiverPostal: address.postal_code,
        }));
      }
    } catch (err) {
      console.error("Error reverse geocoding:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      weight_kg: Number(formData.weight),
      pickup_address: {
        street: formData.senderStreet,
        city: formData.senderCity,
        country: formData.senderCountry,
        postal_code: formData.senderPostal,
        lat: formData.senderLat,
        lng: formData.senderLng,
      },
      delivery_address: {
        street: formData.receiverStreet,
        city: formData.receiverCity,
        country: formData.receiverCountry,
        postal_code: formData.receiverPostal,
        lat: formData.receiverLat,
        lng: formData.receiverLng,
      },
    };

    try {
      const action = await dispatch(createCustomerParcel(payload)).unwrap();
      setSuccessMessage(`Parcel ${action.tracking_id} created successfully!`);
      setTimeout(() => {
        navigate("/customer/parcels");
        onClose?.();
      }, 1500);
    } catch (err) {
      console.error("Failed to create parcel", err);
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="form-page-container">

      {/* 🔹 Main Content */}
      <div className="parcel-form-container">
        <form onSubmit={handleSubmit} className="parcel-form">
          <h2>New Parcel</h2>

          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }} />
          </div>

          {error && <p className="form-error">{error}</p>}
          {successMessage && <p className="form-success">{successMessage}</p>}

          {/* Step 1: Pickup Info & Map */}
          {step === 1 && (
            <div className="form-step">
              <input
                type="text"
                name="senderStreet"
                placeholder="Sender Street"
                value={formData.senderStreet}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="senderCity"
                placeholder="Sender City"
                value={formData.senderCity}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="senderCountry"
                placeholder="Sender Country"
                value={formData.senderCountry}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="senderPostal"
                placeholder="Sender Postal Code"
                value={formData.senderPostal}
                onChange={handleChange}
              />

              <h4>Select Pickup Location on Map</h4>
              <MapComponent
                pickup={
                  formData.senderLat && formData.senderLng
                    ? { lat: formData.senderLat, lng: formData.senderLng }
                    : null
                }
                destination={null}
                onMapClick={(lat, lng) => handleMapClick(lat, lng, "pickup")}
                isAdmin // 🔹 allow selecting by click
              />

              <div className="form-buttons">
                <button type="button" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Info & Map */}
          {step === 2 && (
            <div className="form-step">
              <input
                type="text"
                name="receiverStreet"
                placeholder="Receiver Street"
                value={formData.receiverStreet}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="receiverCity"
                placeholder="Receiver City"
                value={formData.receiverCity}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="receiverCountry"
                placeholder="Receiver Country"
                value={formData.receiverCountry}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="receiverPostal"
                placeholder="Receiver Postal Code"
                value={formData.receiverPostal}
                onChange={handleChange}
              />

              <h4>Select Delivery Location on Map</h4>
              <MapComponent
                pickup={
                  formData.receiverLat && formData.receiverLng
                    ? { lat: formData.receiverLat, lng: formData.receiverLng }
                    : null
                }
                destination={null}
                onMapClick={(lat, lng) => handleMapClick(lat, lng, "delivery")}
                isAdmin // 🔹 allow selecting by click
              />

              <div className="form-buttons">
                <button type="button" onClick={prevStep}>
                  Back
                </button>
                <button type="button" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Weight */}
          {step === 3 && (
            <div className="form-step">
              <input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={handleChange}
                required
              />
              <div className="form-buttons">
                <button type="button" onClick={prevStep}>
                  Back
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
