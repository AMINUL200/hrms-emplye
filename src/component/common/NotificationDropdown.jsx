import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const NotificationDropdown = ({ notifications }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000);

    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);

    if (diff < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get unread notification count
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="dropdown notification-dropdown" ref={dropdownRef}>
      <button className="notification-btn" onClick={toggleNotifications}>
        <FontAwesomeIcon icon={faBell} />
        {unreadNotificationCount > 0 && (
          <span className="notification-badge">{unreadNotificationCount}</span>
        )}
      </button>

      {showNotifications && (
        <div className="dropdown-menu notification-menu show">
          <div className="notification-header">
            <h6>Notifications</h6>
            <span className="notification-count">{notifications.length}</span>
          </div>
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  !notification.isRead ? "unread" : ""
                }`}
              >
                <div className="notification-content">
                  <h6>{notification.title}</h6>
                  <p>{notification.description}</p>

                  {/* Time ago */}
                  <small>{timeAgo(notification.created_at)}</small>

                  {/* Expire date */}
                  {notification.end_date && (
                    <small className="expire-text">
                      Expire: {formatDate(notification.end_date)}
                    </small>
                  )}
                </div>

                {!notification.isRead && <div className="unread-dot"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
