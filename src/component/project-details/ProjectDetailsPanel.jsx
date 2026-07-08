import React from "react";
import "./ProjectDetailsPanel.css";
import { MoreVertical } from "lucide-react";

const MEMBERS = [
  { id: 1, initials: "JD", color: "#7c3aed" },
  { id: 2, initials: "JS", color: "#2563eb" },
  { id: 3, initials: "MJ", color: "#0f172a" },
];

const ProjectDetailsPanel = ({
  owner = "SWC GLOBAL",
  startDate = "21-02-2026",
  endDate = "21-02-2027",
  status = "Active",
  priority = "High",
  extraMembers = 5,
}) => {
  return (
    <div className="pdp-card">
      <div className="pdp-header">
        <h3>Project Details</h3>
        <button type="button" className="pdp-more-btn" aria-label="More options">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="pdp-rows">
        <div className="pdp-row">
          <span className="pdp-label">Owner</span>
          <span className="pdp-value">{owner}</span>
        </div>

        <div className="pdp-row">
          <span className="pdp-label">Start Date</span>
          <span className="pdp-badge pdp-badge--blue">{startDate}</span>
        </div>

        <div className="pdp-row">
          <span className="pdp-label">End Date</span>
          <span className="pdp-badge pdp-badge--red">{endDate}</span>
        </div>

        <div className="pdp-row">
          <span className="pdp-label">Status</span>
          <span className="pdp-badge pdp-badge--green">{status}</span>
        </div>

        <div className="pdp-row">
          <span className="pdp-label">Priority</span>
          <span className="pdp-badge pdp-badge--orange">{priority}</span>
        </div>

        <div className="pdp-row pdp-row--members">
          <span className="pdp-label">Members</span>
          <div className="pdp-avatars">
            {MEMBERS.map((m) => (
              <span
                key={m.id}
                className="pdp-avatar"
                style={{ background: m.color }}
              >
                {m.initials}
              </span>
            ))}
            {extraMembers > 0 && (
              <span className="pdp-avatar pdp-avatar--extra">+{extraMembers}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPanel;