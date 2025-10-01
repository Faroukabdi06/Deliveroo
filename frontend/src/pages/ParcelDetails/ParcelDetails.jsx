import React, { useState, useEffect } from 'react';
import ParcelMap from '../components/ParcelMap';
import ParcelTimeline from '../components/ParcelTimeline';
import './ParcelDetails.css';

const ParcelDetails = ({ parcelId }) => {
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParcelDetails();
  }, [parcelId]);

  const fetchParcelDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/parcels/${parcelId}`);
      
      if (!response.ok) {
        throw new Error('Parcel not found');
      }
      
      const parcelData = await response.json();
      setParcel(parcelData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="parcel-details-loading">
        <div className="loading-spinner">Loading parcel details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parcel-details-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="parcel-details-not-found">
        <h2>Parcel Not Found</h2>
      </div>
    );
  }

  return (
    <div className="parcel-details">
      <div className="parcel-header">
        <h1>Parcel Tracking</h1>
        <div className="tracking-info">
          <span className="tracking-number">
            Tracking #: {parcel.trackingNumber}
          </span>
          <span className={`status-badge status-${parcel.status.toLowerCase()}`}>
            {parcel.status}
          </span>
        </div>
      </div>

      <div className="parcel-content">
        {/* Map Section */}
        <section className="map-section">
          <h2>Live Tracking</h2>
          <ParcelMap
            pickupAddress={parcel.pickupAddress}
            destinationAddress={parcel.destinationAddress}
            currentLocation={parcel.currentLocation}
            parcelId={parcel.id}
            isAdmin={false}
          />
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          <h2>Delivery Progress</h2>
          <ParcelTimeline
            statusHistory={parcel.statusHistory || []}
            currentStatus={parcel.status}
          />
        </section>

        {/* Parcel Information */}
        <section className="parcel-info-section">
          <h2>Parcel Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Sender:</label>
              <span>{parcel.senderName}</span>
            </div>
            <div className="info-item">
              <label>Recipient:</label>
              <span>{parcel.recipientName}</span>
            </div>
            <div className="info-item">
              <label>Package Type:</label>
              <span>{parcel.packageType}</span>
            </div>
            <div className="info-item">
              <label>Weight:</label>
              <span>{parcel.weight} kg</span>
            </div>
            <div className="info-item">
              <label>Dimensions:</label>
              <span>{parcel.dimensions}</span>
            </div>
            <div className="info-item">
              <label>Created:</label>
              <span>{new Date(parcel.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ParcelDetails;