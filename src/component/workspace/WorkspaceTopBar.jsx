import React from "react";
import "./WorkspaceTopBar.css";
import { ArrowLeft, Pencil } from "lucide-react";

const WorkspaceTopBar = ({ onBack, onEdit }) => {
  return (
    <div className="wtb-wrap">
      <button type="button" className="wtb-back-btn" onClick={onBack}>
        <ArrowLeft size={15} />
        Back to Projects
      </button>

      <button type="button" className="wtb-edit-btn" onClick={onEdit}>
        <Pencil size={14} />
        Edit Project
      </button>
    </div>
  );
};

export default WorkspaceTopBar;