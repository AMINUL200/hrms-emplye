import React, { useState } from "react";
import "./ProjectTabs.css";
import {
  LayoutGrid,
  Boxes,
  ListChecks,
  MessageSquare,
  Users,
  FileText,
  Clock,
  BarChart3,
} from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "modules", label: "Modules", icon: Boxes },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "discussions", label: "Discussions", icon: MessageSquare },
  { key: "team", label: "Team", icon: Users },
  { key: "files", label: "Files", icon: FileText },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "reports", label: "Reports", icon: BarChart3 },
];

const ProjectTabs = ({ activeTab, onTabChange }) => {
  const [internalActive, setInternalActive] = useState("overview");
  const current = activeTab ?? internalActive;

  const handleClick = (key) => {
    if (onTabChange) {
      onTabChange(key);
    } else {
      setInternalActive(key);
    }
  };

  return (
    <div className="pjt-wrap">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className={`pjt-tab ${activeTab === key ? "pjt-tab--active" : ""}`}
          onClick={() => onTabChange(key)}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
};

export default ProjectTabs;
