import React from "react";
import "./QuickStats.css";
import { User, CalendarDays, ClipboardList, CheckCircle2 } from "lucide-react";

const STATS = [
  {
    key: "present",
    label: "Present Days",
    value: 24,
    sub: "This Month",
    trend: "up",
    iconBg: "qs-icon--purple",
    icon: User,
  },
  {
    key: "leave",
    label: "Leave Balance",
    value: 12,
    unit: "Days",
    sub: "Available",
    trend: "up",
    iconBg: "qs-icon--green",
    icon: CalendarDays,
  },
  {
    key: "pending",
    label: "Pending Tasks",
    value: 4,
    sub: "To Do",
    trend: "up",
    iconBg: "qs-icon--orange",
    icon: ClipboardList,
  },
  {
    key: "completed",
    label: "Completed Tasks",
    value: 18,
    sub: "This Month",
    trend: "up",
    iconBg: "qs-icon--blue",
    icon: CheckCircle2,
  },
];

const QuickStats = () => {
  return (
    <div className="qs-card">
      <h3 className="qs-title">Quick Stats</h3>
      <div className="qs-row">
        {STATS.map(({ key, label, value, unit, sub, trend, iconBg, icon: Icon }) => (
          <div className="qs-item" key={key}>
            <div className="qs-item-top">
              <span className={`qs-icon ${iconBg}`}>
                <Icon size={16} />
              </span>
              <span className="qs-label">{label}</span>
            </div>
            <div className="qs-value">
              {value}
              {unit && <span className="qs-unit"> {unit}</span>}
            </div>
            <div className="qs-sub">
              {sub}
              {trend === "up" && <span className="qs-trend-up">↑</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;