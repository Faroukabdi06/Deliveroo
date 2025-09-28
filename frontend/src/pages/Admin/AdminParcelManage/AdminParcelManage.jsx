import React, { useState } from 'react';
import ParcelMap from '../components/ParcelMap';

const AdminParcelManage = ({ parcel }) => {
  const [currentParcel, setCurrentParcel] = useState(parcel);

  const handleLocationUpdate = async (parcelId, newLocation) => {
    try {
      // API call to update parcel location
      const response = await fetch(`/api/parcels/${parcelId}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentLocation: newLocation
        }),
      });

      if (response.ok) {
        // Update local state
        setCurrentParcel(prev => ({
          ...prev,
          currentLocation: newLocation
        }));
        
        // Show success message
        alert('Location updated successfully!');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Error updating location');
    }
  };

  return (
    <div className="admin-parcel-manage">
      <h2>Manage Parcel: {currentParcel.trackingNumber}</h2>
      
      <ParcelMap
        pickupAddress={currentParcel.pickupAddress}
        destinationAddress={currentParcel.destinationAddress}
        currentLocation={currentParcel.currentLocation}
        parcelId={currentParcel.id}
        isAdmin={true}
        onLocationUpdate={handleLocationUpdate}
      />
      
      {/* Admin controls */}
      <div className="admin-controls">
        <h3>Parcel Management</h3>
        <button onClick={() => handleStatusUpdate('PICKED_UP')}>
          Mark as Picked Up
        </button>
        <button onClick={() => handleStatusUpdate('IN_TRANSIT')}>
          Mark as In Transit
        </button>
        <button onClick={() => handleStatusUpdate('DELIVERED')}>
          Mark as Delivered
        </button>
      </div>
    </div>
  );
};

export default AdminParcelManage;