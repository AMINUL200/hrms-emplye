import React, { useState, useEffect, useContext } from 'react';
import "./EmpAssignTasks.css";
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faList, 
  faTimes,
  faCheckCircle,
  faClock,
  faSitemap,
  faLayerGroup,
  faSpinner,
  faSearch,
  faEye,
  faPlusCircle,
  faFolder,
  faFilter,
  faChevronDown,
  faPaperclip,
  faUpload,
  faDownload,
  faUserCheck,
  faComment,
  faCalendarDay,
  faInfoCircle,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/AuthContex';

const EmpAssignTasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Task completion states
  const [remarks, setRemarks] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [completionData, setCompletionData] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${api_url}/my-task/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        setTasks(response.data.data || []);
      } else {
        toast.error("Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Fetch task completion details
  const fetchTaskCompletionDetails = async (taskId) => {
    setLoadingDetails(true);
    try {
      const response = await axios.get(
        `${api_url}/task-compleated/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        setCompletionData(response.data.data || []);
      } else {
        toast.error("Failed to fetch completion details");
      }
    } catch (err) {
      console.error("Error fetching completion details:", err);
      toast.error(err.response?.data?.message || "Failed to load completion details");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (token && projectId) {
      fetchTasks();
    }
  }, [token, projectId]);

  const getTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'task':
        return faTasks;
      case 'subtask':
        return faList;
      default:
        return faTasks;
    }
  };

  const getAssignmentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'assignment-completed';
      case 'in_progress':
        return 'assignment-progress';
      case 'pending':
        return 'assignment-pending';
      default:
        return 'assignment-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return faCheckCircle;
      case 'in_progress':
        return faClock;
      default:
        return faClock;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.assignment_status === filterStatus;
    const matchesType = filterType === "all" || task.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setActiveTab("overview");
    setRemarks("");
    setSelectedFile(null);
    setShowModal(true);
    // Fetch completion details when task is clicked
    await fetchTaskCompletionDetails(task.id);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    setCompletionData([]);
  };

  const handleCreateModule = () => {
    navigate(`/organization/emp-add-module/${projectId}?add=true`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmitCompletion = async () => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("work_item_id", selectedTask.id);
      formData.append("remarks", remarks);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await axios.post(
        `${api_url}/task-completed-remarks`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 1) {
        toast.success("Task marked as completed successfully!");
        setRemarks("");
        setSelectedFile(null);
        setActiveTab("overview");
        fetchTasks(); // Refresh tasks list
        await fetchTaskCompletionDetails(selectedTask.id); // Refresh completion details
      } else {
        toast.error(response.data.message || "Failed to mark task as completed");
      }
    } catch (err) {
      console.error("Error submitting completion:", err);
      toast.error(err.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.assignment_status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.assignment_status === "in_progress").length;
  const pendingTasks = tasks.filter(t => t.assignment_status === "pending").length;

  // Type options for dropdown
  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "task", label: "Tasks" },
    { value: "subtask", label: "Subtasks" }
  ];

  if (loading) {
    return (
      <div className="emp-tasks-container">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-tasks-container">
      {/* Header with Create Button */}
      <div className="tasks-header">
        <div className="header-left">
          <h1 className="tasks-title">My Tasks & Subtasks</h1>
        </div>
        <button className="create-module-btn" onClick={handleCreateModule}>
          <FontAwesomeIcon icon={faPlusCircle} />
          <span>Create New Module</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faTasks} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{totalTasks}</span>
            <span className="stat-label">Total Items</span>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{completedTasks}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{inProgressTasks}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{pendingTasks}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <div className="status-filters">
            <button 
              className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filterStatus === "in_progress" ? "active" : ""}`}
              onClick={() => setFilterStatus("in_progress")}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${filterStatus === "completed" ? "active" : ""}`}
              onClick={() => setFilterStatus("completed")}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="no-tasks">
          <FontAwesomeIcon icon={faTasks} className="no-tasks-icon" />
          <h3>No Tasks Found</h3>
          <p>{searchTerm ? "No tasks match your search criteria" : "You don't have any assigned tasks yet"}</p>
          <button className="create-first-btn" onClick={handleCreateModule}>
            <FontAwesomeIcon icon={faPlusCircle} />
            Create Your First Module
          </button>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="task-card"
              onClick={() => handleTaskClick(task)}
            >
              <div className="task-card-header">
                <div className="task-type">
                  <FontAwesomeIcon icon={getTypeIcon(task.type)} />
                  <span className="type-badge">{task.type}</span>
                </div>
                <div className={`assignment-status ${getAssignmentStatusColor(task.assignment_status)}`}>
                  <FontAwesomeIcon icon={getStatusIcon(task.assignment_status)} />
                  <span>{task.assignment_status?.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="task-card-content">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">
                  {task.description || "No description provided"}
                </p>
              </div>

              <div className="task-card-footer">
                <div className="task-path">
                  <FontAwesomeIcon icon={faSitemap} />
                  <span>{task.parent_title || "No parent"}</span>
                </div>
                <button className="view-details-btn">
                  <FontAwesomeIcon icon={faEye} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Modal with Tabs */}
      {showModal && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content unified-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FontAwesomeIcon icon={getTypeIcon(selectedTask.type)} />
                {selectedTask.title}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === "completion" ? "active" : ""}`}
                onClick={() => setActiveTab("completion")}
                disabled={selectedTask.assignment_status === "completed"}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                Submit Completion
              </button>
              <button 
                className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                <FontAwesomeIcon icon={faHistory} />
                Completion History ({completionData.length})
              </button>
            </div>

            <div className="modal-body">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="tab-content">
                  <div className="detail-section">
                    <h3>Task Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Type:</label>
                        <span className={`type-badge ${selectedTask.type}`}>
                          {selectedTask.type}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        <span className={`status-badge ${getAssignmentStatusColor(selectedTask.assignment_status)}`}>
                          {selectedTask.assignment_status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="detail-item full-width">
                        <label>Description:</label>
                        <p>{selectedTask.description || "No description provided"}</p>
                      </div>
                      {selectedTask.start_date && (
                        <div className="detail-item">
                          <label>Start Date:</label>
                          <span>{formatDate(selectedTask.start_date)}</span>
                        </div>
                      )}
                      {selectedTask.end_date && (
                        <div className="detail-item">
                          <label>End Date:</label>
                          <span>{formatDate(selectedTask.end_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Hierarchy Information</h3>
                    <div className="hierarchy-tree">
                      {selectedTask.g_g_parent_title && (
                        <>
                          <div className="hierarchy-node">
                            <div className="hierarchy-icon">
                              <FontAwesomeIcon icon={faLayerGroup} />
                            </div>
                            <div className="hierarchy-content">
                              <div className="hierarchy-label">Module</div>
                              <div className="hierarchy-value">{selectedTask.g_g_parent_title}</div>
                              <div className="hierarchy-type">{selectedTask.g_g_parent_type}</div>
                            </div>
                          </div>
                          <div className="hierarchy-arrow">
                            <FontAwesomeIcon icon={faSitemap} />
                          </div>
                        </>
                      )}

                      {selectedTask.grant_parent_title && (
                        <>
                          <div className="hierarchy-node">
                            <div className="hierarchy-icon">
                              <FontAwesomeIcon icon={faFolder} />
                            </div>
                            <div className="hierarchy-content">
                              <div className="hierarchy-label">Submodule</div>
                              <div className="hierarchy-value">{selectedTask.grant_parent_title}</div>
                              <div className="hierarchy-type">{selectedTask.grant_parent_type}</div>
                            </div>
                          </div>
                          <div className="hierarchy-arrow">
                            <FontAwesomeIcon icon={faSitemap} />
                          </div>
                        </>
                      )}

                      {selectedTask.parent_title && (
                        <>
                          <div className="hierarchy-node">
                            <div className="hierarchy-icon">
                              <FontAwesomeIcon icon={faTasks} />
                            </div>
                            <div className="hierarchy-content">
                              <div className="hierarchy-label">Parent Task</div>
                              <div className="hierarchy-value">{selectedTask.parent_title}</div>
                              <div className="hierarchy-type">{selectedTask.parent_type}</div>
                            </div>
                          </div>
                          <div className="hierarchy-arrow">
                            <FontAwesomeIcon icon={faSitemap} />
                          </div>
                        </>
                      )}

                      <div className="hierarchy-node current">
                        <div className="hierarchy-icon">
                          <FontAwesomeIcon icon={getTypeIcon(selectedTask.type)} />
                        </div>
                        <div className="hierarchy-content">
                          <div className="hierarchy-label">Current {selectedTask.type}</div>
                          <div className="hierarchy-value">{selectedTask.title}</div>
                          <div className="hierarchy-type">{selectedTask.type}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Form Tab */}
              {activeTab === "completion" && (
                <div className="tab-content">
                  <div className="completion-form">
                    <div className="task-info-box">
                      <h4>Task Information</h4>
                      <p><strong>Title:</strong> {selectedTask.title}</p>
                      <p><strong>Type:</strong> {selectedTask.type}</p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="remarks">
                        <FontAwesomeIcon icon={faComment} />
                        Remarks <span className="required">*</span>
                      </label>
                      <textarea
                        id="remarks"
                        rows="4"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Please provide details about the task completion..."
                        className="remarks-textarea"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="file">
                        <FontAwesomeIcon icon={faPaperclip} />
                        Attachment (Optional)
                      </label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          id="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="file-input"
                        />
                        <label htmlFor="file" className="file-label">
                          <FontAwesomeIcon icon={faUpload} />
                          {selectedFile ? selectedFile.name : "Choose file (PDF, DOC, JPG, PNG - Max 5MB)"}
                        </label>
                      </div>
                    </div>

                    {selectedFile && (
                      <div className="selected-file-info">
                        <FontAwesomeIcon icon={faPaperclip} />
                        <span>{selectedFile.name}</span>
                        <button onClick={() => setSelectedFile(null)} className="remove-file">
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completion History Tab */}
              {activeTab === "history" && (
                <div className="tab-content">
                  {loadingDetails ? (
                    <div className="loading-state">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <p>Loading completion history...</p>
                    </div>
                  ) : completionData.length > 0 ? (
                    <div className="completion-details-list">
                      {completionData.map((item) => (
                        <div key={item.id} className="completion-item">
                          <div className="completion-header">
                            <div className="employee-info">
                              <div className="employee-avatar-small">
                                {item.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h4>{item.name}</h4>
                                <p className="employee-id">Employee ID: {item.employee_id}</p>
                              </div>
                            </div>
                            <div className="completion-date">
                              <FontAwesomeIcon icon={faCalendarDay} />
                              <span>{formatDate(item.submitted_at)}</span>
                            </div>
                          </div>
                          
                          <div className="completion-remarks">
                            <label>Remarks:</label>
                            <p>{item.remarks}</p>
                          </div>

                          {item.file && (
                            <div className="completion-attachment">
                              <label>Attachment:</label>
                              <a 
                                href={`${STORAGE_URL}/${item.file}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="download-link"
                              >
                                <FontAwesomeIcon icon={faDownload} />
                                Download File
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data-message">
                      <FontAwesomeIcon icon={faHistory} />
                      <p>No completion history available for this task</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {activeTab === "completion" && (
                <button 
                  className="submit-complete-btn" 
                  onClick={handleSubmitCompletion} 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Submit Completion
                    </>
                  )}
                </button>
              )}
              <button className="close-modal-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpAssignTasks;