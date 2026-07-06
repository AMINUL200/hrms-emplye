import React from "react";
import "./LeaveBalanceSummary.css";
import { CalendarDays, CalendarHeart, Hourglass, FileText, ClipboardCheck, PiggyBank } from "lucide-react";

const SUMMARY = [
  {
    key: "casual",
    label: "Casual Leave",
    value: 8,
    sub: "Days Left",
    iconBg: "lbs-icon--blue",
    icon: CalendarDays,
  },
  {
    key: "sick",
    label: "Sick Leave",
    value: 6,
    sub: "Days Left",
    iconBg: "lbs-icon--green",
    icon: CalendarHeart,
  },
  {
    key: "earned",
    label: "Earned Leave",
    value: 12,
    sub: "Days Left",
    iconBg: "lbs-icon--orange",
    icon: Hourglass,
  },
  {
    key: "annual",
    label: "Annual Leave",
    value: 10,
    sub: "Days Left",
    iconBg: "lbs-icon--purple",
    icon: FileText,
  },
  {
    key: "total",
    label: "Total Available",
    value: 36,
    sub: "Days Left",
    iconBg: "lbs-icon--indigo",
    icon: ClipboardCheck,
  },
];

const LeaveBalanceSummary = () => {
  return (
    <div className="lbs-card">
      <div className="lbs-header">
        <PiggyBank size={17} className="lbs-header-icon" />
        <h3>Leave Balance Summary</h3>
      </div>

      <div className="lbs-row">
        {SUMMARY.map(({ key, label, value, sub, iconBg, icon: Icon }) => (
          <div className="lbs-item" key={key}>
            <div className="lbs-item-top">
              <span className="lbs-item-label">{label}</span>
              <span className={`lbs-icon ${iconBg}`}>
                <Icon size={17} />
              </span>
            </div>
            <div className="lbs-item-value">{value}</div>
            <div className="lbs-item-sub">{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalanceSummary;