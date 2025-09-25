


export default function ParcelMap({ pickup, destination }) {
  return (
    <div className="border rounded p-4 bg-gray-50">
      <div className="font-medium mb-2">Map</div>
      <div className="text-sm text-gray-600">
        Pickup: {pickup || "—"}
        <br />
        Destination: {destination || "—"}
      </div>
      <div className="mt-4 h-48 bg-white border rounded flex items-center justify-center text-gray-400">
        Map placeholder (replace with Mapbox / Google Maps component)
      </div>
    </div>
  );
}


