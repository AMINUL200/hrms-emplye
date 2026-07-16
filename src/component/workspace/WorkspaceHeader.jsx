import React from "react";
import "./WorkspaceHeader.css";
import { Folder, Calendar } from "lucide-react";

const WorkspaceHeader = ({
  title = "SWC UK Website Design",
  status = "Open",
  description = "Design and develop a modern, responsive website for SWC UK to enhance their online presence and user experience.",
  startDate = "24 Jun 2026",
  endDate = "30 Sep 2026",
}) => {
  return (
    <div className="wh-card">
      <div className="wh-left">
        <span className="wh-folder-icon">
          <Folder size={26} />
        </span>
        <div className="wh-text">
          <div className="wh-title-row">
            <h1>{title.toUpperCase()}</h1>
            <span className="wh-status-badge">{status}</span>
          </div>
          {/* <p className="wh-description">{description}</p> */}
        </div>
      </div>

      <div className="wh-dates">
        <div className="wh-date-card">
          <span className="wh-date-icon">
            <Calendar size={18} />
          </span>
          <div className="wh-date-text">
            <span className="wh-date-label">Start Date</span>
            <span className="wh-date-value">{startDate}</span>
          </div>
        </div>

        <div className="wh-date-card">
          <span className="wh-date-icon">
            <Calendar size={18} />
          </span>
          <div className="wh-date-text">
            <span className="wh-date-label">End Date</span>
            <span className="wh-date-value">{endDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHeader;