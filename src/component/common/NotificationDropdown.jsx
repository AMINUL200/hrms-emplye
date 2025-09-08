import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

const NotificationDropdown = ({ notifications }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get unread notification count
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="dropdown notification-dropdown" ref={dropdownRef}>
      <button 
        className="notification-btn"
        onClick={toggleNotifications}
      >
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
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <h6>{notification.title}</h6>
                  <p>{notification.message}</p>
                  <small>{notification.time}</small>
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