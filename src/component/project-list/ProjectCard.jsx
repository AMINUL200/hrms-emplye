import React, { useState, useContext } from "react";
import "./ProjectCard.css";
import {
  Calendar,
  MoreVertical,
  Edit,
  FolderPlus,
  Trash2,
  Eye,
  X,
  Calendar as CalendarIcon,
  User,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const STATUS_CLASS = {
  open: "pc-status--active",
  in_progress: "pc-status--progress",
  completed: "pc-status--completed",
  on_hold: "pc-status--onhold",
  overdue: "pc-status--overdue",
  active: "pc-status--active",
  "on hold": "pc-status--onhold",
};

const STATUS_LABEL = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
  overdue: "Overdue",
  active: "Active",
};

const PRIORITY_CLASS = {
  High: "pc-priority--high",
  Medium: "pc-priority--medium",
  Low: "pc-priority--low",
  high: "pc-priority--high",
  medium: "pc-priority--medium",
  low: "pc-priority--low",
};

const PRIORITY_LABEL = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PROGRESS_COLOR = {
  open: "#6366F1",
  in_progress: "#F59E0B",
  completed: "#10B981",
  on_hold: "#6B7280",
  overdue: "#EF4444",
  active: "#6366F1",
};

const ProjectCard = ({ project }) => {
  const {
    id,
    name,
    client,
    status,
    priority,
    progress,
    dueDate,
    team,
    description = "",
    startDate = "2026-01-01",
    roles = [],
    completed_tasks = 0,
    pending_tasks = 0,
    total_tasks = 0,
  } = project;

  const stripHtml = (html = "") => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    return tempDiv.textContent || tempDiv.innerText || "";
  };
  // const isLongDescription = description && description.length > 150;

  const plainDescription = stripHtml(description);

  const isLongDescription = plainDescription.length > 150;

  const shortDescription = isLongDescription
    ? `${plainDescription.substring(0, 150)}...`
    : plainDescription;

  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  // Check if user has specific permissions
  const hasPermission = (permissionName) => {
    if (!roles || roles.length === 0) return false;

    for (const role of roles) {
      if (role.permissions) {
        const hasPerm = role.permissions.some((p) => p.name === permissionName);
        if (hasPerm) return true;
      }
    }
    return false;
  };

  // Check if user has any of the required permissions
  const hasAnyPermission = (permissionNames) => {
    if (!roles || roles.length === 0) return false;

    for (const role of roles) {
      if (role.permissions) {
        const hasPerm = role.permissions.some((p) =>
          permissionNames.includes(p.name),
        );
        if (hasPerm) return true;
      }
    }
    return false;
  };

  // Determine available actions based on permissions
  const canEdit = hasPermission("update_project");
  const canDelete = hasPermission("delete_project");
  const canCreateModule = hasAnyPermission(["create_module", "assign_module"]);
  const canView = hasPermission("view_project");

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    setDropdownOpen(false);

    switch (action) {
      case "edit":
        navigate(`/organization/edit-project/${id}`);
        break;
      case "module":
        navigate(`/organization/create-module/${id}`);
        break;
      case "delete":
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
          // Call delete API here
          toast.success(`Project "${name}" deleted successfully`);
        }
        break;
      default:
        console.log(`${action} clicked for ${name}`);
    }
  };

  const togglePopup = (e) => {
    e.stopPropagation();
    setPopupOpen(!popupOpen);
  };

  const handleViewProject = () => {
    navigate(`/organization/assigned-project/${id}`);
  };

  // Get status class and label
  const getStatusClass = () => {
    const statusKey = status?.toLowerCase() || "open";
    return STATUS_CLASS[statusKey] || "pc-status--active";
  };

  const getStatusLabel = () => {
    const statusKey = status?.toLowerCase() || "open";
    return STATUS_LABEL[statusKey] || status || "Open";
  };

  const getPriorityClass = () => {
    const priorityKey = priority?.toLowerCase() || "medium";
    return PRIORITY_CLASS[priorityKey] || "pc-priority--medium";
  };

  const getPriorityLabel = () => {
    const priorityKey = priority?.toLowerCase() || "medium";
    return PRIORITY_LABEL[priorityKey] || priority || "Medium";
  };

  const getProgressColor = () => {
    const statusKey = status?.toLowerCase() || "open";
    return PROGRESS_COLOR[statusKey] || "#6366F1";
  };

  // const isLongDescription = description && description.length > 150;

  // Check if any actions are available
  const hasActions = canEdit || canDelete || canCreateModule;

  return (
    <>
      <div
        className={`pc-card pc-card--status-${status?.toLowerCase() || "open"}`}
      >
        <div className="pc-card-top">
          <div className="pc-title-block">
            <span className="pc-name">{name}</span>
            <span className="pc-client">
              <User
                size={12}
                style={{ display: "inline", marginRight: "4px" }}
              />
              {client || "N/A"}
            </span>
          </div>

          {hasActions && (
            <div className="pc-dropdown">
              <button
                type="button"
                className="pc-more-btn"
                aria-label="More options"
                onClick={toggleDropdown}
              >
                <MoreVertical size={16} />
              </button>

              <div
                className={`pc-dropdown-menu ${dropdownOpen ? "pc-dropdown-menu--open" : ""}`}
              >
                {canEdit && (
                  <button
                    className="pc-dropdown-item"
                    onClick={(e) => handleAction("edit", e)}
                  >
                    <Edit size={15} />
                    Edit Project
                  </button>
                )}
                {canCreateModule && (
                  <button
                    className="pc-dropdown-item"
                    onClick={(e) => handleAction("module", e)}
                  >
                    <FolderPlus size={15} />
                    Create Module
                  </button>
                )}
                {(canEdit || canCreateModule) && canDelete && (
                  <div className="pc-dropdown-divider" />
                )}
                {canDelete && (
                  <button
                    className="pc-dropdown-item pc-dropdown-item--danger"
                    onClick={(e) => handleAction("delete", e)}
                  >
                    <Trash2 size={15} />
                    Delete Project
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pc-badges">
          <span className={`pc-badge ${getStatusClass()}`}>
            {getStatusLabel()}
          </span>
          <span className={`pc-badge ${getPriorityClass()}`}>
            {getPriorityLabel()}
          </span>
          {total_tasks > 0 && (
            <span className="pc-badge pc-badge--tasks">
              <CheckCircle2 size={12} />
              {completed_tasks}/{total_tasks} Tasks
            </span>
          )}
        </div>

        {/* Description */}
        {/* Description */}
        {description && (
          <div className="pc-description">
            <p className="pc-description-text">{shortDescription}</p>

            {isLongDescription && (
              <button className="pc-see-more-btn" onClick={togglePopup}>
                See More
                <ChevronRight
                  size={14}
                  style={{
                    display: "inline",
                    marginLeft: "2px",
                  }}
                />
              </button>
            )}
          </div>
        )}

        <div className="pc-progress-wrap">
          <div className="pc-progress-track">
            <div
              className="pc-progress-fill"
              style={{
                width: `${Math.min(progress || 0, 100)}%`,
                background: getProgressColor(),
              }}
            />
          </div>
          <span className="pc-progress-pct">
            {Math.min(progress || 0, 100)}%
          </span>
        </div>

        <div className="pc-footer">
          <div className="pc-dates">
            <div className="pc-date-row">
              <CalendarIcon size={12} />
              <strong>Start:</strong> {startDate || "N/A"}
            </div>
            <div className="pc-date-row">
              <CalendarIcon size={12} />
              <strong>End:</strong> {dueDate || "N/A"}
            </div>
          </div>

          <div className="pc-footer-right">
            {team && team.length > 0 && (
              <div className="pc-avatars">
                {team.slice(0, 3).map((m, idx) => (
                  <span
                    key={idx}
                    className="pc-avatar"
                    style={{ background: m.color || "#6366F1" }}
                  >
                    {m.initials || m.name?.[0] || "U"}
                  </span>
                ))}
                {team.length > 3 && (
                  <span className="pc-avatar pc-avatar--extra">
                    +{team.length - 3}
                  </span>
                )}
              </div>
            )}

            {canView && (
              <button className="pc-view-btn" onClick={handleViewProject}>
                <Eye size={14} />
                View
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description Popup */}
      {popupOpen && (
        <div className="pc-popup-overlay" onClick={togglePopup}>
          <div className="pc-popup" onClick={(e) => e.stopPropagation()}>
            <div className="pc-popup-header">
              <h4>{name}</h4>
              <button className="pc-popup-close" onClick={togglePopup}>
                <X size={18} />
              </button>
            </div>
            <div
              className="pc-popup-description"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectCard;
