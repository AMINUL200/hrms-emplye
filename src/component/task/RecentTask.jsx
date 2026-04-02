import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks,
  faFlag,
  faUser,
  faCalendarAlt,
  faComment,
  faCheckCircle,
  faClock,
  faSpinner,
  faExclamationTriangle,
  faEye,
  faFilter,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import "./RecentTask.css";

const RecentTask = () => {
  // Sample data - replace with actual API data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      taskName: "Project Task Section",
      taskDescription:
        "PROJECT OVERVIEW: Ahmed Holy Properties will be a fully dynamic property service platform offering comprehensive real estate solutions including property listings, virtual tours, and online booking systems. This platform will revolutionize how properties are bought and sold in the digital age.",
      priority: "High",
      assigner: "Shamim",
      startDate: "2026-03-31",
      endDate: "2026-03-02",
      status: "Incomplete",
      comment: "Waiting for design approval",
      projectName: "SponicHR - Web Version",
    },
    {
      id: 2,
      taskName: "Database Schema Design",
      taskDescription:
        "Design the complete database schema for user management, property listings, and transaction history. Includes ER diagrams and relationships between entities.",
      priority: "High",
      assigner: "Rahul",
      startDate: "2026-03-25",
      endDate: "2026-04-05",
      status: "In Progress",
      comment: "Working on relationships",
      projectName: "SponicHR - Web Version",
    },
    {
      id: 3,
      taskName: "API Integration",
      taskDescription:
        "Integrate REST APIs for payment gateway and third-party services including Stripe, PayPal, and email notifications.",
      priority: "Medium",
      assigner: "Priya",
      startDate: "2026-03-28",
      endDate: "2026-04-10",
      status: "In Progress",
      comment: "API documentation in progress",
      projectName: "Hubers Law Website",
    },
    {
      id: 4,
      taskName: "UI/UX Design Review",
      taskDescription:
        "Review and finalize the UI/UX designs for all pages including dashboard, user profile, and admin panels.",
      priority: "Low",
      assigner: "Amit",
      startDate: "2026-03-20",
      endDate: "2026-03-30",
      status: "Completed",
      comment: "Design approved",
      projectName: "SponicHR - Web Version",
    },
    {
      id: 5,
      taskName: "Testing & Debugging",
      taskDescription:
        "Comprehensive testing of all modules and bug fixing. Includes unit testing, integration testing, and user acceptance testing.",
      priority: "High",
      assigner: "Michael",
      startDate: "2026-04-01",
      endDate: "2026-04-15",
      status: "Incomplete",
      comment: "Test cases being written",
      projectName: "SWC Global",
    },
    {
      id: 6,
      taskName: "Documentation",
      taskDescription:
        "Create technical documentation and user manuals for the entire system including API documentation.",
      priority: "Low",
      assigner: "Sarah",
      startDate: "2026-03-15",
      endDate: "2026-03-25",
      status: "Completed",
      comment: "Documentation complete",
      projectName: "Hubers Law",
    },
    {
      id: 7,
      taskName: "Security Implementation",
      taskDescription:
        "Implement JWT authentication, role-based access control, and data encryption for sensitive information.",
      priority: "High",
      assigner: "John",
      startDate: "2026-04-05",
      endDate: "2026-04-20",
      status: "Incomplete",
      comment: "Planning phase",
      projectName: "SponicHR - Web Version",
    },
    {
        id: 8,
        taskName: "Performance Optimization",
        taskDescription:
          "Optimize database queries, implement caching strategies, and improve overall system performance.",
        priority: "Medium",
        assigner: "Emily",
        startDate: "2026-04-10",
        endDate: "2026-04-25",
        status: "In Progress",
        comment: "Identifying bottlenecks",
        projectName: "One More Rep",
    },
    {
        id: 9,
        taskName: "Deployment",
        taskDescription:
          "Deploy the application to the production environment and ensure all services are running correctly.",
        priority: "High",
        assigner: "David",
        startDate: "2026-04-20",
        endDate: "2026-04-30",
        status: "Incomplete",
        comment: "Preparing for deployment",
        projectName: "One More Rep",

    },
  ]);

  // Filter states
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  //   const itemsPerPage = 5;

  // Sort tasks by status priority
  const sortedTasks = [...tasks].sort((a, b) => {
    const statusOrder = {
      Incomplete: 1,
      "In Progress": 2,
      Completed: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Apply filters
  const filteredTasks = sortedTasks.filter((task) => {
    const priorityMatch =
      filterPriority === "All" || task.priority === filterPriority;
    const statusMatch = filterStatus === "All" || task.status === filterStatus;
    return priorityMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  // Get page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Incomplete":
        return "status-incomplete";
      case "In Progress":
        return "status-progress";
      case "Completed":
        return "status-completed";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Incomplete":
        return faExclamationTriangle;
      case "In Progress":
        return faSpinner;
      case "Completed":
        return faCheckCircle;
      default:
        return faClock;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const truncateDescription = (description, maxLength = 50) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  const handleViewDescription = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const resetFilters = () => {
    setFilterPriority("All");
    setFilterStatus("All");
    setCurrentPage(1);
  };

  return (
    <div className="recent-task-container">
      <div className="recent-task-header">
        <div className="header-title">
          <FontAwesomeIcon icon={faTasks} className="title-icon" />
          <h2>Recent Tasks</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => {
              setFilterPriority(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All</option>
            <option value="Incomplete">Incomplete</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {(filterPriority !== "All" || filterStatus !== "All") && (
          <button className="reset-btn" onClick={resetFilters}>
            <FontAwesomeIcon icon={faTimes} /> Reset Filters
          </button>
        )}

        <div className="result-count">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="recent-task-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Task Name</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Assigner</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTasks.length > 0 ? (
              currentTasks.map((task, index) => (
                <tr
                  key={task.id}
                  className={`task-row ${getStatusClass(task.status)}`}
                >
                  <td className="sl-no">{indexOfFirstItem + index + 1}</td>
                  <td className="task-name">
                    <div className="task-name-wrapper">
                      <strong>{task.taskName}</strong>
                      <small className="project-ref">{task.projectName}</small>
                    </div>
                  </td>
                  <td className="task-description">
                    <div className="description-wrapper">
                      {truncateDescription(task.taskDescription, 50)}
                      {task.taskDescription.length > 50 && (
                        <button
                          className="read-more-btn"
                          onClick={() => handleViewDescription(task)}
                        >
                          Read More
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="priority-cell">
                    <span
                      className={`priority-badge ${getPriorityClass(task.priority)}`}
                    >
                      <FontAwesomeIcon
                        icon={faFlag}
                        className="priority-icon"
                      />
                      {task.priority}
                    </span>
                  </td>
                  <td className="assigner-cell">
                    <div className="assigner-wrapper">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="assigner-icon"
                      />
                      {task.assigner}
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-wrapper">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="date-icon"
                      />
                      {formatDate(task.startDate)}
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-wrapper">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="date-icon"
                      />
                      {formatDate(task.endDate)}
                    </div>
                  </td>
                  <td className="status-cell">
                    <span
                      className={`status-badge ${getStatusClass(task.status)}`}
                    >
                      <FontAwesomeIcon
                        icon={getStatusIcon(task.status)}
                        className="status-icon"
                      />
                      {task.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewDescription(task)}
                    >
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="empty-state">
                  No tasks found matching the filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* Pagination */}
      {totalPages > 0 && (
        <div className="pagination-section">
          <div className="pagination-left">
            <div className="pagination-info">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredTasks.length)} of{" "}
              {filteredTasks.length} tasks
            </div>
            <div className="per-page-selector">
              <label>Show per page:</label>
              <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="pagination-controls">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="page-btn"
            >
              <FontAwesomeIcon icon={faAngleDoubleLeft} />
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="page-btn"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              <FontAwesomeIcon icon={faAngleDoubleRight} />
            </button>
          </div>
        </div>
      )}

      {/* Modal for full description */}
      {showModal && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedTask.taskName}</h3>
              <button className="modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Project:</label>
                <span>{selectedTask.projectName}</span>
              </div>
              <div className="modal-field">
                <label>Description:</label>
                <p>{selectedTask.taskDescription}</p>
              </div>
              <div className="modal-field">
                <label>Priority:</label>
                <span
                  className={`priority-badge ${getPriorityClass(selectedTask.priority)}`}
                >
                  {selectedTask.priority}
                </span>
              </div>
              <div className="modal-field">
                <label>Status:</label>
                <span
                  className={`status-badge ${getStatusClass(selectedTask.status)}`}
                >
                  {selectedTask.status}
                </span>
              </div>
              <div className="modal-field">
                <label>Assigner:</label>
                <span>{selectedTask.assigner}</span>
              </div>
              <div className="modal-field">
                <label>Start Date:</label>
                <span>{formatDate(selectedTask.startDate)}</span>
              </div>
              <div className="modal-field">
                <label>End Date:</label>
                <span>{formatDate(selectedTask.endDate)}</span>
              </div>
              <div className="modal-field">
                <label>Comment:</label>
                <span>{selectedTask.comment}</span>
              </div>
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

export default RecentTask;
