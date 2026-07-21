import React from "react";
import "./ProjectOverviewCard.css";
import { LayoutGrid, Folder, Flag, Timer, Plus, User, Calendar, Clock } from "lucide-react";

const ProjectOverviewCard = ({ overViewInfo = {}, projectInfo = {}, employeeCount = 0 }) => {
  // Extract data from overViewInfo (work item details)
  const {
    id = "N/A",
    unique_id = "N/A",
    title = "Untitled",
    description = "No description available",
    priority = "Medium",
    status = "open",
    start_date = null,
    end_date = null,
    created_by = "N/A",
    emid = "N/A",
    created_at = null,
    updated_at = null,
    type = "task",
    image = null,
  } = overViewInfo;

  // Extract project info
  const {
    title: projectTitle = "Project",
    identifier = "N/A",
    status: projectStatus = "open",
    project_start_date = null,
    project_end_date = null,
  } = projectInfo || {};

  // Format date function
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

  // Format date with time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

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

  // Get priority label
  const getPriorityLabel = (priority) => {
    const priorityMap = {
      High: "High",
      Medium: "Medium",
      Low: "Low",
    };
    return priorityMap[priority] || priority;
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    const statusMap = {
      open: "poc-status--open",
      in_progress: "poc-status--progress",
      completed: "poc-status--completed",
      pending: "poc-status--pending",
      closed: "poc-status--closed",
      on_hold: "poc-status--onhold",
    };
    return statusMap[status] || "poc-status--open";
  };

  // Get priority class for styling
  const getPriorityClass = (priority) => {
    const priorityMap = {
      High: "poc-priority--high",
      Medium: "poc-priority--medium",
      Low: "poc-priority--low",
    };
    return priorityMap[priority] || "poc-priority--medium";
  };

  // Clean description (remove HTML tags)
  const cleanDescription = (html) => {
    if (!html) return "No description available";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "No description available";
  };

  // Get type label
  const getTypeLabel = () => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Manager info (using created_by as manager)
  const manager = {
    name: created_by || "Unassigned",
    code: emid || "N/A",
    avatarUrl: null,
  };

  return (
    <div className="poc-card">
      <div className="poc-header">
        <span className="poc-header-icon">
          <LayoutGrid size={16} />
        </span>
        <h3>Project Overview</h3>
       
      </div>

      {/* Top 4 stat boxes */}
      <div className="poc-stats-row">
        <div className="poc-stat-box">
          <div className="poc-stat-top">
            <span className="poc-stat-icon poc-stat-icon--blue">
              <Folder size={15} />
            </span>
            <span className="poc-stat-label">STATUS</span>
          </div>
          <span className={`poc-stat-value ${getStatusClass(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>

        <div className={`poc-stat-box poc-stat-box--priority ${getPriorityClass(priority)}`}>
          <div className="poc-stat-top">
            <span className="poc-stat-icon poc-stat-icon--orange">
              <Flag size={15} />
            </span>
            <span className="poc-stat-label">PRIORITY</span>
          </div>
          <span className="poc-stat-value poc-stat-value--orange">
            {getPriorityLabel(priority)}
          </span>
        </div>

        <div className="poc-stat-box">
          <div className="poc-stat-top">
            <span className="poc-stat-icon poc-stat-icon--green">
              <Timer size={15} />
            </span>
            <span className="poc-stat-label">EMPLOYEES</span>
          </div>
          <span className="poc-stat-value">{employeeCount || 0}</span>
        </div>

        <div className="poc-stat-box poc-stat-box--manager">
          <div className="poc-stat-top">
            <span className="poc-manager-plus">
              <Plus size={11} />
            </span>
            <span className="poc-stat-label">CREATED BY</span>
          </div>
          <div className="poc-manager-row">
            <span className="poc-manager-avatar">
              {manager.avatarUrl ? (
                <img src={manager.avatarUrl} alt={manager.name} />
              ) : (
                manager.name.charAt(0).toUpperCase()
              )}
            </span>
            <div className="poc-manager-text">
              <span className="poc-manager-name">{manager.name}</span>
              <span className="poc-manager-code">{manager.code}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info rows - Single column with all fields */}
      <div className="poc-info-grid">
        <div className="poc-info-col">
         
          <div className="poc-info-row">
            <span className="poc-info-label">Start Date</span>
            <span className="poc-info-value">{formatDate(start_date)}</span>
          </div>
          <div className="poc-info-row">
            <span className="poc-info-label">End Date</span>
            <span className="poc-info-value">{formatDate(end_date)}</span>
          </div>
          
          <div className="poc-info-row poc-info-row--desc">
            <span className="poc-info-label">Description</span>
            <span className="poc-info-value poc-info-value--desc">
              {cleanDescription(description)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewCard;