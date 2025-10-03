import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import SideNav from "../../components/admin/SideNav";
import TopBar from "../../components/admin/TopBar";
import StatsCard from "../../components/admin/StatsCard";
import "../../styles/Admin.css";
import { FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#facc15", "#16a34a", "#dc2626"];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentParcels, setRecentParcels] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchRecentParcels = async () => {
      try {
        const res = await api.get("/admin/parcels?limit=5"); // fetch last 5 parcels
        if (res.data.success) setRecentParcels(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    fetchRecentParcels();
  }, []);

  // Prepare pie chart data
  const pieData = [
    { name: "Created", value: stats?.created || 0 },
    { name: "In Transit", value: (stats?.in_transit || 0) + (stats?.out_for_delivery || 0) },
    { name: "Delivered", value: stats?.delivered || 0 },
    { name: "Cancelled", value: stats?.cancelled || 0 },
  ];

  return (
    <div className="admin-container">
      <SideNav />
      <main className="admin-main">
        <TopBar title="Dashboard" />

        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard
            label="Total Parcels"
            value={stats?.total_parcels || 0}
            icon={<FaBox />}
            color="#3b82f6"
            trend={stats?.total_parcels_trend}
            sparklineData={stats?.total_parcels_sparkline}
          />

          <StatsCard
            label="Active Parcels"
            value={(stats?.created || 0) + (stats?.in_transit || 0) + (stats?.out_for_delivery || 0)}
            icon={<FaShippingFast />}
            color="#facc15"
            trend={stats?.active_trend}
          />
          <StatsCard
            label="Delivered"
            value={stats?.delivered || 0}
            icon={<FaCheckCircle />}
            color="#16a34a"
            trend={stats?.delivered_trend}
          />
          <StatsCard
            label="Cancelled"
            value={stats?.cancelled || 0}
            icon={<FaTimesCircle />}
            color="#dc2626"
            trend={stats?.cancelled_trend}
          />
        </div>

        {/* Pie Chart */}
        <div className="dashboard-section">
          <h3>Parcels Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Parcels Table */}
        <div className="dashboard-section">
          <h3>Recent Parcels</h3>
          {recentParcels.length === 0 ? (
            <p>No recent parcels available.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Status</th>
                  <th>Pickup Address</th>
                  <th>Delivery Address</th>
                </tr>
              </thead>
              <tbody>
                {recentParcels.map((parcel) => (
                  <tr key={parcel.id}>
                    <td>{parcel.tracking_id}</td>
                    <td>{parcel.status}</td>
                    <td>{parcel.pickup_address?.street}</td>
                    <td>{parcel.delivery_address?.street}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
