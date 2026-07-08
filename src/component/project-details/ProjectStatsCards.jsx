import React from "react";
import "./ProjectStatsCards.css";
import { Layers, CheckCircle2, CircleCheck, Clock, AlertCircle } from "lucide-react";

const STATS = [
  { key: "modules", label: "Total Modules", value: 8, iconBg: "psc-icon--blue", icon: Layers },
  { key: "tasks", label: "Total Tasks", value: 42, iconBg: "psc-icon--green", icon: CheckCircle2 },
  { key: "completed", label: "Completed Tasks", value: 18, iconBg: "psc-icon--violet", icon: CircleCheck },
  { key: "progress", label: "In Progress", value: 16, iconBg: "psc-icon--orange", icon: Clock },
  { key: "overdue", label: "Overdue", value: 8, iconBg: "psc-icon--red", icon: AlertCircle },
];

const ProjectStatsCards = () => {
  return (
    <div className="psc-row">
      {STATS.map(({ key, label, value, iconBg, icon: Icon }) => (
        <div className="psc-card" key={key}>
          <div className="psc-card-top">
            <span className="psc-label">{label}</span>
            <span className={`psc-icon ${iconBg}`}>
              <Icon size={18} />
            </span>
          </div>
          <div className="psc-value">{value}</div>
        </div>
      ))}
    </div>
  );
};

export default ProjectStatsCards;