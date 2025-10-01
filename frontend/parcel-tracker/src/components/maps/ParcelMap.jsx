import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { useState, useEffect } from "react";

export default function ParcelMap({ pickup, destination, current }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (pickup && destination && isLoaded) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickup,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const leg = result.routes[0].legs[0];
            setDistance(leg.distance.text);
            setDuration(leg.duration.text);
          }
        }
      );
    }
  }, [pickup, destination, isLoaded]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div>
      <GoogleMap
        center={pickup}
        zoom={12}
        mapContainerStyle={{ width: "100%", height: "400px" }}
      >
        <Marker position={pickup} label="P" />
        <Marker position={destination} label="D" />
        {current && <Marker position={current} label="C" />}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      {distance && duration && (
        <div className="mt-2 text-sm text-gray-700">
          Distance: <strong>{distance}</strong> | Estimated time: <strong>{duration}</strong>
        </div>
      )}
    </div>
  );
}
