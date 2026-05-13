import React, { useContext, useMemo, useEffect, useState } from "react";

import axios from "axios";

import { toast } from "react-toastify";

import "./WorkspacePage.css";

import { WorkspaceContext } from "../../../context/WorkspaceContext";

import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../../context/AuthContex";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faUser,
  faUsers,
  faClock,
  faCheckCircle,
  faExclamationCircle,
  faFileAlt,
  faPaperclip,
  faDownload,
  faEye,
  faComment,
  faListCheck,
  faChartSimple,
  faUserPlus,
  faEnvelope,
  faPhone,
  faTag,
  faLayerGroup,
  faIdCard,
  faCalendarDay,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

const WorkspacePage = () => {
  const { projectId } = useParams();

  const navigate = useNavigate();

  const { token } = useContext(AuthContext);

  const api_url = import.meta.env.VITE_API_URL;

  const { selectedItem, treeData, setSelectedItem } =
    useContext(WorkspaceContext);

  // ========================================
  // STATES
  // ========================================

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [workspaceDetails, setWorkspaceDetails] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");

  const [remarks, setRemarks] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // ========================================
  // FIND BREADCRUMB
  // ========================================

  const findPath = (tree, targetId, path = []) => {
    for (const item of tree) {
      const newPath = [...path, item];

      if (item.id === targetId) {
        return newPath;
      }

      if (item.children?.length) {
        const found = findPath(item.children, targetId, newPath);

        if (found) return found;
      }
    }

    return null;
  };

  // ========================================
  // BREADCRUMB
  // ========================================

  const breadcrumb = useMemo(() => {
    if (!selectedItem) return [];

    return findPath(treeData, selectedItem.id) || [];
  }, [selectedItem, treeData]);

  // ========================================
  // DETAILS API
  // ========================================

  const getWorkspaceDetails = async () => {
    if (!selectedItem?.id) return;

    try {
      setDetailsLoading(true);

      const response = await axios.get(
        `${api_url}/module-details/${selectedItem.id}/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("WORKSPACE DETAILS:", response.data);

      setWorkspaceDetails(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ========================================
  // AUTO LOAD DETAILS
  // ========================================

  useEffect(() => {
    getWorkspaceDetails();
  }, [selectedItem]);

  // ========================================
  // GET TABS
  // ========================================

  const getTabs = () => {
    if (!selectedItem) return [];

    // MODULE / SUBMODULE
    if (selectedItem.type === "module" || selectedItem.type === "submodule") {
      return [
        { id: "overview", label: "Overview", icon: faChartSimple },
        { id: "assignedEmployees", label: "Team Members", icon: faUsers },
        { id: "comments", label: "Comments", icon: faComment },
      ];
    }

    // TASK / SUBTASK
    if (selectedItem.type === "task" || selectedItem.type === "subtask") {
      return [
        { id: "overview", label: "Overview", icon: faChartSimple },
        { id: "assignedEmployees", label: "Team Members", icon: faUsers },
        { id: "remarkForm", label: "Submit Work", icon: faUpload },
        { id: "remarksHistory", label: "Work History", icon: faListCheck },
      ];
    }

    return [];
  };

  const tabs = getTabs();

  // ========================================
  // SUBMIT REMARKS
  // ========================================

  const handleSubmitRemarks = async () => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("work_item_id", selectedItem.id);

      formData.append("remarks", remarks);

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
        },
      );

      if (response.data.status === 1) {
        toast.success("Task marked completed successfully!");

        setRemarks("");

        setSelectedFile(null);

        getWorkspaceDetails();
      }
    } catch (error) {
      console.log(error);

      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // GET STATUS COLOR
  // ========================================

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return {
          color: "#ff902f",
          bg: "#fff3e0",
          icon: faClock,
          label: "Open",
        };
      case "in-progress":
        return {
          color: "#3b82f6",
          bg: "#eff6ff",
          icon: faClock,
          label: "In Progress",
        };
      case "completed":
        return {
          color: "#10b981",
          bg: "#dcfce7",
          icon: faCheckCircle,
          label: "Completed",
        };
      default:
        return {
          color: "#6b7280",
          bg: "#f3f4f6",
          icon: faExclamationCircle,
          label: status || "Unknown",
        };
    }
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ========================================
  // EMPTY
  // ========================================

  if (!selectedItem) {
    return (
      <div className="workspace-main">
        <div className="empty-workspace">
          <div className="empty-icon">📁</div>

          <h2>Select Any Item</h2>

          <p>
            Click any module, submodule, task or subtask from sidebar to view
            details.
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // LOADING
  // ========================================

  if (detailsLoading) {
    return (
      <div className="workspace-main">
        <div className="premium-loading">
          <div className="loading-spinner"></div>

          <p>Loading Details...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  const statusConfig = getStatusConfig(workspaceDetails?.details?.status);
  const details = workspaceDetails?.details;

  return (
    <div className="workspace-main">
      {/* ========================================
          TOP ACTIONS
      ======================================== */}

      <div className="workspace-top-actions">
        <button
          className="back-project-btn"
          onClick={() => navigate("/organization/assigned-project")}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Projects
        </button>
      </div>

      {/* ========================================
          BREADCRUMB
      ======================================== */}

      <div className="breadcrumb-premium">
        <div className="breadcrumb-home">
          <span>📁</span>
        </div>

        {breadcrumb.map((item, index) => (
          <div key={item.id} className="breadcrumb-link">
            <button onClick={() => setSelectedItem(item)}>{item.title}</button>

            {index < breadcrumb.length - 1 && (
              <span className="breadcrumb-separator">/</span>
            )}
          </div>
        ))}
      </div>

      {/* ========================================
          TABS
      ======================================== */}

      <div className="workspace-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "active-tab" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            <FontAwesomeIcon icon={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================
          TAB CONTENT
      ======================================== */}

      <div className="workspace-tab-content">
        {/* ========================================
            OVERVIEW
        ======================================== */}

        {activeTab === "overview" && (
          <div className="tab-card">
            <div className="tab-header">
              <h3>
                <FontAwesomeIcon icon={faChartSimple} />
                Overview
              </h3>
            </div>

            <div className="overview-grid">
              <div className="overview-item">
                <span className="overview-label">Status</span>

                <div className="overview-value">
                  <div
                    className="status-indicator"
                    style={{ background: statusConfig.color }}
                  />
                  {statusConfig.label}
                </div>
              </div>

              <div className="overview-item">
                <span className="overview-label">Type</span>

                <div className="overview-value">{selectedItem.type}</div>
              </div>

              <div className="overview-item">
                <span className="overview-label">Employee Code</span>

                <div className="overview-value">{details?.emid || "N/A"}</div>
              </div>

              <div className="overview-item">
                <span className="overview-label">Total Submissions</span>

                <div className="overview-value">
                  {workspaceDetails?.submissions?.length || 0}
                </div>
              </div>
            </div>

            {details?.description && (
              <div className="description-box">
                <h4>
                  <FontAwesomeIcon icon={faFileAlt} />
                  Description
                </h4>

                <p>{details.description}</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================
    ASSIGNED EMPLOYEES - TABLE VIEW
======================================== */}

        {activeTab === "assignedEmployees" && (
          <div className="tab-card">
            <div className="tab-header">
              <h3>
                <FontAwesomeIcon icon={faUsers} />
                Team Members
              </h3>
              <span className="member-count">
                {workspaceDetails?.employee_count} Members
              </span>
            </div>

            <div className="employee-table-container">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Role</th>
                    <th>Access Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaceDetails?.employees?.length > 0 ? (
                    workspaceDetails.employees.map((emp, index) => (
                      <tr key={emp.employee_id} className="employee-row">
                        <td className="serial-number">{index + 1}</td>
                        <td className="employee-info-cell">
                          <div className="employee-info-wrapper">
                            <div className="employee-avatar-small-table">
                              {emp.employee_name?.charAt(0) || "U"}
                            </div>
                            <div className="employee-details">
                              <span className="employee-name-table">
                                {emp.employee_name}
                              </span>
                              <span className="employee-email-hint">
                                {emp.employee_id?.toLowerCase()}@company.com
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="employee-id-cell">
                          <code>{emp.employee_id}</code>
                        </td>
                        <td className="role-cell">
                          <span
                            className={`role-badge role-${emp.role || "member"}`}
                          >
                            {emp.role || "Member"}
                          </span>
                        </td>
                        <td className="access-type-cell">
                          <span className="access-badge">
                            <FontAwesomeIcon icon={faEye} />
                            {emp.access_type || "View"}
                          </span>
                        </td>
                        <td className="status-cell">
                          <span className="status-badge-table active">
                            <span className="status-dot"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-table-row">
                        <div className="empty-state-small">
                          <FontAwesomeIcon icon={faUserPlus} />
                          <p>No team members assigned yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================
            REMARK FORM
        ======================================== */}

        {activeTab === "remarkForm" && (
          <div className="tab-card">
            <div className="tab-header">
              <h3>
                <FontAwesomeIcon icon={faUpload} />
                Submit Work Report
              </h3>
            </div>

            <div className="remark-form">
              <div className="form-group">
                <label>Work Details / Remarks</label>
                <textarea
                  placeholder="Describe the work completed, challenges faced, and any important notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="5"
                />
              </div>

              <div className="form-group">
                <label>Attachment (Optional)</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    hidden
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <FontAwesomeIcon icon={faPaperclip} />
                    {selectedFile ? selectedFile.name : "Click to upload file"}
                  </label>
                  {selectedFile && (
                    <button
                      className="clear-file-btn"
                      onClick={() => setSelectedFile(null)}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <button
                className="submit-remark-btn"
                onClick={handleSubmitRemarks}
                disabled={submitting || !remarks.trim()}
              >
                {submitting ? "Submitting..." : "Submit Work Report"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================
            REMARKS HISTORY
        ======================================== */}

        {activeTab === "remarksHistory" && (
          <div className="tab-card">
            <div className="tab-header">
              <h3>
                <FontAwesomeIcon icon={faListCheck} />
                Work History
              </h3>
              <span className="history-count">
                {workspaceDetails?.submissions?.length || 0} Entries
              </span>
            </div>

            <div className="remarks-list">
              {workspaceDetails?.submissions?.length > 0 ? (
                workspaceDetails.submissions.map((item, index) => (
                  <div key={item.id} className="remark-item">
                    <div className="remark-timeline">
                      <div className="timeline-dot"></div>
                      {index < workspaceDetails.submissions.length - 1 && (
                        <div className="timeline-line"></div>
                      )}
                    </div>

                    <div className="remark-content">
                      <div className="remark-header">
                        <div className="remark-user">
                          <div className="user-avatar-small">
                            {item.employee_name?.charAt(0) || "U"}
                          </div>

                          <div>
                            <h4>{item.employee_name}</h4>
                            <span className="user-id">{item.employee_id}</span>
                          </div>
                        </div>

                        <span className="remark-date">
                          <FontAwesomeIcon icon={faClock} />
                          {new Date(item.submitted_at).toLocaleString()}
                        </span>
                      </div>

                      <p className="remark-text">{item.remarks}</p>

                      {item.file && (
                        <a
                          href={`${api_url}/${item.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="remark-file"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                          View Attachment
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state-small">
                  <FontAwesomeIcon icon={faFileAlt} />
                  <p>No work history available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================
            COMMENTS
        ======================================== */}

        {activeTab === "comments" && (
          <div className="tab-card">
            <div className="tab-header">
              <h3>
                <FontAwesomeIcon icon={faComment} />
                Comments
              </h3>
            </div>

            <div className="coming-soon">
              <div className="coming-soon-icon">💬</div>
              <h4>Comments Feature Coming Soon</h4>
              <p>Stay tuned for team collaboration and discussions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspacePage;
