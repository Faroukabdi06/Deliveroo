import React from 'react';
import ParcelMap from '../components/ParcelMap';
import './ParcelMap/ParcelMap.css'; // Import CSS

const ParcelDetails = ({ parcel }) => {
  return (
    <div className="parcel-details">
      <h2>Parcel Tracking</h2>
      <ParcelMap
        pickupAddress={parcel.pickupAddress}
        destinationAddress={parcel.destinationAddress}
        currentLocation={parcel.currentLocation}
        parcelId={parcel.id}
        isAdmin={false}
      />
      
      {/* Other parcel details */}
      <div className="parcel-info">
        <h3>Parcel Information</h3>
        <p><strong>Status:</strong> {parcel.status}</p>
        <p><strong>Tracking ID:</strong> {parcel.trackingNumber}</p>
      </div>
    </div>
  );
};

export default ParcelDetails;git add