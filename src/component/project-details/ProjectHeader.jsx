import React from "react";
import "./ProjectHeader.css";
import { Pencil, Plus, UserPlus, MoreVertical } from "lucide-react";

const ProjectHeader = ({ projectName = "Website Development", status = "Active" }) => {
  return (
    <div className="pjh-wrap">
      <div className="pjh-top">
        <div className="pjh-left">
          <div className="pjh-breadcrumb">
            <a href="#!">Projects</a>
            <span>/</span>
            <span className="pjh-breadcrumb-current">{projectName}</span>
          </div>
          <div className="pjh-title-row">
            <h1>{projectName}</h1>
            <span className="pjh-status-badge">{status}</span>
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