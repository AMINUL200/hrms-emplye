import React from "react";
import "./TeamMembersPanel.css";
import { UsersRound, ArrowRight } from "lucide-react";

const MEMBERS = [
  { id: 1, name: "SK Shamim", role: "Project Manager", badge: "Manager", badgeClass: "tmp-badge--manager", initials: "SS", color: "#1f2333" },
  { id: 2, name: "Tanvir Hasan", role: "Developer", badge: "Developer", badgeClass: "tmp-badge--developer", initials: "TH", color: "#2563eb" },
  { id: 3, name: "Rafia Sultana", role: "UI/UX Designer", badge: "Designer", badgeClass: "tmp-badge--designer", initials: "RS", color: "#16a34a" },
  { id: 4, name: "Jakaria Ahmed", role: "Frontend Developer", badge: "Developer", badgeClass: "tmp-badge--developer", initials: "JA", color: "#0f172a" },
];

const TeamMembersPanel = () => {
  return (
    <div className="tmp-card">
      <div className="tmp-header">
        <div className="tmp-title">
          <span className="tmp-header-icon">
            <UsersRound size={16} />
          </span>
          <h3>Team Members ({MEMBERS.length})</h3>
        </div>
        <button type="button" className="tmp-view-all-btn">View All</button>
      </div>

      <div className="tmp-list">
        {MEMBERS.map((m) => (
          <div className="tmp-row" key={m.id}>
            <span className="tmp-avatar" style={{ background: m.color }}>
              {m.initials}
            </span>
            <div className="tmp-info">
              <span className="tmp-name">{m.name}</span>
              <span className="tmp-role">{m.role}</span>
            </div>
            <span className={`tmp-badge ${m.badgeClass}`}>{m.badge}</span>
          </div>
        ))}
      </div>

      <a href="#!" className="tmp-view-all-link">
        View All Team Members
        <ArrowRight size={14} />
      </a>
    </div>
  );
};

export default TeamMembersPanel;