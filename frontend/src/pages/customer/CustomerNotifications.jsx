import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications,markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications } from "../../features/notifications/notificationSlice";
import "../../styles/customernotification.css";
import { Check, Trash2 } from "lucide-react";
import CustomerSideNav from "../../components/customer/CustomerSideNav";

export default function CustomerNotifications({ user }) {
  const dispatch = useDispatch();
  const { items: notifications, loading, error } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleDeleteAll = () => {
    dispatch(deleteAllNotifications());
  };

  return (
    <div className="customer-dashboard">
      <CustomerSideNav user={user} view="notifications" setView={() => {}} onLogout={() => {}} />

      <main className="customer-dashboard-main">
        <h2>Notifications</h2>
        <p>Manage your notifications and stay updated.</p>

        <div className="notifications-actions">
          <button onClick={handleMarkAllRead}>Mark All as Read</button>
          <button onClick={handleDeleteAll}>Delete All</button>
        </div>

        {loading && <p>Loading notifications...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <ul className="notifications-list">
          {notifications.length === 0 && !loading && <p>No notifications found.</p>}

          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`notification-item ${notif.is_read ? "read" : "unread"}`}
            >
              <div className="notification-content">
                <p>{notif.message}</p>
                <span className="notification-type">{notif.type}</span>
                <small>{new Date(notif.created_at).toLocaleString()}</small>
              </div>
              <div className="notification-actions">
                {!notif.is_read && (
                  <button onClick={() => handleMarkRead(notif.id)} title="Mark as Read">
                    <Check size={16} />
                  </button>
                )}
                <button onClick={() => handleDelete(notif.id)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
