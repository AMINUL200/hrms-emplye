import React from "react";
import "./RecentActivities.css";
import { Plus, Check, MessageCircle, BarChart3, MoreVertical } from "lucide-react";

const ACTIVITIES = [
  {
    id: 1,
    name: "John Doe",
    action: "created a new task",
    time: "2 hours ago",
    icon: Plus,
    iconBg: "ra-icon--green",
  },
  {
    id: 2,
    name: "Jane Smith",
    action: "completed a sub task",
    time: "4 hours ago",
    icon: Check,
    iconBg: "ra-icon--green2",
  },
  {
    id: 3,
    name: "Mike Johnson",
    action: "commented on a task",
    time: "6 hours ago",
    icon: MessageCircle,
    iconBg: "ra-icon--orange",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    action: "updated module progress",
    time: "1 day ago",
    icon: BarChart3,
    iconBg: "ra-icon--blue",
  },
];

const RecentActivities = () => {
  return (
    <div className="ra-card">
      <div className="ra-header">
        <h3>Recent Activities</h3>
        <a href="#!" className="ra-view-all">View All</a>
      </div>

      <div className="ra-list">
        {ACTIVITIES.map(({ id, name, action, time, icon: Icon, iconBg }) => (
          <div className="ra-item" key={id}>
            <span className={`ra-icon ${iconBg}`}>
              <Icon size={14} />
            </span>
            <div className="ra-item-text">
              <span className="ra-item-name">
                {name}
                <span className="ra-item-action"> {action}</span>
              </span>
              <span className="ra-item-time">{time}</span>
            </div>
            <button type="button" className="ra-more-btn" aria-label="More options">
              <MoreVertical size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;