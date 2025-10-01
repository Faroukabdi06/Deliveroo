import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = { lat: 0, lng: 0 };

const ParcelMap = ({ 
  pickupAddress, 
  destinationAddress, 
  currentLocation, 
  parcelId,
  isAdmin = false,
  onLocationUpdate 
}) => {
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markerIcons, setMarkerIcons] = useState(null); 
  const mapRef = useRef();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    if (isLoaded && window.google) {
      setMarkerIcons({
        pickup: {
          url: "data:image/svg+xml;base64,...",
          scaledSize: new window.google.maps.Size(32, 32)
        },
        destination: {
          url: "data:image/svg+xml;base64,...",
          scaledSize: new window.google.maps.Size(32, 32)
        },
        current: {
          url: "data:image/svg+xml;base64,...",
          scaledSize: new window.google.maps.Size(28, 28)
        }
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && pickupAddress && destinationAddress) {
      calculateRoute();
    }
  }, [isLoaded, pickupAddress, destinationAddress]);

  const calculateRoute = async () => {
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: pickupAddress,
        destination: destinationAddress,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setDistance(result.routes[0].legs[0].distance.text);
          setDuration(result.routes[0].legs[0].duration.text);
        } else {
          console.error('Error fetching directions:', status);
        }
      }
    );
  };

  const handleMapClick = (event) => {
    if (isAdmin && onLocationUpdate) {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      onLocationUpdate(parcelId, newLocation);
    }
  };

  const getMapCenter = () => {
    if (currentLocation && currentLocation.lat !== 0) return currentLocation;
    if (directions) return directions.routes[0].bounds.getCenter();
    return defaultCenter;
  };

  if (!isLoaded || !markerIcons) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="parcel-map">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={getMapCenter()}
        zoom={10}
        onLoad={map => { mapRef.current = map; }}
        onClick={handleMapClick}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#4285F4",
                strokeWeight: 4,
                strokeOpacity: 0.7
              },
              suppressMarkers: true
            }}
          />
        )}

        {directions && (
          <Marker
            position={directions.routes[0].legs[0].start_location}
            icon={markerIcons.pickup}
            onClick={() => setSelectedMarker("pickup")}
          />
        )}

        {directions && (
          <Marker
            position={directions.routes[0].legs[0].end_location}
            icon={markerIcons.destination}
            onClick={() => setSelectedMarker("destination")}
          />
        )}

        {currentLocation && currentLocation.lat !== 0 && (
          <Marker
            position={currentLocation}
            icon={markerIcons.current}
            onClick={() => setSelectedMarker("current")}
          />
        )}
      </GoogleMap>

      <div className="route-info">
        <div className="info-item">
          <span className="label">Distance:</span>
          <span className="value">{distance || "Calculating..."}</span>
        </div>
        <div className="info-item">
          <span className="label">Estimated Time:</span>
          <span className="value">{duration || "Calculating..."}</span>
        </div>
        {isAdmin && (
          <div className="admin-note">
            <small>💡 Click on the map to update current parcel location</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParcelMap;
