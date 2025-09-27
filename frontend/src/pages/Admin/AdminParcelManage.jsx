import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminParcelManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const [status, setStatus] = useState('');
  const [currentLocation, setCurrentLocation] = useState({
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchParcel();
  }, [id]);

  const fetchParcel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/parcels/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch parcel');

      const data = await response.json();
      setParcel(data);
      setStatus(data.status);
      setCurrentLocation({
        latitude: data.currentLocation?.latitude || '',
        longitude: data.currentLocation?.longitude || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/parcels/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedParcel = await response.json();
      setParcel(updatedParcel);
      alert('Status updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/parcels/${id}/location`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: parseFloat(currentLocation.latitude),
          longitude: parseFloat(currentLocation.longitude)
        })
      });

      if (!response.ok) throw new Error('Failed to update location');

      const updatedParcel = await response.json();
      setParcel(updatedParcel);
      alert('Location updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
        },
        (error) => {
          alert('Error getting location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading parcel details...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;
  if (!parcel) return <div className="text-center">Parcel not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Manage Parcel</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Parcel Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Tracking Number:</strong> {parcel.trackingNumber}</p>
            <p><strong>Recipient:</strong> {parcel.recipientName}</p>
            <p><strong>Destination:</strong> {parcel.destination}</p>
          </div>
          <div>
            <p><strong>Current Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                parcel.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                parcel.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {parcel.status.replace('_', ' ')}
              </span>
            </p>
            <p><strong>Created:</strong> {new Date(parcel.createdAt).toLocaleString()}</p>
            {parcel.updatedAt && (
              <p><strong>Last Updated:</strong> {new Date(parcel.updatedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Update Status</h2>
          <form onSubmit={handleStatusUpdate}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={updateLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {updateLoading ? 'Updating...' : 'Update Status'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Update Current Location</h2>
          <form onSubmit={handleLocationUpdate}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={currentLocation.latitude}
                  onChange={(e) => setCurrentLocation(prev => ({
                    ...prev,
                    latitude: e.target.value
                  }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={currentLocation.longitude}
                  onChange={(e) => setCurrentLocation(prev => ({
                    ...prev,
                    longitude: e.target.value
                  }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Use Current Location
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300"
              >
                {updateLoading ? 'Updating...' : 'Update Location'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Parcel Timeline</h2>
          <div className="text-gray-500">
            Timeline component would go here with parcel tracking history
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Parcel Location</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            Map component would go here showing current location
            {currentLocation.latitude && currentLocation.longitude && (
              <div className="text-sm mt-2">
                Lat: {currentLocation.latitude}, Lng: {currentLocation.longitude}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminParcelManage;