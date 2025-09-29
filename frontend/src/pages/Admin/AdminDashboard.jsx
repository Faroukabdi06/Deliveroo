import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import SideNav from "../../components/admin/SideNav";
import TopBar from "../../components/admin/TopBar";
import StatsCard from "../../components/admin/StatsCard";
import "../../styles/Admin.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats"); // <-- your backend endpoint
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-container">
      <SideNav />
      <main className="admin-main">
        <TopBar title="Dashboard" />
        <div className="stats-grid">
          <StatsCard label="Total Parcels" value={stats?.total || 0} />
          <StatsCard label="Active Parcels" value={stats?.active || 0} />
          <StatsCard label="Delivered" value={stats?.delivered || 0} />
          <StatsCard label="Cancelled" value={stats?.cancelled || 0} />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
