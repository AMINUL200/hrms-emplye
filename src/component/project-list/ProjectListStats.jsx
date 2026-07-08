import React from "react";
import "./ProjectListStats.css";
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, Users } from "lucide-react";

const STATS = [
  { key: "total", label: "Total Projects", value: 24, trend: "+3 this month", iconBg: "pls-icon--purple", icon: FolderKanban },
  { key: "active", label: "Active Projects", value: 14, trend: "58% of total", iconBg: "pls-icon--blue", icon: Clock },
  { key: "completed", label: "Completed", value: 7, trend: "29% of total", iconBg: "pls-icon--green", icon: CheckCircle2 },
  { key: "overdue", label: "Overdue", value: 3, trend: "Needs attention", iconBg: "pls-icon--red", icon: AlertTriangle },
  { key: "members", label: "Team Members", value: 32, trend: "Across all projects", iconBg: "pls-icon--orange", icon: Users },
];

const ProjectListStats = () => {
  return (
    <div className="pls-row">
      {STATS.map(({ key, label, value, trend, iconBg, icon: Icon }) => (
        <div className="pls-card" key={key}>
          <div className="pls-card-top">
            <span className="pls-label">{label}</span>
            <span className={`pls-icon ${iconBg}`}>
              <Icon size={17} />
            </span>
          </div>
          <div className="pls-value">{value}</div>
          <div className="pls-trend">{trend}</div>
        </div>
      ))}
    </div>
  );
};

export default ProjectListStats;