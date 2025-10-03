import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import SideNav from "../../components/admin/SideNav";
import TopBar from "../../components/admin/TopBar";
import "../../styles/Admin.css";
import { Link } from "react-router-dom";

const AdminParcels = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const res = await api.get("/admin/parcels");
        if (res.data.success) {
          setParcels(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, []);

  // Helper function to check if we should show the Manage button
  const canManageParcel = (status) => {
    if (!status) return false;
    const normalized = status.toLowerCase();
    return normalized !== "cancelled" && normalized !== "delivered";
  };

  return (
    <div className="admin-container">
      <SideNav />
      <main className="admin-main">
        <TopBar title="Parcels" />
        {loading ? (
          <p>Loading parcels...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Status</th>
                <th>Pickup Address</th>
                <th>Delivery Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel) => (
                <tr key={parcel.id}>
                  <td>{parcel.tracking_id}</td>
                  <td>{parcel.status}</td>
                  <td>{parcel.pickup_address?.street}</td>
                  <td>{parcel.delivery_address?.street}</td>
                  <td>
                    {canManageParcel(parcel.status) && (
                      <Link to={`/admin/parcels/${parcel.id}`}>
                        <button>Manage</button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default AdminParcels;
