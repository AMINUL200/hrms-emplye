import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faCheckCircle, 
  faExclamationTriangle, 
  faInfoCircle, 
  faTimes,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import './NotificationCard.css';

const NotificationCard = () => {
  // Sample notification data array
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Payment Received',
      message: 'Your payment of $250.00 has been successfully processed.',
      time: '10 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Update Required',
      message: 'Please update your profile information to continue using all features.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'New Feature Available',
      message: 'Check out our new analytics dashboard with advanced reporting.',
      time: '1 day ago',
      read: true
    },
    {
      id: 4,
      type: 'error',
      title: 'Login Attempt',
      message: 'There was an unusual login attempt from a new device.',
      time: '3 days ago',
      read: true
    }
  ];

  // Function to handle notification dismissal
  const handleDismiss = (id) => {
    console.log(`Dismissed notification ${id}`);
    // In a real app, you would update state or make an API call here
  };

  // Function to mark as read
  const markAsRead = (id) => {
    console.log(`Marked notification ${id} as read`);
    // In a real app, you would update state or make an API call here
  };

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
      case 'warning':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" />;
      case 'error':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />;
      case 'info':
        return <FontAwesomeIcon icon={faInfoCircle} className="text-info" />;
      default:
        return <FontAwesomeIcon icon={faBell} className="text-primary" />;
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h5>
          <FontAwesomeIcon icon={faBell} className="me-2" />
          Notifications
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="unread-count">
              <FontAwesomeIcon icon={faCircle} className="pulse" />
              <span className="count">{notifications.filter(n => !n.read).length}</span>
            </span>
          )}
        </h5>
      </div>
      
      <div className="notification-list custom-scrollbar">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification-card ${notification.type} ${notification.read ? 'read' : 'unread'}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="notification-icon">
              {getIcon(notification.type)}
            </div>
            <div className="notification-content">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="notification-title">{notification.title}</h6>
                <button 
                  className="btn btn-sm btn-close-notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(notification.id);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <p className="notification-message">{notification.message}</p>
              <small className="notification-time">{notification.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCard;