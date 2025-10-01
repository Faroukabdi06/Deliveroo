// App.jsx - Test component
import React from 'react';
import ParcelMap from './components/ParcelMap';

const testParcel = {
  id: '123',
  pickupAddress: '1600 Amphitheatre Parkway, Mountain View, CA',
  destinationAddress: '1 Apple Park Way, Cupertino, CA',
  currentLocation: { lat: 37.422, lng: -122.084 },
  status: 'IN_TRANSIT'
};

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Parcel Map</h1>
      <ParcelMap
        pickupAddress={testParcel.pickupAddress}
        destinationAddress={testParcel.destinationAddress}
        currentLocation={testParcel.currentLocation}
      />
    </div>
  );
}

export default App;