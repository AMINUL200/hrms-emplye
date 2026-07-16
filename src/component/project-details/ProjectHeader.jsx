import React from "react";
import "./ProjectHeader.css";
import { Pencil, Plus, UserPlus, MoreVertical } from "lucide-react";

const ProjectHeader = ({ projectDetails = {} }) => {
  // Extract project details with fallbacks
  const {
    title = "Project",
    status = "open",
    identifier = "N/A",
    emid = "N/A",
    project_start_date = null,
    project_end_date = null,
  } = projectDetails;

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      open: "Open",
      in_progress: "In Progress",
      completed: "Completed",
      pending: "Pending",
      closed: "Closed",
      on_hold: "On Hold",
    };
    return statusMap[status] || status;
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      open: "pjh-status--open",
      in_progress: "pjh-status--progress",
      completed: "pjh-status--completed",
      pending: "pjh-status--pending",
      closed: "pjh-status--closed",
      on_hold: "pjh-status--onhold",
    };
    return statusMap[status] || "pjh-status--open";
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pjh-wrap">
      <div className="pjh-top">
        <div className="pjh-left">
          <div className="pjh-breadcrumb">
            <a href="#!">Projects</a>
            <span>/</span>
            <span className="pjh-breadcrumb-current">{title}</span>
          </div>
          <div className="pjh-title-row">
            <h1>{title}</h1>
            <span className={`pjh-status-badge ${getStatusClass(status)}`}>
              {getStatusLabel(status)}
            </span>
            <span className="pjh-project-id">{identifier}</span>
          </div>
          <div className="pjh-meta-info">
           
            <span className="pjh-meta-divider">|</span>
            <span className="pjh-meta-item">
              <span className="pjh-meta-label">Start:</span>
              <span className="pjh-meta-value">{formatDate(project_start_date)}</span>
            </span>
            <span className="pjh-meta-divider">|</span>
            <span className="pjh-meta-item">
              <span className="pjh-meta-label">End:</span>
              <span className="pjh-meta-value">{formatDate(project_end_date)}</span>
            </span>
          </div>
        </div>

        <div className="pjh-actions">
          <button type="button" className="pjh-btn pjh-btn--outline">
            <Pencil size={14} />
            Edit Project
          </button>
          <button type="button" className="pjh-btn pjh-btn--primary">
            <Plus size={15} />
            Add Module
          </button>
          <button type="button" className="pjh-icon-btn" aria-label="Add member">
            <UserPlus size={16} />
          </button>
          <button type="button" className="pjh-icon-btn" aria-label="More options">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;