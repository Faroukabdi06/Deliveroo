import ParcelMap from "../../components/maps/ParcelMap";
import ParcelTimeline from "../../components/timeline/ParcelTimeline";

export default function ParcelDetails() {
  const pickup = { lat: -1.286389, lng: 36.817223 };
  const destination = { lat: -1.292066, lng: 36.821945 };
  const current = { lat: -1.2905, lng: 36.8199 };

  const history = [
    { status: "CREATED", timestamp: "10:30 AM" },
    { status: "PICKED_UP", timestamp: "12:15 PM" },
    { status: "IN_TRANSIT", timestamp: "2:45 PM" },
  ];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Parcel Details</h1>
      <ParcelMap pickup={pickup} destination={destination} current={current} />
      <ParcelTimeline history={history} />
    </div>
  );
}
