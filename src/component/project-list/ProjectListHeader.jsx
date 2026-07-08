import React from "react";
import "./ProjectListHeader.css";
import { Plus, Download } from "lucide-react";

const ProjectListHeader = () => {
  return (
    <div className="plh-wrap">
      <div className="plh-left">
        <div className="plh-breadcrumb">
          <a href="#!">Dashboard</a>
          <span>/</span>
          <span className="plh-breadcrumb-current">Projects</span>
        </div>
        <h1 className="plh-title">Project List</h1>
        <p className="plh-subtitle">Track progress, workload, and status across all active projects</p>
      </div>

      <div className="plh-actions">
        <button type="button" className="plh-btn plh-btn--outline">
          <Download size={15} />
          Export
        </button>
        <button type="button" className="plh-btn plh-btn--primary">
          <Plus size={16} />
          New Project
        </button>
      </div>
    </div>
  );
};

export default ProjectListHeader;