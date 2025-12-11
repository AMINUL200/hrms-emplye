import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContex";
import useNoticeListener from "../hooks/useNoticeListener";
import axios from "axios";
import { toast } from "react-toastify";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { token, data } = useContext(AuthContext);

  console.log(data.employee_id);

  useEffect(() => {
    axios
      .get("https://skilledworkerscloud.co.uk/hrms-v2/api/v1/emp-notice", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          t: Date.now(),
        },
      })
      .then((res) => {
        console.log(res);

        if (res.data.status === 1) {
          setNotifications(res.data.data);
        }
      })
      .catch(() => toast.error("Failed to load notifications"));
  }, []);

  // Listen for live notification
  useNoticeListener(data.emid, data.employee_id, (newNotification) => {
    // Add new notification at top
    setNotifications((prev) => [newNotification, ...prev]);

    // Optional popup
    toast.info("📢 " + newNotification.title);
  });

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((n) => (
          <li key={n.id}>
            <strong>{n.title}</strong> - {n.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
