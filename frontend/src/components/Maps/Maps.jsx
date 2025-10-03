import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getDistanceDuration } from "./Distance";

// Default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const containerStyle = { width: "100%", height: "400px" };

const MapClickHandler = ({ onMapClick }) => {
  useMapEvent("click", (e) => {
    const { lat, lng } = e.latlng;
    onMapClick?.(lat, lng);
  });
  return null;
};

const FitBounds = ({ pickup, destination }) => {
  const map = useMap();
  useEffect(() => {
    if (pickup && destination) {
      map.fitBounds(
        [
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng],
        ],
        { padding: [50, 50] }
      );
    }
  }, [pickup, destination, map]);
  return null;
};

const CenterOnPin = ({ pin }) => {
  const map = useMap();
  useEffect(() => {
    if (pin) map.setView([pin.lat, pin.lng], map.getZoom(), { animate: true });
  }, [pin, map]);
  return null;
};

export default function MapComponent({
  pickup,
  destination,
  currentLocation,
  onMapClick, // callback to save new location to backend
  isAdmin = false, // true = draggable, false = customer view
  currentLocationIcon,
}) {
  const [route, setRoute] = useState(null);
  const [currentPin, setCurrentPin] = useState(currentLocation || null);

  // Update pin if backend sends new currentLocation
  useEffect(() => {
    if (currentLocation) setCurrentPin(currentLocation);
  }, [currentLocation]);

  const pinIcon = currentLocationIcon || defaultIcon;

  const fetchRoute = async () => {
    if (!pickup || !destination) return;
    try {
      const result = await getDistanceDuration(pickup, destination);
      if (result?.coordinates) setRoute(result.coordinates);
    } catch (err) {
      console.error("Error fetching route:", err);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, [pickup, destination]);

  const handlePinMove = (lat, lng) => {
    const newPin = { lat, lng };
    setCurrentPin(newPin);
    onMapClick?.(lat, lng); // save to backend
  };

  const initialCenter = pickup || destination || currentPin || { lat: -1.2921, lng: 36.8219 };

  return (
    <MapContainer style={containerStyle} center={initialCenter} zoom={12}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {pickup && <Marker position={pickup} icon={defaultIcon} />}
      {destination && <Marker position={destination} icon={defaultIcon} />}

      {currentPin && (
        <Marker
          position={currentPin}
          icon={pinIcon}
          draggable={isAdmin}
          eventHandlers={
            isAdmin
              ? {
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    handlePinMove(lat, lng);
                  },
                }
              : undefined
          }
        />
      )}

      {route && <Polyline positions={route} color="blue" />}
      <MapClickHandler onMapClick={isAdmin ? handlePinMove : undefined} />
      <FitBounds pickup={pickup} destination={destination} />
      <CenterOnPin pin={currentPin} />
    </MapContainer>
  );
}
