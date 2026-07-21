import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./WorkspaceSubmission.css";
import {
  Send,
  Paperclip,
  UploadCloud,
  X,
  File,
  Image,
  FileText,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContex";

const WorkspaceSubmission = ({ 
  workspaceId: propWorkspaceId, 
  onSuccess = null,
  selectedItem = {}
}) => {
  const { token } = useContext(AuthContext);
  const { workspaceId: urlWorkspaceId } = useParams();
  const api_url = import.meta.env.VITE_API_URL;

  const [remarks, setRemarks] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Use workItemId from props or from URL params
  const itemId = propWorkspaceId || urlWorkspaceId;

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById("wsb-file");
    if (fileInput) fileInput.value = "";
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!remarks.trim()) {
      toast.error("Please enter remarks");
      return;
    }

    if (!itemId) {
      toast.error("Work item ID not found");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("work_item_id", itemId);
      formData.append("remarks", remarks.trim());
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await axios.post(
        `${api_url}/task-completed-remarks`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === 1) {
        toast.success("Task marked completed successfully!");
        setRemarks("");
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById("wsb-file");
        if (fileInput) fileInput.value = "";

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Get file icon based on file type
  const getFileIcon = (file) => {
    if (!file) return <File size={16} />;
    const type = file.type;
    if (type.startsWith('image/')) {
      return <Image size={16} />;
    }
    if (type === 'application/pdf') {
      return <FileText size={16} />;
    }
    return <File size={16} />;
  };

  // Get file size in readable format
  const getFileSize = (file) => {
    if (!file) return "";
    const size = file.size;
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="wsb-card">
      <div className="wsb-header">
        <span className="wsb-header-icon">
          <UploadCloud size={16} />
        </span>
        <h3>Submit Work</h3>
        {selectedItem?.title && (
          <span className="wsb-item-title">{selectedItem.title}</span>
        )}
      </div>

      <form className="wsb-form" onSubmit={handleSubmit}>
        <div className="wsb-field">
          <label htmlFor="wsb-remarks" className="wsb-label">
            Remarks <span className="wsb-required">*</span>
          </label>
          <textarea
            id="wsb-remarks"
            className="wsb-textarea"
            rows={5}
            placeholder="Describe the work you're submitting..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required
            disabled={submitting}
          />
        </div>

        <div className="wsb-field">
          <label htmlFor="wsb-file" className="wsb-label">
            Attach File <span className="wsb-optional"></span>
          </label>
          <div className="wsb-file-box">
            <Paperclip size={15} className="wsb-file-icon" />
            <input
              type="file"
              id="wsb-file"
              className="wsb-file-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar,.xlsx,.xls,.txt"
              disabled={submitting}
            />
          </div>
          {selectedFile && (
            <div className="wsb-file-preview">
              <div className="wsb-file-preview-info">
                {getFileIcon(selectedFile)}
                <span className="wsb-file-preview-name">
                  {selectedFile.name}
                </span>
                <span className="wsb-file-preview-size">
                  ({getFileSize(selectedFile)})
                </span>
              </div>
              <button
                type="button"
                className="wsb-file-remove-btn"
                onClick={handleRemoveFile}
                aria-label="Remove file"
                disabled={submitting}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="wsb-actions">
          <button
            type="submit"
            className="wsb-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="wsb-spinner"></span>
                Submitting...
              </>
            ) : (
              <>
                <Send size={14} />
                Submit
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceSubmission;