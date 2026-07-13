import React, { useState } from "react";
import "./WorkspaceSubmission.css";
import { Send, Paperclip, UploadCloud } from "lucide-react";

const WorkspaceSubmission = () => {
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // submit logic goes here
  };

  return (
    <div className="wsb-card">
      <div className="wsb-header">
        <span className="wsb-header-icon">
          <UploadCloud size={16} />
        </span>
        <h3>Submit Work</h3>
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
          />
        </div>

        <div className="wsb-field">
          <label htmlFor="wsb-file" className="wsb-label">
            Attach File <span className="wsb-optional">(Optional)</span>
          </label>
          <div className="wsb-file-box">
            <Paperclip size={15} className="wsb-file-icon" />
            <input
              type="file"
              id="wsb-file"
              className="wsb-file-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
            />
          </div>
          {file && <span className="wsb-file-name">Selected: {file.name}</span>}
        </div>

        <div className="wsb-actions">
          <button type="submit" className="wsb-submit-btn">
            <Send size={14} />
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceSubmission;