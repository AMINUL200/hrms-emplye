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
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContex";
import { toast } from "react-toastify";

const AssignedProject = () => {
  const { token, data: userData } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api_url}/permission-wise-project`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          t: Date.now(), // prevent caching
        },
      });
      console.log("Permission-wise projects data:", res.data);

      if (res.data.status === 1) {
        // Extract projects from the response
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
    // navigate(`/organization/workspace/${project.id}`, {
    //   state: { project: project }
    // });
    window.open(`/organization/workspace/${project.id}`, "_blank");
  };

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
      </div>

      <div className="projects-grid">
        {projects.map((project) => {
          const daysRemaining = getDaysRemaining(project.project_end_date);
          const progress = getProgressPercentage(project.project_start_date, project.project_end_date);
          const isOverdue = daysRemaining === "Overdue";

          return (
            <div className="project-card" key={project.id}>
              <div className="card-header">
                <div className={`status-badge ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  <span>{project.status || "Open"}</span>
                </div>
                <div className="project-identifier">
                  <FontAwesomeIcon icon={faBuilding} />
                  <span>{project.identifier}</span>
                </div>
              </div>

              <div className="card-content">
                <h3 className="project-title" title={project.title}>
                  {project.title}
                </h3>
                
                {/* <div className="project-code">
                  <span className="code-label">Project ID:</span>
                  <span className="code-value">{project.emid}</span>
                </div> */}

                <p className="project-description">
                  {project.description || "No description available"}
                </p>

                <div className="project-dates">
                  <div className="date-item">
                    <FontAwesomeIcon icon={faCalendarDays} />
                    <span>
                      Start: <strong>{formatDate(project.project_start_date)}</strong>
                    </span>
                  </div>
                  <div className="date-item">
                    <FontAwesomeIcon icon={faCalendarDays} />
                    <span>
                      End: <strong>{formatDate(project.project_end_date)}</strong>
                    </span>
                  </div>
                </div>

                {/* {progress !== null && (
                  <div className="project-progress">
                    <div className="progress-header">
                      <span className="progress-label">Project Progress</span>
                      <span className={`progress-value ${isOverdue ? "overdue" : ""}`}>
                        {daysRemaining}
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar ${isOverdue ? "overdue" : ""}`}
                        style={{ width: `${progress}%` }}
                      >
                        <span className="progress-percentage">{progress}%</span>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>

              <div className="card-footer">
                <div className="created-info">
                  <FontAwesomeIcon icon={faUser} />
                  <span>
                    Created: <strong>ID {project.createdBy}</strong>
                  </span>
                </div>
                <div 
                  className="view-project"
                  onClick={(e) => handleViewProject(project, e)}
                >
                  <span>View Project</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignedProject;