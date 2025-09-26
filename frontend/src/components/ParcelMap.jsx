import React, { useEffect, useState, useRef } from 'react';
import { LoadScript, GoogleMap, Marker, Polyline, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 0,
  lng: 0
};

const ParcelMap = ({ 
  pickupAddress, 
  destinationAddress, 
  currentLocation, 
  parcelId,
  isAdmin = false,
  onLocationUpdate // For admin to update current location
}) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    if (pickupAddress && destinationAddress) {
      calculateRoute();
    }
  }, [pickupAddress, destinationAddress]);

  const calculateRoute = async () => {
    if (!window.google) return;

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
    if (currentLocation && currentLocation.lat !== 0) {
      return currentLocation;
    }
    if (directions) {
      return directions.routes[0].bounds.getCenter();
    }
    return defaultCenter;
  };

  const markerIcons = {
    pickup: {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy4wMyAyIDMgNi4wMyAzIDExQzMgMTQuMjUgNC42IDE3LjE1IDcgMTguOUwxMiAyMkwxNyAxOC45QzE5LjQgMTcuMTUgMjEgMTQuMjUgMjEgMTFDMjEgNi4wMyAxNi45NyAyIDEyIDJaIiBmaWxsPSIjMzQ5OENGIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTEiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
      scaledSize: new window.google.maps.Size(32, 32)
    },
    destination: {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy4wMyAyIDMgNi4wMyAzIDExQzMgMTQuMjUgNC42IDE3LjE1IDcgMTguOUwxMiAyMkwxNyAxOC45QzE5LjQgMTcuMTUgMjEgMTQuMjUgMjEgMTFDMjEgNi4wMyAxNi45NyAyIDEyIDJaIiBmaWxsPSIjRjQ0MzM2Ii8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTEiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
      scaledSize: new window.google.maps.Size(32, 32)
    },
    current: {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMEE3NDUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
      scaledSize: new window.google.maps.Size(28, 28)
    }
  };

  return (
    <div className="parcel-map">
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={getMapCenter()}
          zoom={10}
          onLoad={map => {
            mapRef.current = map;
            setMap(map);
          }}
          onClick={handleMapClick}
        >
          {/* Route Line */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#4285F4',
                  strokeWeight: 4,
                  strokeOpacity: 0.7
                },
                suppressMarkers: true
              }}
            />
          )}

          {/* Pickup Marker */}
          {directions && (
            <Marker
              position={directions.routes[0].legs[0].start_location}
              icon={markerIcons.pickup}
              onClick={() => setSelectedMarker('pickup')}
            />
          )}

          {/* Destination Marker */}
          {directions && (
            <Marker
              position={directions.routes[0].legs[0].end_location}
              icon={markerIcons.destination}
              onClick={() => setSelectedMarker('destination')}
            />
          )}

          {/* Current Location Marker */}
          {currentLocation && currentLocation.lat !== 0 && (
            <Marker
              position={currentLocation}
              icon={markerIcons.current}
              onClick={() => setSelectedMarker('current')}
            />
          )}

          {/* Info Windows */}
          {selectedMarker === 'pickup' && directions && (
            <InfoWindow
              position={directions.routes[0].legs[0].start_location}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <h4>📦 Pickup Location</h4>
                <p>{pickupAddress}</p>
              </div>
            </InfoWindow>
          )}

          {selectedMarker === 'destination' && directions && (
            <InfoWindow
              position={directions.routes[0].legs[0].end_location}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <h4>🏁 Destination</h4>
                <p>{destinationAddress}</p>
              </div>
            </InfoWindow>
          )}

          {selectedMarker === 'current' && currentLocation && (
            <InfoWindow
              position={currentLocation}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <h4>🚚 Current Location</h4>
                <p>Parcel is here</p>
                {isAdmin && <small>Click map to update location</small>}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Route Information */}
      <div className="route-info">
        <div className="info-item">
          <span className="label">Distance:</span>
          <span className="value">{distance || 'Calculating...'}</span>
        </div>
        <div className="info-item">
          <span className="label">Estimated Time:</span>
          <span className="value">{duration || 'Calculating...'}</span>
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