import React, { useMemo } from "react";
import "./QuickStats.css";
import { User, CalendarDays, ClipboardList, CheckCircle2 } from "lucide-react";

const QuickStats = ({ taskSummary, totalLeave, attendance }) => {
  console.log("QuickStats received taskSummary:", taskSummary);
  console.log("QuickStats received totalLeave:", totalLeave);
  console.log("QuickStats received attendance:", attendance);

  // Calculate stats dynamically
  const stats = useMemo(() => {
    return [
      {
        key: "present",
        label: "Present Days",
        value: attendance?.present_days || 0,
        sub: attendance?.current_month || "This Month",
        trend: "up",
        iconBg: "qs-icon--purple",
        icon: User,
      },
      {
        key: "leave",
        label: "Leave Balance",
        value: totalLeave || 0,
        unit: "Days",
        sub: "Available",
        trend: "up",
        iconBg: "qs-icon--green",
        icon: CalendarDays,
      },
      {
        key: "pending",
        label: "Pending Tasks",
        value: taskSummary?.pending || 0,
        sub: "To Do",
        trend: "up",
        iconBg: "qs-icon--orange",
        icon: ClipboardList,
      },
      {
        key: "completed",
        label: "Completed Tasks",
        value: taskSummary?.completed || 0,
        sub: "This Month",
        trend: "up",
        iconBg: "qs-icon--blue",
        icon: CheckCircle2,
      },
    ];
  }, [attendance, totalLeave, taskSummary]);

  // If no data is available, show empty state
  const hasData = stats.some(stat => stat.value > 0);

  return (
    <div className="qs-card">
      <h3 className="qs-title">Quick Stats</h3>
      <div className="qs-row">
        {stats.map(({ key, label, value, unit, sub, trend, iconBg, icon: Icon }) => (
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