import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

// Default center (fallback)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const ParcelMap = ({
  pickupAddress,
  destinationAddress,
  currentLocation = null,
  parcelId = null,
  isAdmin = false,
  onLocationUpdate = null,
  zoom = 10
}) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  
  const mapRef = useRef();
  const directionsService = useRef();

  // Initialize map
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
    directionsService.current = new window.google.maps.DirectionsService();
  }, []);

  // Geocode addresses to coordinates
  const geocodeAddress = useCallback(async (address) => {
    if (!window.google) return null;
    
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          console.error('Geocode failed for:', address, status);
          resolve(null);
        }
      });
    });
  }, []);

  // Calculate route between pickup and destination
  const calculateRoute = useCallback(async () => {
    if (!pickupAddress || !destinationAddress || !directionsService.current) return;

    try {
      // Geocode both addresses
      const [pickupLocation, destLocation] = await Promise.all([
        geocodeAddress(pickupAddress),
        geocodeAddress(destinationAddress)
      ]);

      if (!pickupLocation || !destLocation) {
        console.error('Could not geocode one or both addresses');
        return;
      }

      setPickupCoords({
        lat: pickupLocation.lat(),
        lng: pickupLocation.lng()
      });

      setDestinationCoords({
        lat: destLocation.lat(),
        lng: destLocation.lng()
      });

      // Calculate center point for map
      const centerLat = (pickupLocation.lat() + destLocation.lat()) / 2;
      const centerLng = (pickupLocation.lng() + destLocation.lng()) / 2;
      setMapCenter({ lat: centerLat, lng: centerLng });

      // Get directions
      directionsService.current.route(
        {
          origin: pickupLocation,
          destination: destLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
            // Extract distance and duration
            if (result.routes[0]?.legs[0]) {
              setDistance(result.routes[0].legs[0].distance?.text || '');
              setDuration(result.routes[0].legs[0].duration?.text || '');
            }
          } else {
            console.error('Error fetching directions:', status);
          }
        }
      );
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  }, [pickupAddress, destinationAddress, geocodeAddress]);

  // Handle map click for admin
  const handleMapClick = useCallback((event) => {
    if (isAdmin && onLocationUpdate && parcelId) {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      onLocationUpdate(parcelId, newLocation);
    }
  }, [isAdmin, onLocationUpdate, parcelId]);

  // Calculate route when addresses change
  useEffect(() => {
    if (pickupAddress && destinationAddress) {
      calculateRoute();
    }
  }, [pickupAddress, destinationAddress, calculateRoute]);

  // Custom marker icons
  const markerIcons = {
    pickup: {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy4wMyAyIDMgNi4wMyAzIDExQzMgMTQuMjUgNC42IDE3LjE1IDcgMTguOUwxMiAyMkwxNyAxOC45QzE5LjQgMTcuMTUgMjEgMTQuMjUgMjEgMTFDMjEgNi4wMyAxNi45NyAyIDEyIDJaIiBmaWxsPSIjMzQ5OENGIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTEiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16)
    },
    destination: {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy4wMyAyIDMgNi4wMyAzIDExQzMgMTQuMjUgNC42IDE3LjE1IDcgMTguOUwxMiAyMkwxNyAxOC45QzE5LjQgMTcuMTUgMjEgMTQuMjUgMjEgMTFDMjEgNi4wMyAxNi45NyAyIDEyIDJaIiBmaWxsPSIjRjQ0MzM2Ii8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTEiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16)
    },
    current: {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMEE3NDUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
      scaledSize: new window.google.maps.Size(28, 28),
      anchor: new window.google.maps.Point(14, 14)
    }
  };

  return (
    <div className="parcel-map-container">
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={zoom}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Directions Route */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#4285F4',
                  strokeWeight: 5,
                  strokeOpacity: 0.7,
                },
                suppressMarkers: true,
              }}
            />
          )}

          {/* Pickup Marker */}
          {pickupCoords && (
            <Marker
              position={pickupCoords}
              icon={markerIcons.pickup}
              onClick={() => setSelectedMarker('pickup')}
              title="Pickup Location"
            />
          )}

          {/* Destination Marker */}
          {destinationCoords && (
            <Marker
              position={destinationCoords}
              icon={markerIcons.destination}
              onClick={() => setSelectedMarker('destination')}
              title="Destination"
            />
          )}

          {/* Current Location Marker */}
          {currentLocation && currentLocation.lat && currentLocation.lng && (
            <Marker
              position={currentLocation}
              icon={markerIcons.current}
              onClick={() => setSelectedMarker('current')}
              title="Current Location"
            />
          )}

          {/* Info Windows */}
          {selectedMarker === 'pickup' && pickupCoords && (
            <InfoWindow
              position={pickupCoords}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="info-window">
                <h4>📦 Pickup Location</h4>
                <p>{pickupAddress}</p>
              </div>
            </InfoWindow>
          )}

          {selectedMarker === 'destination' && destinationCoords && (
            <InfoWindow
              position={destinationCoords}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="info-window">
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
              <div className="info-window">
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
        <div className="info-grid">
          <div className="info-item">
            <span className="label">📍 Pickup:</span>
            <span className="value">{pickupAddress}</span>
          </div>
          <div className="info-item">
            <span className="label">🏁 Destination:</span>
            <span className="value">{destinationAddress}</span>
          </div>
          <div className="info-item">
            <span className="label">📏 Distance:</span>
            <span className="value">{distance || 'Calculating...'}</span>
          </div>
          <div className="info-item">
            <span className="label">⏱️ Estimated Time:</span>
            <span className="value">{duration || 'Calculating...'}</span>
          </div>
        </div>
        
        {isAdmin && (
          <div className="admin-note">
            <small>💡 Click anywhere on the map to update current parcel location</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParcelMap;