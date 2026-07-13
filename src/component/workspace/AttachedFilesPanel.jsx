import React from "react";
import "./AttachedFilesPanel.css";
import { FileImage, Download, ArrowRight } from "lucide-react";

const FILES = [
  {
    id: 1,
    name: "Project_Requirement_Document.pdf",
    size: "2.4 MB",
    date: "24 Jun 2026",
    ext: "PDF",
    extClass: "afp-ext--pdf",
  },
  {
    id: 2,
    name: "Project_Budget_Estimate.xlsx",
    size: "1.1 MB",
    date: "24 Jun 2026",
    ext: "XLSX",
    extClass: "afp-ext--xlsx",
  },
  {
    id: 3,
    name: "Project_Timeline.docx",
    size: "1.3 MB",
    date: "24 Jun 2026",
    ext: "DOCX",
    extClass: "afp-ext--docx",
  },
];

const AttachedFilesPanel = () => {
  return (
    <div className="afp-card">
      <div className="afp-header">
        <span className="afp-header-icon">
          <FileImage size={16} />
        </span>
        <h3>Attached Files</h3>
      </div>

      <div className="afp-list">
        {FILES.map((f) => (
          <div className="afp-row" key={f.id}>
            <span className={`afp-ext-badge ${f.extClass}`}>{f.ext}</span>
            <div className="afp-file-info">
              <span className="afp-file-name">{f.name}</span>
              <span className="afp-file-meta">
                {f.size} &middot; Uploaded on {f.date}
              </span>
            </div>
            <button type="button" className="afp-download-btn" aria-label="Download">
              <Download size={15} />
            </button>
          </div>
        ))}
      </div>

      <a href="#!" className="afp-view-all">
        View All Documents
        <ArrowRight size={14} />
      </a>
    </div>
  );
};

export default AttachedFilesPanel;