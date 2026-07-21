import React from "react";
import "./WorkspaceWorkHistory.css";
import {
  History,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Calendar,
  File,
} from "lucide-react";

const WorkspaceWorkHistory = ({ workHistory = [] }) => {
  const storageUrl = import.meta.env.VITE_STORAGE_URL
  // Format date
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

  // Get full file URL with storage path
  const getFullFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `${storageUrl}${filePath}`;
  };

  // Get file name from path
  const getFileName = (filePath) => {
    if (!filePath) return null;
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  };

  // Get file extension
  const getFileExtension = (filePath) => {
    if (!filePath) return null;
    const parts = filePath.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

  // Get file icon based on extension
  const getFileIcon = (filePath) => {
    if (!filePath) return <File size={14} />;
    const ext = getFileExtension(filePath);
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return <File size={14} />;
    }
    return <Paperclip size={14} />;
  };

  // Handle file download
  const handleFileDownload = (filePath) => {
    if (filePath) {
      const fullUrl = getFullFileUrl(filePath);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = getFileName(filePath) || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle file preview
  const handleFilePreview = (filePath) => {
    if (filePath) {
      const fullUrl = getFullFileUrl(filePath);
      window.open(fullUrl, '_blank');
    }
  };

  // Determine file type for badge
  const getFileTypeBadge = (filePath) => {
    if (!filePath) return null;
    const ext = getFileExtension(filePath);
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return 'Image';
    }
    if (['pdf'].includes(ext)) {
      return 'PDF';
    }
    if (['doc', 'docx'].includes(ext)) {
      return 'Document';
    }
    if (['xls', 'xlsx'].includes(ext)) {
      return 'Spreadsheet';
    }
    return 'File';
  };

  return (
    <div className="wwh-card">
      <div className="wwh-header">
        <span className="wwh-header-icon">
          <History size={16} />
        </span>
        <h3>Work History</h3>
        <span className="wwh-count-badge">{workHistory.length}</span>
      </div>

      <div className="wwh-list">
        {workHistory.length > 0 ? (
          workHistory.map((entry) => (
            <div className="wwh-item" key={entry.id || entry.submitted_at}>
              <div className="wwh-item-top">
                <div className="wwh-date-info">
                  <span className="wwh-date">
                    <Calendar size={12} className="wwh-date-icon" />
                    {formatDateTime(entry.submitted_at)}
                  </span>
                  <span className="wwh-submitter">
                    <User size={12} className="wwh-user-icon" />
                    {entry.employee_name || entry.employee_id}
                  </span>
                </div>
                {entry.file && (
                  <span className="wwh-file-type-badge">
                    {getFileTypeBadge(entry.file)}
                  </span>
                )}
              </div>

              <p className="wwh-remarks">{entry.remarks || "No remarks provided"}</p>

              {entry.file && (
                <div className="wwh-file-chip" onClick={() => handleFilePreview(entry.file)}>
                  {getFileIcon(entry.file)}
                  <span className="wwh-file-name">{getFileName(entry.file)}</span>
                  <button 
                    className="wwh-file-download-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDownload(entry.file);
                    }}
                    aria-label="Download file"
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="wwh-empty-state">
            <span className="wwh-empty-icon">📝</span>
            <p className="wwh-empty-text">No work history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceWorkHistory;