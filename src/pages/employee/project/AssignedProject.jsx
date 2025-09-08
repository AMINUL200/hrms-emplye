import React, { useContext, useState, useEffect } from 'react';
import './AssignedProject.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEllipsis, 
  faCalendarDays, 
  faUser, 
  faTasks,
  faArrowRight,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContex';
import { toast } from 'react-toastify';

const AssignedProject = () => {
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api_url}/project-list`, {
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (res.data.status === 1) {
        setProjects(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch projects');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while fetching projects');
      console.error('Error fetching projects:', error);
      toast.error(error.message || 'An error occurred while fetching projects')
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => 
      task.task_status === 'Completed' || task.task_status === 'Resolved'
    ).length;
    
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getDaysUntilDeadline = (dateString) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = Math.abs(deadline - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
              <div className="skeleton-description"></div>
              <div className="skeleton-stats"></div>
              <div className="skeleton-progress"></div>
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
        <h2>My Projects</h2>
       
      </div>
      
      <div className="projects-grid">
        {projects.map((project) => {
          const progress = calculateProgress(project.tasks);
          const totalTasks = project.tasks?.length || 0;
          const completedTasks = project.tasks?.filter(task => 
            task.task_status === 'Completed' || task.task_status === 'Resolved'
          ).length || 0;
          
          const hasDeadline = project.tasks && project.tasks.length > 0 && project.tasks[0].expected_end_date;
          const daysUntilDeadline = hasDeadline ? 
            getDaysUntilDeadline(project.tasks[0].expected_end_date) : null;
          
          return (
            <div
              className="project-card"
              key={project.project_id}
              onClick={() => navigate(`/organization/assigned-project/${project.project_id}`)}
            >
              <div className="card-header">
                <span className={`status-badge ${project.project_status}`}>
                  {project.project_status}
                </span>
                
              </div>
              
              <div className="card-content">
                <h3 className="project-title" title={project.project_title}>
                  {project.project_title}
                </h3>
                <p className="project-code">{project.project_code}</p>
                
                <p className="project-description">
                  {project.project_description || "No description available"}
                </p>
                
                <div className="project-stats">
                  <div className="stat-item">
                    <FontAwesomeIcon icon={faTasks} />
                    <span>{completedTasks}/{totalTasks} tasks</span>
                  </div>
                  
                  {hasDeadline && (
                    <div className={`stat-item ${daysUntilDeadline <= 3 ? 'urgent' : ''}`}>
                      <FontAwesomeIcon icon={daysUntilDeadline <= 3 ? faClock : faCalendarDays} />
                      <span>{formatDate(project.tasks[0].expected_end_date)}</span>
                    </div>
                  )}
                </div>
                
                <div className="progress-container">
                  <div className="progress-labels">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${progress < 30 ? 'low' : progress < 70 ? 'medium' : 'high'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer">
                <div className="role-info">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Role: <strong>{project.project_role}</strong></span>
                </div>
                <div className="view-project">
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