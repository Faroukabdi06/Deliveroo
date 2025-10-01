import React from 'react';
import { LoadScript, GoogleMap } from '@react-google-maps/api';

const TestMap = () => {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={{ lat: 37.7749, lng: -122.4194 }}
        zoom={10}
      />
    </LoadScript>
  );
};

export default TestMap;