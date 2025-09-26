import { useState } from "react";
import {
  Home,
  Package,
  PlusCircle,
  Settings,
  Activity,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import ParcelForm from "./ParcelForm";
import ParcelCard from "../../components/ParcelCard";

export default function CustomerDashboard({ user }) {
  const [view, setView] = useState("dashboard"); // "dashboard" | "parcels" | "form"
  const [filter, setFilter] = useState("");

  //backend fetch goes here
  const parcels = [
    { id: "123", recipientName: "Alice", deliveryAddress: "123 Main St", status: "in-transit" },
    { id: "124", recipientName: "Bob", deliveryAddress: "456 Park Ave", status: "delivered" },
    { id: "125", recipientName: "Charlie", deliveryAddress: "789 High St", status: "pending" },
  ];

  const filteredParcels = parcels.filter(
    (p) =>
      p.recipientName.toLowerCase().includes(filter.toLowerCase()) ||
      p.status.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Deliveroo</h1>
          <p className="text-xs text-gray-500">Delivery Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setView("dashboard")}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${
              view === "dashboard" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <Home size={18} /> Dashboard
          </button>
          <button
            onClick={() => setView("parcels")}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${
              view === "parcels" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <Package size={18} /> My Parcels
          </button>
          <button
            onClick={() => setView("form")}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${
              view === "form" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <PlusCircle size={18} /> Send Parcel
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-4">
          <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 w-full">
            <Settings size={18} /> Settings
          </button>
          <div className="flex items-center gap-3">
            <img
              src="https://via.placeholder.com/40"
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">{user?.name || "John Smith"}</p>
              <p className="text-xs text-gray-500">Customer Account</p>
            </div>
          </div>
        </div>
      </aside>

      
      <main className="flex-1 ml-64 p-8">
        {view === "dashboard" && (
          <>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
              Welcome back, {user?.name || "John Smith"}!
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-6">
              Manage your deliveries, track shipments, and stay updated with real-time
              notifications.
            </p>

            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-blue-50 border rounded-lg">
                <p className="text-sm text-blue-600">Active Deliveries</p>
                <p className="text-2xl font-bold">1</p>
                <div className="flex items-center gap-1 text-xs text-blue-500">
                  <Activity size={14} /> In progress
                </div>
              </div>
              <div className="p-4 bg-green-50 border rounded-lg">
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold">0</p>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <CheckCircle size={14} /> Delivered
                </div>
              </div>
              <div className="p-4 bg-purple-50 border rounded-lg">
                <p className="text-sm text-purple-600">Total Parcels</p>
                <p className="text-2xl font-bold">15</p>
                <div className="flex items-center gap-1 text-xs text-purple-500">
                  <BarChart3 size={14} /> All time
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border rounded-lg">
                <p className="text-sm text-yellow-600">Success Rate</p>
                <p className="text-2xl font-bold">0%</p>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  ↑ Performance
                </div>
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setView("form")}
                className="flex flex-col items-center justify-center p-6 border rounded-lg bg-white hover:shadow"
              >
                <PlusCircle className="text-blue-600 mb-2" size={28} />
                <p className="font-medium">Send Parcel</p>
                <p className="text-sm text-gray-500">Create new delivery</p>
              </button>
              <button
                onClick={() => setView("parcels")}
                className="flex flex-col items-center justify-center p-6 border rounded-lg bg-white hover:shadow"
              >
                <Package className="text-green-600 mb-2" size={28} />
                <p className="font-medium">My Parcels</p>
                <p className="text-sm text-gray-500">1 active delivery</p>
              </button>
            </div>

          
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Parcels</h3>
              <button
                onClick={() => setView("parcels")}
                className="text-blue-600 text-sm "
              >
                View All
              </button>
            </div>
            <div className="grid gap-4">
              <ParcelCard
                parcel={{
                  id: "12345",
                  recipientName: "Alice",
                  deliveryAddress: "123 Main St",
                  status: "in-transit",
                }}
              />
            </div>
          </>
        )}

        {view === "parcels" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">My Parcels</h2>
              <input
                type="text"
                placeholder="Filter by name or status..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div className="grid gap-4">
              {filteredParcels.map((parcel) => (
                <ParcelCard key={parcel.id} parcel={parcel} />
              ))}
              {filteredParcels.length === 0 && (
                <p className="text-gray-500 text-sm">No parcels found.</p>
              )}
            </div>
          </>
        )}

        {view === "form" && <ParcelForm />}
      </main>
    </div>
  );
}
