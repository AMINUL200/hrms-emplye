import React, { useContext, useState, useEffect } from "react";
import "./AssignedProject.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faUser,
  faTasks,
  faArrowRight,
  faEye,
  faClock,
  faBuilding,
  faCheckCircle,
  faExclamationCircle,
  faEllipsisV,
  faTrash,
  faPlus,
  faEdit,
  faUsers,
  faClipboardList,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContex";
import { toast } from "react-toastify";

// Description Popup Component
const DescriptionPopup = ({ description, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content description-popup" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Project Description</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body description-body">
          <div 
            className="full-description"
            dangerouslySetInnerHTML={{ __html: description || "No description available" }}
          />
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignedProject = () => {
  const { token, data: userData } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const navigate = useNavigate();

  // Check if user has specific permission for a project
  const hasPermission = (project, permissionName) => {
    if (!project.roles || project.roles.length === 0) return false;

    return project.roles.some(
      (role) =>
        role.permissions &&
        role.permissions.some(
          (permission) => permission.name === permissionName,
        ),
    );
  };

  // Check if user has create permission on any project (for global create button)
  const hasAnyCreatePermission = () => {
    return projects.some((project) => hasPermission(project, "create_project"));
  };

  // Fetch projects data
  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api_url}/permission-wise-project`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          t: Date.now(),
        },
      });
      console.log("Permission-wise projects data:", res.data);

      if (res.data.status === 1) {
        const projectList = res.data.data || [];
        setProjects(projectList);
        setTotalProjects(projectList.length);
      } else {
        setError(res.data.message || "Failed to fetch projects");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while fetching projects",
      );
      console.error("Error fetching projects:", error);
      toast.error(error.message || "An error occurred while fetching projects");
    } finally {
      setLoading(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (project) => {
    try {
      const response = await axios.delete(
        `${api_url}/projects/${project.project.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.status === 1) {
        toast.success("Project deleted successfully");
        fetchProjectsData(); // Refresh the list
        setDeleteConfirm(null);
        setMenuOpen(null);
      } else {
        toast.error(response.data.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting project",
      );
    }
  };

  // Navigate to edit project page
  const handleEditProject = (project) => {
    navigate(`/organization/create-project?update=${project.project.id}`, {
      state: { project: project.project },
    });
  }; 

  const handleCreateModule = (project) => {
    console.log("Navigating to create module for project:", project);
    navigate(`/organization/emp-add-module/${project.project.id}?type=module`, {
      state: { project: project.project },
    });
  }

  // Navigate to create project page
  const handleCreateProject = () => {
    navigate("/organization/create-project");
  };

  // Navigate to master roll page
  const handleMasterRoll = () => {
    navigate("/organization/master-roll");
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "status-open";
      case "in-progress":
      case "inprogress":
        return "status-progress";
      case "completed":
        return "status-completed";
      case "on-hold":
        return "status-hold";
      default:
        return "status-open";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return <FontAwesomeIcon icon={faClock} />;
      case "in-progress":
      case "inprogress":
        return <FontAwesomeIcon icon={faTasks} />;
      case "completed":
        return <FontAwesomeIcon icon={faCheckCircle} />;
      default:
        return <FontAwesomeIcon icon={faExclamationCircle} />;
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    return `${diffDays} days left`;
  };

  const getProgressPercentage = (startDate, endDate) => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (today < start) return 0;
    if (today > end) return 100;

    const totalDuration = end - start;
    const elapsed = today - start;
    const percentage = (elapsed / totalDuration) * 100;

    return Math.min(Math.max(Math.round(percentage), 0), 100);
  };

  // Handle view project click
  const handleViewProject = (project, e) => {
    e.stopPropagation();
    window.open(`/organization/workspace/${project.project.id}`, "_blank");
  };

  // Toggle menu for a specific project
  const toggleMenu = (projectId, e) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === projectId ? null : projectId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="assigned-projects-container">
        <div className="projects-header">
          <h2>My Projects</h2>
        </div>
        <div className="projects-grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="project-card-skeleton" key={item}>
              <div className="skeleton-header">
                <div className="skeleton-badge"></div>
              </div>
              <div className="skeleton-title"></div>
              <div className="skeleton-code"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-description-short"></div>
              <div className="skeleton-dates"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assigned-projects-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Projects</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchProjectsData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="assigned-projects-container">
        {hasAnyCreatePermission() && (
          <div className="projects-header">
            <div className="header-left">
              <h2>My Projects</h2>
              <div className="header-buttons">
                <button className="master-roll-btn" onClick={handleMasterRoll}>
                  <FontAwesomeIcon icon={faClipboardList} />
                  <span>Master Roll</span>
                </button>
                <button
                  className="create-project-btn"
                  onClick={handleCreateProject}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create Project</span>
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No projects assigned</h3>
          <p>You don't have any projects assigned to you yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assigned-projects-container">
      <div className="projects-header">
        <div className="header-left">
          <h2>My Projects</h2>
          {totalProjects > 0 && (
            <div className="projects-summary">
              <div className="total-projects">{totalProjects} Projects</div>
            </div>
          )}
        </div>
        {hasAnyCreatePermission() && (
          <div className="header-buttons">
            <button className="master-roll-btn" onClick={handleMasterRoll}>
              <FontAwesomeIcon icon={faClipboardList} />
              <span>Master Roll</span>
            </button>
            <button
              className="create-project-btn"
              onClick={handleCreateProject}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Create Project</span>
            </button>
          </div>
        )}
      </div>

      <div className="projects-grid">
        {projects.map((item) => {
          const project = item.project;
          const daysRemaining = getDaysRemaining(project.project_end_date);
          const progress = getProgressPercentage(
            project.project_start_date,
            project.project_end_date,
          );
          const isOverdue = daysRemaining === "Overdue";
          const canDelete = hasPermission(item, "delete_project");
          const canUpdate = hasPermission(item, "update_project");
          const canCreateModule = hasPermission(item, "create_module");

          // Check if description is long enough to need "See More"
          const descriptionText = project.description || "No description available";
          const needsSeeMore = descriptionText.length > 100 || 
            (descriptionText.match(/<[^>]+>/g) || []).length > 3;

          return (
            <div className="project-card" key={project.id}>
              <div className="card-header">
                <div
                  className={`status-badge ${getStatusColor(project.status)}`}
                >
                  {getStatusIcon(project.status)}
                  <span>{project.status || "Open"}</span>
                </div>
                <div className="header-right-actions">
                  <div className="project-identifier">
                    <FontAwesomeIcon icon={faBuilding} />
                    <span>{project.identifier}</span>
                  </div>
                  
                  <div className="card-menu-container">
                    <button
                      className="menu-trigger"
                      onClick={(e) => toggleMenu(project.id, e)}
                    >
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </button>
                    {menuOpen === project.id && (
                      <div
                        className="menu-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canUpdate && (
                          <button
                            className="menu-item edit"
                            onClick={() => handleEditProject(item)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            <span>Edit Project</span>
                          </button>
                        )}
                        {canCreateModule && (
                        <button
                          className="menu-item edit"
                          onClick={() => handleCreateModule(item)}
                        >
                          <FontAwesomeIcon icon={faLayerGroup} />
                          <span>Create Module</span>
                        </button>
                        )}

                        {canDelete && (
                          <button
                            className="menu-item delete"
                            onClick={() => setDeleteConfirm(item)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            <span>Delete Project</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-content">
                <h3 className="project-title" title={project.title}>
                  {project.title}
                </h3>

                <div className="project-description-wrapper">
                  <p className="project-description" dangerouslySetInnerHTML={{__html: descriptionText}} />
                  {needsSeeMore && (
                    <button 
                      className="see-more-btn"
                      onClick={() => setSelectedDescription(descriptionText)}
                    >
                      See More
                    </button>
                  )}
                </div>

                <div className="project-dates">
                  <div className="date-item">
                    <FontAwesomeIcon icon={faCalendarDays} />
                    <span>
                      Start:{" "}
                      <strong>{formatDate(project.project_start_date)}</strong>
                    </span>
                  </div>
                  <div className="date-item">
                    <FontAwesomeIcon icon={faCalendarDays} />
                    <span>
                      End:{" "}
                      <strong>{formatDate(project.project_end_date)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="created-info">
                  <FontAwesomeIcon icon={faUser} />
                  <span>
                    Created by: <strong>ID {project.createdBy}</strong>
                  </span>
                </div>
                <div
                  className="view-project"
                  onClick={(e) => handleViewProject(item, e)}
                >
                  <span>View Project</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Description Popup */}
      {selectedDescription && (
        <DescriptionPopup 
          description={selectedDescription} 
          onClose={() => setSelectedDescription(null)} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Project</h3>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the project{" "}
                <strong>"{deleteConfirm.project.title}"</strong>?
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="modal-btn delete"
                onClick={() => handleDeleteProject(deleteConfirm)}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedProject;