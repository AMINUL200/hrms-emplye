import React, { useState, useRef, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEye, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { AuthContext } from "../../context/AuthContex";

const NotificationDropdown = ({
  notifications,
  onStatusUpdate,
  refreshNotifications,
}) => {
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

  // ✅ FIXED: Use is_read instead of status
  const unreadNotificationCount = notifications.filter(
    (n) => n.is_read === 0,
  ).length;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleView = async (notification) => {
    setSelectedNotification(notification);
    setShowNotifications(false);

    // Mark as read if unread
    if (notification.is_read === 0) {
      console.log("🔔 Marking as read:", notification.id);
      try {
        const res = await axios.put(
          `${api_url}/emp-notification/read/${notification.id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // ✅ update local UI immediately
        onStatusUpdate(notification.id);

        // ✅ THEN refresh from backend
        await refreshNotifications();
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
            <span className="notification-badge">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="dropdown-menu notification-menu show">
            <div className="notification-header">
              <h6>Notifications</h6>
              <span className="notification-count">{unreadNotificationCount}</span>
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.is_read === 0 ? "unread" : ""}`}
                  >
                    {/* 🔴 Unread Dot LEFT SIDE */}
                    {notification.is_read === 0 && (
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
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Detail Modal - FIXED with scrollable content */}
      {selectedNotification && (
        <div
          className="custom-modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="custom-modal notification-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header with Close Button */}
            <div className="modal-header-gradient">
              <h2>{selectedNotification.title}</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setSelectedNotification(null)}
                aria-label="Close modal"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="modal-body-content scrollable-content">
              <div className="notification-detail-section">
                <div className="detail-item">
                  <strong>Description: </strong>
                  <div 
                    className="description-content"
                    dangerouslySetInnerHTML={{ __html: selectedNotification.description }}
                  />
                </div>
                
                <div className="detail-item">
                  <strong>Type: </strong>
                  <span>{selectedNotification.type}</span>
                </div>
                
                <div className="detail-item">
                  <strong>Start Date: </strong>
                  <span>{selectedNotification.start_date}</span>
                </div>
                
                <div className="detail-item">
                  <strong>End Date: </strong>
                  <span>{selectedNotification.end_date}</span>
                </div>
                
                <div className="detail-item">
                  <strong>Status: </strong>
                  <span className={selectedNotification.is_read === 0 ? 'status-unread' : 'status-read'}>
                    {selectedNotification.is_read === 0 ? 'Unread' : 'Read'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fixed Footer with Close Button */}
            <div className="modal-footer-fixed">
              <button
                className="close-btn-modern"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationDropdown;