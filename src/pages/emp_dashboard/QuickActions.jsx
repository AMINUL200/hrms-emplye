import React from "react";
import "./QuickActions.css";
import {
  CalendarPlus,
  Fingerprint,
  ClipboardList,
  Briefcase,
  FileText,
  User,
  Palmtree,
  Sparkles,
} from "lucide-react";

const ACTIONS = [
  { key: "leave", label: "Apply Leave", icon: CalendarPlus, className: "qa-icon--purple" },
  { key: "attendance", label: "Attendance", icon: Fingerprint, className: "qa-icon--blue" },
  { key: "tasks", label: "My Tasks", icon: ClipboardList, className: "qa-icon--green" },
  { key: "projects", label: "Projects", icon: Briefcase, className: "qa-icon--violet" },
  { key: "payslip", label: "Payslip", icon: FileText, className: "qa-icon--orange" },
  { key: "profile", label: "Profile", icon: User, className: "qa-icon--skyblue" },
  { key: "holiday", label: "Holiday List", icon: Palmtree, className: "qa-icon--pink" },
  { key: "ask", label: "Ask SponicHR", icon: Sparkles, className: "qa-icon--gradient" },
];

const QuickActions = () => {
  return (
    <div className="qa-card">
      <h3 className="qa-title">Quick Actions</h3>
      <div className="qa-row">
        {ACTIONS.map(({ key, label, icon: Icon, className }) => (
          <button type="button" className="qa-item" key={key}>
            <span className={`qa-icon ${className}`}>
              <Icon size={20} />
            </span>
            <span className="qa-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;