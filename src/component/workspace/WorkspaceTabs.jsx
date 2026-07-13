import React, { useState } from "react";
import "./WorkspaceTabs.css";
import { LayoutGrid, Users, ListChecks, Milestone, FileText, MessageSquare, Download } from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "team", label: "Team Members", icon: Users },
  { key: "submissions", label: "Submit Work", icon: Download },
  { key: "work-history", label: "Work History", icon: Milestone },
  // { key: "documents", label: "Documents", icon: FileText },
  { key: "discussion", label: "Discussion", icon: MessageSquare },
];

const WorkspaceTabs = ({ activeTab, onTabChange }) => {
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
    <div className="wtab-wrap">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          type="button"
          key={key}
          className={`wtab-tab ${current === key ? "wtab-tab--active" : ""}`}
          onClick={() => handleClick(key)}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
};

export default WorkspaceTabs;