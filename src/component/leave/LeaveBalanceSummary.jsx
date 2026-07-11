import React from "react";
import "./LeaveBalanceSummary.css";
import { 
  CalendarDays, 
  CalendarHeart, 
  Hourglass, 
  FileText, 
  ClipboardCheck, 
  PiggyBank,
  Briefcase,
  Users,
  Umbrella,
  Heart,
  Coffee,
  Plane
} from "lucide-react";

// Map leave types to icons and colors
const LEAVE_TYPE_CONFIG = {
  "SICK LEAVE": { icon: CalendarHeart, iconBg: "lbs-icon--green" },
  "PAID LEAVE": { icon: Briefcase, iconBg: "lbs-icon--blue" },
  "CASUAL LEAVE": { icon: CalendarDays, iconBg: "lbs-icon--blue" },
  "EARNED LEAVE": { icon: Hourglass, iconBg: "lbs-icon--orange" },
  "ANNUAL LEAVE": { icon: FileText, iconBg: "lbs-icon--purple" },
  "MARRIAGE LEAVE": { icon: Heart, iconBg: "lbs-icon--pink" },
  "EMERGENCY LEAVE": { icon: Umbrella, iconBg: "lbs-icon--red" },
  "MATERNITY LEAVE": { icon: Users, iconBg: "lbs-icon--teal" },
  "PATERNITY LEAVE": { icon: Users, iconBg: "lbs-icon--teal" },
  "COMPENSATORY LEAVE": { icon: Coffee, iconBg: "lbs-icon--amber" },
  "STUDY LEAVE": { icon: FileText, iconBg: "lbs-icon--purple" },
};

// Default config for unknown leave types
const DEFAULT_CONFIG = { icon: CalendarDays, iconBg: "lbs-icon--blue" };

const LeaveBalanceSummary = ({ leaveBalance = [], totalAvailable = 0 }) => {
  // If no data, show empty state
  if (!leaveBalance || leaveBalance.length === 0) {
    return (
      <div className="lbs-card">
        <div className="lbs-header">
          <PiggyBank size={17} className="lbs-header-icon" />
          <h3>Leave Balance Summary</h3>
        </div>
        <div className="lbs-empty">
          <PiggyBank size={32} />
          <p>No leave balance data available</p>
        </div>
      </div>
    );
  }

  // Get config for leave type
  const getLeaveConfig = (leaveTypeName) => {
    const upperName = leaveTypeName.toUpperCase();
    return LEAVE_TYPE_CONFIG[upperName] || DEFAULT_CONFIG;
  };

  // Transform leave balance data
  const leaveItems = leaveBalance.map((item) => {
    const config = getLeaveConfig(item.leave_type_name);
    return {
      key: item.leave_type_id,
      label: item.leave_type_name,
      value: item.leave_in_hand || 0,
      sub: "Days Left",
      icon: config.icon,
      iconBg: config.iconBg,
    };
  });

  // Calculate total from leave balance items
  const totalDays = leaveItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="lbs-card">
      <div className="lbs-header">
        <PiggyBank size={17} className="lbs-header-icon" />
        <h3>Leave Balance Summary</h3>
      </div>

      <div className="lbs-row">
        {leaveItems.map(({ key, label, value, sub, iconBg, icon: Icon }) => (
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
        
        {/* Total Available Card */}
        <div className="lbs-item lbs-item--total">
          <div className="lbs-item-top">
            <span className="lbs-item-label">Total Available</span>
            <span className="lbs-icon lbs-icon--indigo">
              <ClipboardCheck size={17} />
            </span>
          </div>
          <div className="lbs-item-value">{totalAvailable || totalDays}</div>
          <div className="lbs-item-sub">Days Left</div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceSummary;