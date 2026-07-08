import React from "react";
import "./ProjectFiles.css";
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Download,
  Upload,
  MoreVertical,
} from "lucide-react";

const FILE_TYPE_ICON = {
  pdf: FileText,
  image: ImageIcon,
  sheet: FileSpreadsheet,
  zip: FileArchive,
};

const FILE_TYPE_CLASS = {
  pdf: "pf-icon--red",
  image: "pf-icon--blue",
  sheet: "pf-icon--green",
  zip: "pf-icon--orange",
};

const FILES = [
  { id: 1, name: "Homepage_Wireframes_v3.pdf", type: "pdf", size: "3.2 MB", uploadedBy: "Jane Smith", date: "05 Jul 2026" },
  { id: 2, name: "Brand_Style_Guide.pdf", type: "pdf", size: "1.8 MB", uploadedBy: "John Doe", date: "01 Jul 2026" },
  { id: 3, name: "Hero_Section_Mockup.png", type: "image", size: "4.6 MB", uploadedBy: "Jane Smith", date: "06 Jul 2026" },
  { id: 4, name: "QA_Test_Plan.xlsx", type: "sheet", size: "620 KB", uploadedBy: "Sarah Wilson", date: "07 Jul 2026" },
  { id: 5, name: "Sprint_Backlog.xlsx", type: "sheet", size: "410 KB", uploadedBy: "Mike Johnson", date: "03 Jul 2026" },
  { id: 6, name: "Assets_Archive.zip", type: "zip", size: "12.4 MB", uploadedBy: "Alex Turner", date: "02 Jul 2026" },
];

const ProjectFiles = () => {
  return (
    <div className="pf-card">
      <div className="pf-header">
        <h3>Files</h3>
        <button type="button" className="pf-upload-btn">
          <Upload size={14} />
          Upload File
        </button>
      </div>

      <div className="pf-list">
        {FILES.map((f) => {
          const Icon = FILE_TYPE_ICON[f.type];
          return (
            <div className="pf-row" key={f.id}>
              <span className={`pf-icon ${FILE_TYPE_CLASS[f.type]}`}>
                <Icon size={17} />
              </span>
              <div className="pf-file-info">
                <span className="pf-file-name">{f.name}</span>
                <span className="pf-file-meta">
                  {f.size} &middot; Uploaded by {f.uploadedBy} &middot; {f.date}
                </span>
              </div>
              <button type="button" className="pf-icon-btn" aria-label="Download">
                <Download size={16} />
              </button>
              <button type="button" className="pf-icon-btn" aria-label="More options">
                <MoreVertical size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectFiles;