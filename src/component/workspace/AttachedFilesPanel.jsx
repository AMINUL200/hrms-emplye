import React from "react";
import "./AttachedFilesPanel.css";
import { FileImage, Download, ArrowRight, File, FileText, FileSpreadsheet, FileArchive, Image, Eye } from "lucide-react";

const AttachedFilesPanel = ({ overViewInfo = {},  }) => {
  const storageUrl = import.meta.env.VITE_STORAGE_URL
  // Extract image/file from overViewInfo
  const {
    image = null,
    title = "Untitled",
    unique_id = "N/A",
  } = overViewInfo;

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

  // Get full image URL with storage path
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it already starts with http, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Otherwise, prepend storage URL
    return `${storageUrl}${imagePath}`;
  };

  // Get file extension from URL
  const getFileExtension = (filePath) => {
    if (!filePath) return null;
    const parts = filePath.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

  // Get file name from URL
  const getFileName = (filePath) => {
    if (!filePath) return null;
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  };

  // Get file size (mock - you can implement actual file size detection)
  const getFileSize = () => {
    return "2.4 MB";
  };

  // Get file extension badge class
  const getExtClass = (ext) => {
    const extMap = {
      pdf: "afp-ext--pdf",
      xlsx: "afp-ext--xlsx",
      xls: "afp-ext--xlsx",
      docx: "afp-ext--docx",
      doc: "afp-ext--docx",
      png: "afp-ext--image",
      jpg: "afp-ext--image",
      jpeg: "afp-ext--image",
      gif: "afp-ext--image",
      svg: "afp-ext--image",
      webp: "afp-ext--image",
      zip: "afp-ext--archive",
      rar: "afp-ext--archive",
      '7z': "afp-ext--archive",
      mp4: "afp-ext--video",
      avi: "afp-ext--video",
      mov: "afp-ext--video",
      mp3: "afp-ext--audio",
      wav: "afp-ext--audio",
    };
    return extMap[ext] || "afp-ext--default";
  };

  // Get file icon
  const getFileIcon = (ext) => {
    const iconMap = {
      pdf: <FileText size={18} />,
      xlsx: <FileSpreadsheet size={18} />,
      xls: <FileSpreadsheet size={18} />,
      docx: <FileText size={18} />,
      doc: <FileText size={18} />,
      png: <Image size={18} />,
      jpg: <Image size={18} />,
      jpeg: <Image size={18} />,
      gif: <Image size={18} />,
      svg: <Image size={18} />,
      webp: <Image size={18} />,
      zip: <FileArchive size={18} />,
      rar: <FileArchive size={18} />,
      '7z': <FileArchive size={18} />,
    };
    return iconMap[ext] || <File size={18} />;
  };

  // Get file type label
  const getFileTypeLabel = (ext) => {
    const typeMap = {
      pdf: "PDF",
      xlsx: "XLSX",
      xls: "XLS",
      docx: "DOCX",
      doc: "DOC",
      png: "PNG",
      jpg: "JPG",
      jpeg: "JPEG",
      gif: "GIF",
      svg: "SVG",
      webp: "WEBP",
      zip: "ZIP",
      rar: "RAR",
      '7z': "7Z",
      mp4: "MP4",
      avi: "AVI",
      mov: "MOV",
      mp3: "MP3",
      wav: "WAV",
    };
    return typeMap[ext] || ext.toUpperCase();
  };

  // Handle download
  const handleDownload = (filePath) => {
    if (filePath) {
      const fullUrl = getFullImageUrl(filePath);
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = getFileName(filePath) || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle preview
  const handlePreview = (filePath) => {
    if (filePath) {
      const fullUrl = getFullImageUrl(filePath);
      window.open(fullUrl, '_blank');
    }
  };

  // Check if image exists
  const hasFile = image !== null && image !== "";

  // Get file extension and details
  const fileExt = hasFile ? getFileExtension(image) : null;
  const fileName = hasFile ? getFileName(image) : null;
  const fileExtLabel = fileExt ? getFileTypeLabel(fileExt) : "FILE";
  const extClass = fileExt ? getExtClass(fileExt) : "afp-ext--default";
  const fileIcon = fileExt ? getFileIcon(fileExt) : <File size={18} />;

  // Determine if it's an image (for preview)
  const isImage = fileExt && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(fileExt);

  // Get full file URL
  const fullFileUrl = hasFile ? getFullImageUrl(image) : null;

  return (
    <div className="afp-card">
      <div className="afp-header">
        <span className="afp-header-icon">
          <FileImage size={16} />
        </span>
        <h3>Attached Files</h3>
        {hasFile && (
          <span className="afp-file-count">1 file</span>
        )}
      </div>

      <div className="afp-list">
        {hasFile ? (
          <div className="afp-row">
            {/* File Preview Thumbnail */}
            {isImage ? (
              <div className="afp-image-preview">
                <img 
                  src={fullFileUrl} 
                  alt={fileName || title}
                  className="afp-thumbnail"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="afp-ext-badge ${extClass}">${fileExtLabel}</span>`;
                  }}
                />
              </div>
            ) : (
              <span className={`afp-ext-badge ${extClass}`}>
                {fileExtLabel}
              </span>
            )}

            <div className="afp-file-info">
              <span className="afp-file-name">{fileName || title}</span>
              <span className="afp-file-meta">
                {getFileSize()} &middot; Uploaded on {formatDate(overViewInfo.created_at)}
              </span>
              {isImage && (
                <span className="afp-file-type">Image</span>
              )}
            </div>

            <div className="afp-actions">
              <button 
                type="button" 
                className="afp-action-btn afp-action-btn--preview"
                aria-label="Preview"
                onClick={() => handlePreview(image)}
                title="Preview"
              >
                <Eye size={15} />
              </button>
              <button 
                type="button" 
                className="afp-download-btn" 
                aria-label="Download"
                onClick={() => handleDownload(image)}
                title="Download"
              >
                <Download size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="afp-empty-state">
            <span className="afp-empty-icon">📄</span>
            <p className="afp-empty-text">No files attached</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachedFilesPanel;