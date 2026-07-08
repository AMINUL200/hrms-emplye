import React from "react";
import "./ProjectCard.css";
import { Calendar, MoreVertical } from "lucide-react";

const STATUS_CLASS = {
  Active: "pc-status--active",
  Completed: "pc-status--completed",
  "On Hold": "pc-status--onhold",
  Overdue: "pc-status--overdue",
};

const PRIORITY_CLASS = {
  High: "pc-priority--high",
  Medium: "pc-priority--medium",
  Low: "pc-priority--low",
};

const PROGRESS_COLOR = {
  Active: "#2563eb",
  Completed: "#16a34a",
  "On Hold": "#f59e0b",
  Overdue: "#dc2626",
};

const ProjectCard = ({ project }) => {
  const { name, client, status, priority, progress, dueDate, team } = project;

  return (
    <div className="pc-card">
      <div className="pc-card-top">
        <div className="pc-title-block">
          <span className="pc-name">{name}</span>
          <span className="pc-client">{client}</span>
        </div>
        <button type="button" className="pc-more-btn" aria-label="More options">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="pc-badges">
        <span className={`pc-badge ${STATUS_CLASS[status]}`}>{status}</span>
        <span className={`pc-badge ${PRIORITY_CLASS[priority]}`}>{priority}</span>
      </div>

      <div className="pc-progress-wrap">
        <div className="pc-progress-track">
          <div
            className="pc-progress-fill"
            style={{ width: `${progress}%`, background: PROGRESS_COLOR[status] }}
          />
        </div>
        <span className="pc-progress-pct">{progress}%</span>
      </div>

      <div className="pc-footer">
        <div className="pc-due-date">
          <Calendar size={13} />
          {dueDate}
        </div>

        <div className="pc-avatars">
          {team.slice(0, 3).map((m, idx) => (
            <span key={idx} className="pc-avatar" style={{ background: m.color }}>
              {m.initials}
            </span>
          ))}
          {team.length > 3 && (
            <span className="pc-avatar pc-avatar--extra">+{team.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;