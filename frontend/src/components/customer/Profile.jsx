// src/pages/customer/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerProfile,
  updateCustomerProfile,
  fetchCustomerParcels,
} from "../../features/customer/customerSlice";
import { resetPassword } from "../../features/auth/authSlice"; // ✅ import reset thunk
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/profile.css";

export default function UserProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userProfile, parcels, loading, error } = useSelector(
    (state) => state.customer
  );

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    statistics: {
      totalParcels: 0,
      successfulDeliveries: 0,
      totalSpent: 0,
    },
  });

  // 🔑 Security form state
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load profile + parcels on mount
  useEffect(() => {
    dispatch(fetchCustomerProfile());
    dispatch(fetchCustomerParcels());
  }, [dispatch]);

  // Sync formData when profile updates
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone_number || "",
        statistics: {
          totalParcels: userProfile.statistics?.totalParcels || 0,
          successfulDeliveries:
            userProfile.statistics?.successfulDeliveries || 0,
          totalSpent: userProfile.statistics?.totalSpent || 0,
        },
      });
    }
  }, [userProfile]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const handleSave = () => {
    dispatch(updateCustomerProfile(formData))
      .unwrap()
      .then(() => {
        alert("Profile updated successfully!");
      })
      .catch(() => {
        alert("Failed to update profile");
      });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone_number || "",
        statistics: {
          totalParcels: userProfile.statistics?.totalParcels || 0,
          successfulDeliveries:
            userProfile.statistics?.successfulDeliveries || 0,
          totalSpent: userProfile.statistics?.totalSpent || 0,
        },
      });
    }
    setIsEditing(false);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    dispatch(
    resetPassword({
      email: formData.email,
      security_answer: securityAnswer,
      new_password: newPassword,
    })
    )
    .unwrap()
    .then(() => {
      alert("Password reset successfully! You will be redirected to login.");
    })
    .catch((err) => {
      alert(err?.msg || "Failed to reset password");
    });

  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const deliverySuccessRate = formData.statistics.totalParcels
    ? Math.round(
        (formData.statistics.successfulDeliveries /
          formData.statistics.totalParcels) *
          100
      )
    : 0;

  // 🔹 Build recent activity feed from parcels
  const activityFeed = parcels
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // newest first
    .slice(0, 5) // last 5 activities
    .map((parcel) => ({
      id: parcel.id,
      type: parcel.status.toLowerCase(),
      message: `Parcel #${parcel.tracking_id} ${parcel.status}`,
      timestamp: new Date(
        parcel.updated_at || parcel.created_at
      ).toLocaleString(),
    }));

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="profile-avatar">{getInitials(formData.name)}</div>
        <h3>{formData.name}</h3>
        <p>{formData.email}</p>

        <button
          className={`profile-tab-button ${
            activeTab === "profile" ? "active" : ""
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`profile-tab-button ${
            activeTab === "activity" ? "active" : ""
          }`}
          onClick={() => setActiveTab("activity")}
        >
          Activity
        </button>
        <button
          className={`profile-tab-button ${
            activeTab === "security" ? "active" : ""
          }`}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: "auto",
            padding: "8px",
            borderRadius: "6px",
            background: "#f3f4f6",
            border: "1px solid #ccc",
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </aside>

      {/* Main Content */}
      <main className="profile-main">
        {/* -------- Profile Tab -------- */}
        {activeTab === "profile" && (
          <div className="profile-card">
            <h2>Profile Information</h2>

            <div className="profile-input-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                disabled={!isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="profile-input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled={!isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="profile-input-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                disabled={!isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            {isEditing ? (
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button className="profile-button save" onClick={handleSave}>
                  Save Changes
                </button>
                <button className="profile-button cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="profile-button cancel"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}

            <div style={{ marginTop: "24px" }}>
              <h3>Quick Stats</h3>
              <p>
                Total Parcels:{" "}
                <strong>{formData.statistics.totalParcels}</strong>
              </p>
              <p>
                Successful Deliveries: <strong>{deliverySuccessRate}%</strong>
              </p>
              <p>
                Total Spent:{" "}
                <strong>
                  {new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: "KES",
                  }).format(formData.statistics.totalSpent)}
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* -------- Activity Tab -------- */}
        {activeTab === "activity" && (
          <div className="profile-card">
            <h2>Recent Activity</h2>
            {activityFeed.length === 0 ? (
              <p>No recent activity.</p>
            ) : (
              <ul className="activity-feed">
                {activityFeed.map((act) => (
                  <li key={act.id} className={act.type}>
                    <span className="tracking-id">{act.message}</span>
                    <div className="timestamp">{act.timestamp}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* -------- Security Tab -------- */}
        {activeTab === "security" && (
          <div className="profile-card">
            <h2>Security</h2>
            <p>You can reset your password here using your security answer.</p>

            <form onSubmit={handlePasswordReset}>
              <div className="profile-input-group">
                <label>Security Answer</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </div>

              <div className="profile-input-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="profile-input-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="profile-button save">
                Reset Password
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
