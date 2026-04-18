import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import RingtoneSelector from "./RingtoneSelector";
import "./NotificationSettings.css";
import { AuthContext } from "../../context/AuthContex";

const NotificationSettings = () => {
  const [muteAll, setMuteAll] = useState(false);
   const { token } = useContext(AuthContext);
   const api_url = import.meta.env.VITE_API_URL;
  
  // API States
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Alert Tone States (Static)
  const [alertTone, setAlertTone] = useState("Default");
  
  // Quiet Hours State
  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");

  const toneOptions = ["Default", "Bell", "Chime", "Soft Ping", "Silent"];

  // Fetch notification settings on component mount
  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  // Function to fetch notification settings
  const fetchNotificationSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api_url}/emp-notification/modules`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotificationTypes(response.data);
      console.log('Fetched notification settings:', response.data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to update notification mute status
  const updateNotificationMuteStatus = async (id, isEnabled) => {
    setUpdatingId(id);
    try {
      const response = await axios.put(
        `${api_url}/emp-notification/is-muted/${id}`,{},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        // Update local state
        setNotificationTypes(prevTypes =>
          prevTypes.map(notification =>
            notification.id === id
              ? { ...notification, is_enabled: isEnabled ? 1 : 0 }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error updating notification mute status:', error);
      alert('Failed to update notification setting. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle toggle for API-based notifications
  const handleNotificationToggle = (id, currentStatus) => {
    updateNotificationMuteStatus(id, !currentStatus);
  };

  // Get icon based on notification name
  const getNotificationIcon = (name) => {
    const icons = {
      'BIRTHDAY': '🎂',
      'HOLIDAY': '🏖️',
      'VISA_EXPIRY': '📄',
      'PASSPORT_EXPIRY': '🛂',
      'DBS_EXPIRY': '✅',
      'EUSS_EXPIRY': '🇪🇺'
    };
    return icons[name] || '🔔';
  };

  // Get description based on notification name
  const getNotificationDescription = (name) => {
    const descriptions = {
      'BIRTHDAY': 'Get notified about team member birthdays',
      'HOLIDAY': 'Receive updates about company holidays',
      'VISA_EXPIRY': 'Alerts when visas are about to expire',
      'PASSPORT_EXPIRY': 'Notifications for passport expiration dates',
      'DBS_EXPIRY': 'Updates about DBS certificate expiry',
      'EUSS_EXPIRY': 'EU Settlement Scheme expiry reminders'
    };
    return descriptions[name] || `Manage ${name.toLowerCase().replace('_', ' ')} notifications`;
  };

  return (
    <div className="notif-settings-popup">
      {/* Scrollable Content */}
      <div className="notif-content-popup">
        {/* Global Notification Control */}
        <div className="notif-card">
          <div className="card-row">
            <div>
              <h3>Mute All Notifications</h3>
              <p className="card-sub">Temporarily silence all alerts</p>
            </div>
            <button
              className={`toggle-switch ${muteAll ? "active" : ""}`}
              onClick={() => setMuteAll(!muteAll)}
              disabled={loading}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>
        </div>

        {/* Dynamic Notification Types Section */}
        <div className={`notif-card ${muteAll ? "muted" : ""}`}>
          <div className="setting-group">
            <h4>Notification Types</h4>
            
            {loading && notificationTypes.length === 0 ? (
              <div className="loading-state">
                <p>Loading notification settings...</p>
              </div>
            ) : (
              notificationTypes.map((notification) => (
                <div key={notification.id} className="setting-row">
                  <div>
                    <div className="setting-label-with-icon">
                      <span className="notification-icon">
                        {getNotificationIcon(notification.name)}
                      </span>
                      <span className="setting-label">
                        {notification.name.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>
                    <p className="setting-sub">
                      {getNotificationDescription(notification.name)}
                    </p>
                  </div>
                  <button
                    className={`toggle-switch small ${notification.is_enabled === 1 ? "active" : ""}`}
                    onClick={() => handleNotificationToggle(
                      notification.id, 
                      notification.is_enabled === 1
                    )}
                    disabled={muteAll || updatingId === notification.id}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Alert Tone Selection (Static) */}
          <RingtoneSelector disabled={muteAll} />
        </div>

       
      </div>

      {/* Status Toast */}
      {muteAll && (
        <div className="mute-toast-popup">
          All notifications are muted
        </div>
      )}

      {/* Loading Overlay for individual updates */}
      {updatingId && (
        <div className="updating-overlay">
          <div className="updating-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;