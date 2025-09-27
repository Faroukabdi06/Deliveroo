
import React, { useState, useEffect } from 'react';
import AdminParcelList from './AdminParcelList';

const AdminDashboard = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllParcels();
  }, []);

  const fetchAllParcels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/parcels/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch parcels');

      const data = await response.json();
      setParcels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading parcels...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="bg-blue-100 px-4 py-2 rounded-lg">
          <span className="text-blue-800 font-semibold">
            Total Parcels: {parcels.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {parcels.filter(p => p.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">In Transit</h3>
          <p className="text-3xl font-bold text-blue-600">
            {parcels.filter(p => p.status === 'IN_TRANSIT').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Delivered</h3>
          <p className="text-3xl font-bold text-green-600">
            {parcels.filter(p => p.status === 'DELIVERED').length}
          </p>
        </div>
      </div>

      <AdminParcelList parcels={parcels} onParcelUpdate={fetchAllParcels} />
    </div>
  );
};

export default AdminDashboard;

