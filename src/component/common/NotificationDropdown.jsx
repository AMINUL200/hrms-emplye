import React, { useState, useRef, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEye } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { AuthContext } from "../../context/AuthContex";

const NotificationDropdown = ({ notifications, onStatusUpdate }) => {
  const { token } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);
  const api_url = import.meta.env.VITE_API_URL;

  // 🔥 Time Ago Function
  const timeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diff = (now - created) / 1000; // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;

    return `${Math.floor(diff / 86400)} days ago`;
  };

  const unreadNotificationCount = notifications.filter(
    (n) => n.status === 0
  ).length;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleView = async (notification) => {
    setSelectedNotification(notification);
    setShowNotifications(false);

    if (notification.status === 0) {
      try {
        const res = await axios.get(
          `${api_url}/notification/status/${notification.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        onStatusUpdate(notification.id); // update parent state
      } catch (error) {
        console.error("Status update failed", error);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Notification Bell Button */}
      <div className="dropdown notification-dropdown" ref={dropdownRef}>
        <button className="notification-btn" onClick={toggleNotifications}>
          <FontAwesomeIcon icon={faBell} />
          {unreadNotificationCount > 0 && (
            <span className="notification-badge">{unreadNotificationCount}</span>
          )}
        </button>

        {/* Notification Dropdown */}
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
                  className={`notification-item ${notification.status === 0 ? "unread" : ""}`}
                >
                  {/* 🔴 Unread Dot LEFT SIDE */}
                  {notification.status === 0 && (
                    <div className="unread-dot-left"></div>
                  )}

                  {/* Notification Title + Time */}
                  <div className="notification-content">
                    <h6>{notification.title}</h6>
                    <small>{timeAgo(notification.created_at)}</small>
                  </div>

                  {/* View Icon */}
                  <FontAwesomeIcon
                    icon={faEye}
                    className="view-icon"
                    onClick={() => handleView(notification)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div
          className="custom-modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="custom-modal notification-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-gradient">
              <h2>{selectedNotification.title}</h2>
            </div>

            <div className="modal-body-content">
              <p>
                <strong>Description: </strong>
                {selectedNotification.description}
              </p>
              <p>
                <strong>Start Date: </strong>
                {selectedNotification.start_date}
              </p>
              <p>
                <strong>End Date: </strong>
                {selectedNotification.end_date}
              </p>
              {/* <p>
                <strong>Created At: </strong>
                {selectedNotification.created_at}
              </p> */}
            </div>

            <button
              className="close-btn-modern"
              onClick={() => setSelectedNotification(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationDropdown;
