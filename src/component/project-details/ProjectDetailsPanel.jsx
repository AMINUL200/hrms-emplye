import React from "react";
import "./ProjectDetailsPanel.css";
import { MoreVertical } from "lucide-react";



const ProjectDetailsPanel = ({
  projectDetails = {},
 
}) => {
  // Extract project details with fallbacks
  const {
    title = "Project",
    emid = "N/A",
    description = "No description available",
    identifier = "N/A",
    createdBy = "N/A",
    status = "open",
    project_start_date = "N/A",
    project_end_date = "N/A",
    created_at = "N/A",
    updated_at = "N/A",
  } = projectDetails;

  // Format date function
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      open: "pdp-badge--blue",
      in_progress: "pdp-badge--orange",
      completed: "pdp-badge--green",
      pending: "pdp-badge--orange",
      closed: "pdp-badge--gray",
      on_hold: "pdp-badge--red",
    };
    return statusMap[status] || "pdp-badge--blue";
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

  // Get priority (from identifier or default)
  const getPriority = () => {
    // You can determine priority based on some logic
    // For now, return a default or derive from identifier
    if (identifier === "SWCUKW") return "High";
    return "Medium";
  };

  // Get owner (from createdBy or emid)
  const getOwner = () => {
    return emid || `User ${createdBy}`;
  };

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
          <span className="pdp-label">Start Date</span>
          <span className="pdp-badge pdp-badge--blue">
            {formatDate(project_start_date)}
          </span>
        </div>

        <div className="pdp-row">
          <span className="pdp-label">End Date</span>
          <span className="pdp-badge pdp-badge--red">
            {formatDate(project_end_date)}
          </span>
        </div>

        <div className="pdp-row">
          <span className="pdp-label">Status</span>
          <span className={`pdp-badge ${getStatusClass(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>

        <div className="pdp-row">
          <span className="pdp-label">Priority</span>
          <span className="pdp-badge pdp-badge--orange">{getPriority()}</span>
        </div>

        

        
      </div>
    </div>
  );
};

export default ProjectDetailsPanel;