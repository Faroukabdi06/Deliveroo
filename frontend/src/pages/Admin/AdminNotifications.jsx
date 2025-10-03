import React, { useEffect } from "react";
import SideNav from "../../components/admin/SideNav";
import TopBar from "../../components/admin/TopBar";
import { useSelector, useDispatch } from "react-redux";
import "../../styles/Notifications.css";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../../features/notifications/notificationSlice";
import { Check, Trash2 } from "lucide-react";

const AdminNotifications = () => {
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
    if (window.confirm("Are you sure you want to delete this notification?")) {
      dispatch(deleteNotification(id));
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      dispatch(deleteAllNotifications());
    }
  };

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-container">
      <SideNav />
      <main className="admin-main">
        <TopBar title="Notifications" />

        <section className="notifications-section">
          <div className="notifications-header">
            <h2>Notifications</h2>
            <div className="notifications-actions">
              <button onClick={handleMarkAllRead} className="mark-all-btn">
                Mark All as Read
              </button>
              <button onClick={handleDeleteAll} className="delete-all-btn">
                Delete All
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p>No notifications available.</p>
          ) : (
            <ul className="notifications-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notification-item ${n.is_read ? "read" : "unread"}`}
                >
                  <p>{n.message}</p>
                  <small>
                    {new Date(n.created_at).toLocaleString()} | Type: {n.type}
                  </small>
                  <div className="notification-actions">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="mark-read-btn"
                      >
                        <Check size={16}/>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="delete-btn"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminNotifications;
