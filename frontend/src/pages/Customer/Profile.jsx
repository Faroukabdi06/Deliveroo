import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Navigate, useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const [user, setUser] = useState({
    name: "John Smith",
    email: "john@example.com",
    role: "customer",
    avatar: "",
    dateOfBirth: "1985-06-15",
    phone: "+44 7700 900123",
    address: {
      street: "123 Baker Street",
      city: "London",
      postalCode: "W1U 6TU",
      country: "United Kingdom",
    },
    statistics: {
      memberSince: "2023-01-15",
      lastActive: "2025-09-12 14:30",
      totalParcels: 15,
      successfulDeliveries: 13,
      totalSpent: 2400,
    },
    preferences: { 
      currency: "USD", 
      theme: "light",  
      emailUpdates: true,    
      smsAlerts: false,
      pushNotifications: true,
    },
  });


  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState(user);
  const navigate = useNavigate();

  

  if (!user || !formData) return null;

  const handleSave = () => {
    setUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const deliverySuccessRate = Math.round(
    (user.statistics.successfulDeliveries / user.statistics.totalParcels) * 100
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: "6px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: "20px", margin: 0 }}>User Profile</h1>
            <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "24px" }}>
          <div>
            <div
              style={{
                background: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "24px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name}
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "0 auto",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      background: "#ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {getInitials(formData.name)}
                  </div>
                )}
              </div>
              <h3 style={{ marginBottom: "4px" }}>{formData.name}</h3>
              <p style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
                {formData.email}
              </p>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  background: formData.role === "admin" ? "#2563eb" : "#f3f4f6",
                  color: formData.role === "admin" ? "#fff" : "#111",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {formData.role === "admin" ? "Administrator" : "Customer"}
              </span>

              <hr style={{ margin: "16px 0" }} />

              <div style={{ textAlign: "left", fontSize: "14px", color: "#444" }}>
                <p>
                  <strong>Member since:</strong> {formatDate(formData.statistics.memberSince)}
                </p>
                <p>
                  <strong>Last active:</strong> {formData.statistics.lastActive}
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "16px",
                fontSize: '15px',
                lineHeight: '1.5',
              }}
            >
              <h4 style={{ marginBottom: "12px" }}>Quick Stats</h4>
              <p>
                Total Parcels: <strong>{formData.statistics.totalParcels}</strong>
              </p>
              <p>
                Success Rate: <strong>{deliverySuccessRate}%</strong>
              </p>
              <p>
                Total Spent:{" "}
                <strong>
                  {new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: formData.preferences.currency,
                  }).format(formData.statistics.totalSpent)}
                </strong>
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "24px",
              fontSize: "17px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "20px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {["personal", "preferences", "notifications"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    background: activeTab === tab ? "#e0e7ff" : "transparent",
                    borderRadius: "6px 6px 0 0",
                    cursor: "pointer",
                    fontWeight: activeTab === tab ? "600" : "400",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "personal" && (
              <>
                <h2 style={{ marginBottom: "16px" }}>Personal Information</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "500" }}>Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "500" }}>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "500" }}>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "500" }}>Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "14px", fontWeight: "500" }}>Address</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value },
                        })
                      }
                      style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "8px" }}>
                      <input
                        type="text"
                        value={formData.address.city}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value },
                          })
                        }
                        style={{ padding: "8px" }}
                      />
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, postalCode: e.target.value },
                          })
                        }
                        style={{ padding: "8px" }}
                      />
                      <input
                        type="text"
                        value={formData.address.country}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, country: e.target.value },
                          })
                        }
                        style={{ padding: "8px" }}
                      />
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleSave}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        background: "#f3f4f6",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      marginTop: "16px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "#f3f4f6",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    Edit Profile
                  </button>
                )}
              </>
            )}

            {activeTab === "preferences" && (
              <>
                <h2 style={{ marginBottom: "16px" }}>Preferences</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "500" }}>Preferred Currency</label>
                    <select
                      value={formData.preferences.currency}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, currency: e.target.value },
                        })
                      }
                      style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="KES">KES (KSh)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeTab === "notifications" && (
              <>
                <h2 style={{ marginBottom: "16px" }}>Notifications</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { key: "emailUpdates", label: "Email Updates" },
                    { key: "smsAlerts", label: "SMS Alerts" },
                    { key: "pushNotifications", label: "Push Notifications" },
                  ].map((n) => (
                    <label key={n.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="checkbox"
                        checked={formData.preferences[n.key] || false}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, [n.key]: e.target.checked },
                          })
                        }
                      />
                      {n.label}
                    </label>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
