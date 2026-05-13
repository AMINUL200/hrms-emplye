import React, { useState, useEffect, useContext } from 'react';
import './EmpAdminViewTask.css';
import { useParams } from 'react-router-dom';
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
  faFolder,
  faUsers,
  faCalendarAlt,
  faUser,
  faFile,
  faComment,
  faInfoCircle,
  faHistory,
  faDownload,
  faFilter,
  faChevronDown,
  faUserCheck,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/AuthContex';

const EmpAdminViewTask = () => {
  const { projectId } = useParams();
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;

  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalActiveTab, setModalActiveTab] = useState('overview');

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${api_url}/admin-task-check/${projectId}`,
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
    }
  };

  // Fetch subtasks from API
  const fetchSubtasks = async () => {
    try {
      const response = await axios.get(
        `${api_url}/admin-sub-task-check/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        setSubtasks(response.data.data || []);
      } else {
        toast.error("Failed to fetch subtasks");
      }
    } catch (err) {
      console.error("Error fetching subtasks:", err);
      toast.error(err.response?.data?.message || "Failed to load subtasks");
    }
  };

  useEffect(() => {
    if (token && projectId) {
      Promise.all([fetchTasks(), fetchSubtasks()]).finally(() => {
        setLoading(false);
      });
    }
  }, [token, projectId]);

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

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  const getAssignmentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'assignment-completed';
      case 'assigned':
        return 'assignment-assigned';
      default:
        return 'assignment-pending';
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

  const getHierarchyPath = (item) => {
    const path = [];
    if (item.top_parent_title) {
      path.push({ type: item.top_parent_type, title: item.top_parent_title });
    }
    if (item.grand_parent_title) {
      path.push({ type: item.grand_parent_type, title: item.grand_parent_title });
    }
    if (item.parent_title) {
      path.push({ type: item.parent_type, title: item.parent_title });
    }
    return path;
  };

  const filteredItems = () => {
    const items = activeTab === 'tasks' ? tasks : subtasks;
    return items.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setModalActiveTab('overview');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalActiveTab('overview');
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => t.status === 'open').length;
  const completedTasksCount = tasks.filter(t => {
    const hasCompletedEmployees = t.employees?.some(emp => emp.assignment_status === 'completed');
    return hasCompletedEmployees;
  }).length;

  const totalSubtasks = subtasks.length;
  const openSubtasks = subtasks.filter(s => s.status === 'open').length;
  const completedSubtasksCount = subtasks.filter(s => {
    const hasCompletedEmployees = s.employees?.some(emp => emp.assignment_status === 'completed');
    return hasCompletedEmployees;
  }).length;

  if (loading) {
    return (
      <div className="admin-view-container">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
          <p>Loading tasks and subtasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-view-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Task Management</h1>
          <p className="admin-subtitle">Monitor and track all tasks and subtasks across the project</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faTasks} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{totalTasks + totalSubtasks}</span>
            <span className="stat-label">Total Items</span>
          </div>
        </div>
        <div className="stat-card open">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{openTasks + openSubtasks}</span>
            <span className="stat-label">Open</span>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{completedTasksCount + completedSubtasksCount}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card assigned">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-info">
            <span className="stat-number">-</span>
            <span className="stat-label">Active Assignments</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <FontAwesomeIcon icon={faTasks} />
          Tasks ({tasks.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'subtasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('subtasks')}
        >
          <FontAwesomeIcon icon={faList} />
          Subtasks ({subtasks.length})
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="status-filters">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'open' ? 'active' : ''}`}
            onClick={() => setFilterStatus('open')}
          >
            Open
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'in_progress' ? 'active' : ''}`}
            onClick={() => setFilterStatus('in_progress')}
          >
            In Progress
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems().length === 0 ? (
        <div className="no-items">
          <FontAwesomeIcon icon={activeTab === 'tasks' ? faTasks : faList} className="no-items-icon" />
          <h3>No {activeTab} Found</h3>
          <p>{searchTerm ? "No items match your search criteria" : `No ${activeTab} available`}</p>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems().map((item) => (
            <div 
              key={item.id} 
              className="item-card"
              onClick={() => handleItemClick(item)}
            >
              <div className="item-card-header">
                <div className="item-type">
                  <FontAwesomeIcon icon={activeTab === 'tasks' ? faTasks : faList} />
                  <span className="type-badge">{activeTab === 'tasks' ? 'Task' : 'Subtask'}</span>
                </div>
                <div className={`status-badge ${getStatusColor(item.status)}`}>
                  <FontAwesomeIcon icon={getStatusIcon(item.status)} />
                  <span>{item.status}</span>
                </div>
              </div>

              <div className="item-card-content">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">
                  {item.description || "No description provided"}
                </p>
              </div>

              <div className="item-card-footer">
                <div className="employee-count">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>{item.employees?.length || 0} Employees</span>
                </div>
                <div className="completed-count">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>
                    {item.employees?.filter(emp => emp.assignment_status === 'completed').length || 0} Completed
                  </span>
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

      {/* Modal with Tabs */}
      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FontAwesomeIcon icon={activeTab === 'tasks' ? faTasks : faList} />
                {selectedItem.title}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="modal-tab-navigation">
              <button 
                className={`modal-tab-btn ${modalActiveTab === 'overview' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('overview')}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                Overview
              </button>
              <button 
                className={`modal-tab-btn ${modalActiveTab === 'employees' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('employees')}
              >
                <FontAwesomeIcon icon={faUsers} />
                Assigned Employees ({selectedItem.employees?.length || 0})
              </button>
              <button 
                className={`modal-tab-btn ${modalActiveTab === 'submissions' ? 'active' : ''}`}
                onClick={() => setModalActiveTab('submissions')}
              >
                <FontAwesomeIcon icon={faHistory} />
                Submission Details
              </button>
            </div>

            <div className="modal-body">
              {/* Overview Tab */}
              {modalActiveTab === 'overview' && (
                <div className="modal-tab-content">
                  <div className="detail-section">
                    <h3>Task Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Type:</label>
                        <span className="type-badge">{activeTab === 'tasks' ? 'Task' : 'Subtask'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        <span className={`status-badge ${getStatusColor(selectedItem.status)}`}>
                          {selectedItem.status}
                        </span>
                      </div>
                      <div className="detail-item full-width">
                        <label>Description:</label>
                        <p>{selectedItem.description || "No description provided"}</p>
                      </div>
                      {selectedItem.start_date && (
                        <div className="detail-item">
                          <label>Start Date:</label>
                          <span>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            {formatDate(selectedItem.start_date)}
                          </span>
                        </div>
                      )}
                      {selectedItem.end_date && (
                        <div className="detail-item">
                          <label>End Date:</label>
                          <span>
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            {formatDate(selectedItem.end_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hierarchy Information */}
                  {getHierarchyPath(selectedItem).length > 0 && (
                    <div className="detail-section">
                      <h3>Hierarchy Information</h3>
                      <div className="hierarchy-tree">
                        {getHierarchyPath(selectedItem).map((node, index) => (
                          <React.Fragment key={index}>
                            <div className="hierarchy-node">
                              <div className="hierarchy-icon">
                                <FontAwesomeIcon 
                                  icon={
                                    node.type === 'module' ? faLayerGroup :
                                    node.type === 'submodule' ? faFolder : faTasks
                                  } 
                                />
                              </div>
                              <div className="hierarchy-content">
                                <div className="hierarchy-label">
                                  {node.type === 'module' ? 'Module' : 
                                   node.type === 'submodule' ? 'Submodule' : 'Parent Task'}
                                </div>
                                <div className="hierarchy-value">{node.title}</div>
                                <div className="hierarchy-type">{node.type}</div>
                              </div>
                            </div>
                            {index < getHierarchyPath(selectedItem).length - 1 && (
                              <div className="hierarchy-arrow">
                                <FontAwesomeIcon icon={faSitemap} />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary Statistics */}
                  <div className="detail-section">
                    <h3>Summary</h3>
                    <div className="summary-stats">
                      <div className="summary-stat">
                        <div className="summary-icon">
                          <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div>
                          <div className="summary-number">{selectedItem.employees?.length || 0}</div>
                          <div className="summary-label">Total Assigned</div>
                        </div>
                      </div>
                      <div className="summary-stat">
                        <div className="summary-icon completed-icon">
                          <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <div>
                          <div className="summary-number">
                            {selectedItem.employees?.filter(emp => emp.assignment_status === 'completed').length || 0}
                          </div>
                          <div className="summary-label">Completed</div>
                        </div>
                      </div>
                      <div className="summary-stat">
                        <div className="summary-icon pending-icon">
                          <FontAwesomeIcon icon={faClock} />
                        </div>
                        <div>
                          <div className="summary-number">
                            {selectedItem.employees?.filter(emp => emp.assignment_status === 'assigned').length || 0}
                          </div>
                          <div className="summary-label">In Progress</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Employees Tab */}
              {modalActiveTab === 'employees' && (
                <div className="modal-tab-content">
                  {selectedItem.employees && selectedItem.employees.length > 0 ? (
                    <div className="employees-table-wrapper">
                      <table className="employees-table">
                        <thead>
                          <tr>
                            <th>Employee Name</th>
                            <th>Employee ID</th>
                            <th>Status</th>
                            <th>Assigned At</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedItem.employees.map((employee, index) => (
                            <tr key={index}>
                              <td>
                                <div className="employee-cell">
                                  <div className="employee-avatar-small">
                                    {employee.employee_name?.charAt(0) || 'U'}
                                  </div>
                                  <span>{employee.employee_name}</span>
                                </div>
                              </td>
                              <td>{employee.employee_id}</td>
                              <td>
                                <span className={`assignment-status ${getAssignmentStatusColor(employee.assignment_status)}`}>
                                  {employee.assignment_status}
                                </span>
                              </td>
                              <td>{formatDate(employee.assigned_at)}</td>
                              <td>{employee.submitted_at ? formatDate(employee.submitted_at) : 'Not submitted'}</td>
                              <td>
                                {employee.submission_file && (
                                  <a 
                                    href={`${STORAGE_URL}/${employee.submission_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="action-link"
                                    title="Download Submission"
                                  >
                                    <FontAwesomeIcon icon={faDownload} />
                                  </a>
                                )}
                                {employee.submission_remarks && (
                                  <button 
                                    className="action-link"
                                    onClick={() => toast.info(employee.submission_remarks)}
                                    title="View Remarks"
                                  >
                                    <FontAwesomeIcon icon={faComment} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="no-data-message">
                      <FontAwesomeIcon icon={faUsers} />
                      <p>No employees assigned to this {activeTab === 'tasks' ? 'task' : 'subtask'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Submission Details Tab */}
              {modalActiveTab === 'submissions' && (
                <div className="modal-tab-content">
                  {selectedItem.employees?.some(emp => emp.assignment_status === 'completed') ? (
                    <div className="submissions-list">
                      {selectedItem.employees
                        .filter(emp => emp.assignment_status === 'completed')
                        .map((employee, index) => (
                          <div key={index} className="submission-item">
                            <div className="submission-header">
                              <div className="employee-info">
                                <div className="employee-avatar-small">
                                  {employee.employee_name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <strong>{employee.employee_name}</strong>
                                  <div className="employee-id-text">{employee.employee_id}</div>
                                </div>
                              </div>
                              <div className="submission-date">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                {formatDate(employee.submitted_at)}
                              </div>
                            </div>
                            
                            {employee.submission_remarks && (
                              <div className="submission-remarks">
                                <label>Remarks:</label>
                                <p>{employee.submission_remarks}</p>
                              </div>
                            )}
                            
                            {employee.submission_file && (
                              <div className="submission-attachment">
                                <label>Attachment:</label>
                                <a 
                                  href={`${STORAGE_URL}/${employee.submission_file}`}
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
                      <p>No submission details available for this {activeTab === 'tasks' ? 'task' : 'subtask'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
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

export default EmpAdminViewTask;