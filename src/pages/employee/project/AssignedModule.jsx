import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './AssignedModule.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faLayerGroup, 
  faCheckCircle, 
  faClock, 
  faChartLine,
  faUsers,
  faCalendarAlt,
  faArrowRight,
  faExclamationCircle,
  faPlayCircle,
  faPauseCircle,
  faUserPlus,
  faUserCheck,
  faPlusCircle,
  faSpinner,
  faEllipsisV,
  faEdit,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContex';
import { toast } from 'react-toastify';

const AssignedModule = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project;
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [totalModules, setTotalModules] = useState(0);
  const [permissions, setPermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Permission states
  const [canCreateModule, setCanCreateModule] = useState(false);
  const [canViewModule, setCanViewModule] = useState(false);
  const [canUpdateModule, setCanUpdateModule] = useState(false);
  const [canDeleteModule, setCanDeleteModule] = useState(false);
  const [canAssignEmployee, setCanAssignEmployee] = useState(false);

  // Fetch permissions from API
  const fetchPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const response = await axios.get(
        `${api_url}/project-permission/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        const permissionsList = response.data.permissions || [];
        setPermissions(permissionsList);
        
        // Check module-related permissions
        const hasCreateModule = permissionsList.some(p => p.permission_name === 'create_module');
        const hasViewModule = permissionsList.some(p => p.permission_name === 'view_module');
        const hasUpdateModule = permissionsList.some(p => p.permission_name === 'update_module');
        const hasDeleteModule = permissionsList.some(p => p.permission_name === 'delete_module');
        
        setCanCreateModule(hasCreateModule);
        setCanViewModule(hasViewModule);
        setCanUpdateModule(hasUpdateModule);
        setCanDeleteModule(hasDeleteModule);
        
        // For assign employee - you might have a separate permission or use update_module
        setCanAssignEmployee(hasUpdateModule);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      // Set default permissions to false if API fails
      setCanCreateModule(false);
      setCanViewModule(true); // Default to true for viewing
      setCanUpdateModule(false);
      setCanDeleteModule(false);
      setCanAssignEmployee(false);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Fetch modules from API
  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${api_url}/project-emp-module/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        setModules(response.data.modules || []);
        setTotalModules(response.data.total_modules || 0);
      } else {
        setError('Failed to fetch modules');
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err.response?.data?.message || 'Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && token) {
      fetchPermissions();
      fetchModules();
    }
  }, [projectId, token]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.module-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const getModuleProgress = (module) => {
    if (module.completed_tasks !== undefined && module.total_tasks !== undefined) {
      if (module.total_tasks === 0) return 0;
      return Math.round((module.completed_tasks / module.total_tasks) * 100);
    }
    
    switch(module.status) {
      case 'completed':
      case 'closed':
        return 100;
      case 'in-progress':
        return 50;
      case 'new':
      default:
        return 0;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'closed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'new':
        return 'status-not-started';
      default:
        return 'status-not-started';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'closed':
        return faCheckCircle;
      case 'in-progress':
        return faPlayCircle;
      case 'new':
        return faPauseCircle;
      default:
        return faClock;
    }
  };

  const getDisplayStatus = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'Completed';
      case 'closed':
        return 'Closed';
      case 'in-progress':
        return 'In Progress';
      case 'new':
        return 'Not Started';
      default:
        return status || 'Not Started';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleModuleClick = (module) => {
    // Check if user has view permission
    if (canViewModule) {
      setSelectedModule(module);
      navigate(`/organization/assigned-project/${projectId}/module/${module.id}/tasks`, {
        state: { 
          project: project,
          module: module 
        }
      });
    }
  };

  const handleAssignEmployee = (module, e) => {
    e.stopPropagation();
    if (canAssignEmployee) {
      navigate(`/organization/emp-assigned-module/${projectId}/${module.id}`, {
        state: { 
          project: project,
          module: module,
          isEditMode: true
        }
      });
    }
  };

  const handleAddModule = () => {
    if (canCreateModule) {
      navigate(`/organization/emp-add-module/${projectId}?add=true`, {
        state: { 
          project: project,
          isAddMode: true
        }
      });
    }
  };

  const handleEditModule = (module, e) => {
    e.stopPropagation();
    if (canUpdateModule) {
      setOpenMenuId(null);
      navigate(`/organization/emp-add-module/${projectId}?add=false&updateid=${module.id}`, {
        state: { 
          project: project,
          module: module,
          isEditMode: true
        }
      });
    }
  };

  const handleDeleteModule = async (module, e) => {
    e.stopPropagation();
    if (!canDeleteModule) return;
    
    if (window.confirm(`Are you sure you want to delete module "${module.module_name}"? This action cannot be undone.`)) {
      try {
        const response = await axios.delete(
          `${api_url}/project-module-delete/${module.id}/${projectId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.status === 1) {
          toast.success('Module deleted successfully!');
          // Refresh modules list
          fetchModules();
        } else {
          toast.error(response.data.message || 'Failed to delete module');
        }
      } catch (err) {
        console.error('Error deleting module:', err);
        toast.error(err.response?.data?.message || 'Failed to delete module');
      }
    }
    setOpenMenuId(null);
  };

  const handleBackToProjects = () => {
    navigate('/organization/assigned-project');
  };

  const toggleMenu = (moduleId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === moduleId ? null : moduleId);
  };

  // Calculate summary statistics
  const getCompletedModulesCount = () => {
    return modules.filter(m => m.status?.toLowerCase() === 'completed' || m.status?.toLowerCase() === 'closed').length;
  };

  const getOverallProgress = () => {
    if (modules.length === 0) return 0;
    return Math.round((getCompletedModulesCount() / modules.length) * 100);
  };

  if (loading || permissionsLoading) {
    return (
      <div className="assigned-module-container">
        <div className="module-header">
          <button className="back-button" onClick={handleBackToProjects}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Projects</span>
          </button>
          <div className="header-skeleton">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
        </div>
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
          <p>Loading modules...</p>
        </div>
        <div className="modules-grid">
          {[1, 2, 3, 4, 5].map((item) => (
            <div className="module-card-skeleton" key={item}>
              <div className="skeleton-header">
                <div className="skeleton-badge"></div>
                <div className="skeleton-badge-small"></div>
              </div>
              <div className="skeleton-module-title"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-stats">
                <div className="skeleton-stat"></div>
                <div className="skeleton-stat"></div>
              </div>
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
      <div className="assigned-module-container">
        <div className="module-header">
          <button className="back-button" onClick={handleBackToProjects}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Projects</span>
          </button>
        </div>
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
          <h3>Error Loading Modules</h3>
          <p>{error}</p>
          <button onClick={fetchModules} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assigned-module-container">
      <div className="module-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBackToProjects}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Projects</span>
          </button>
          
          {/* Add Module Button - Only show if user has create permission */}
          {canCreateModule && (
            <button className="add-module-btn" onClick={handleAddModule}>
              <FontAwesomeIcon icon={faPlusCircle} />
              <span>Add New Module</span>
            </button>
          )}
        </div>
        
        <div className="project-info">
          <h1 className="project-title-header">
            {project?.project_title || "Project Modules"}
          </h1>
          {project && (
            <p className="project-code-header">{project.project_code}</p>
          )}
        </div>
        
        <div className="modules-summary">
          <div className="summary-card">
            <FontAwesomeIcon icon={faLayerGroup} />
            <div>
              <span className="summary-number">{totalModules || modules.length}</span>
              <span className="summary-label">Total Modules</span>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faCheckCircle} />
            <div>
              <span className="summary-number">{getCompletedModulesCount()}</span>
              <span className="summary-label">Completed</span>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faChartLine} />
            <div>
              <span className="summary-number">{getOverallProgress()}%</span>
              <span className="summary-label">Overall Progress</span>
            </div>
          </div>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="no-modules-container">
          <FontAwesomeIcon icon={faLayerGroup} className="no-modules-icon" />
          <h3>No Modules Found</h3>
          <p>This project doesn't have any modules yet.</p>
          {canCreateModule && (
            <button className="add-module-btn" onClick={handleAddModule}>
              <FontAwesomeIcon icon={faPlusCircle} />
              <span>Create First Module</span>
            </button>
          )}
        </div>
      ) : (
        <div className="modules-grid">
          {modules.map((module) => {
            const progress = getModuleProgress(module);
            const daysRemaining = getDaysRemaining(module.end_date);
            const isUrgent = daysRemaining !== null && daysRemaining <= 7 && module.status?.toLowerCase() !== 'completed' && module.status?.toLowerCase() !== 'closed';
            const hasEditDeletePermission = canUpdateModule || canDeleteModule;
            
            return (
              <div
                className={`module-card ${!canViewModule ? 'disabled-card' : ''}`}
                key={module.id}
                onClick={() => handleModuleClick(module)}
                style={{ cursor: canViewModule ? 'pointer' : 'default' }}
              >
                <div className="module-card-header">
                  <div className="module-badges">
                    <span className={`module-status ${getStatusColor(module.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(module.status)} />
                      {getDisplayStatus(module.status)}
                    </span>
                  </div>
                  
                  <div className="module-actions">
                    {/* Assign Employee Button - Only show if user has assign permission */}
                    {canAssignEmployee && (
                      <button 
                        className="assign-employee-btn"
                        onClick={(e) => handleAssignEmployee(module, e)}
                        title="Assign employee to this module"
                      >
                        <FontAwesomeIcon icon={faUserPlus} />
                        <span>Assign</span>
                      </button>
                    )}
                    
                    {/* Three Dots Menu for Edit/Delete - Only show if user has update or delete permission */}
                    {hasEditDeletePermission && (
                      <div className="module-menu-container">
                        <button 
                          className="menu-trigger-btn"
                          onClick={(e) => toggleMenu(module.id, e)}
                          title="Module options"
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                        
                        {openMenuId === module.id && (
                          <div className="module-dropdown-menu">
                            {canUpdateModule && (
                              <button 
                                className="menu-item edit-item"
                                onClick={(e) => handleEditModule(module, e)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                                <span>Edit Module</span>
                              </button>
                            )}
                            {canDeleteModule && (
                              <button 
                                className="menu-item delete-item"
                                onClick={(e) => handleDeleteModule(module, e)}
                              >
                                <FontAwesomeIcon icon={faTrashAlt} />
                                <span>Delete Module</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="module-card-content">
                  <h3 className="module-name">{module.module_name}</h3>
                  <p className="module-description">{module.description || "No description provided"}</p>
                  
                  <div className="module-stats">
                    {module.total_tasks !== undefined && (
                      <div className="stat-item">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>{module.completed_tasks || 0}/{module.total_tasks} tasks</span>
                      </div>
                    )}
                    {module.assigned_team_members !== undefined && (
                      <div className="stat-item">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{module.assigned_team_members} members</span>
                      </div>
                    )}
                    <div className={`stat-item ${isUrgent ? 'urgent' : ''}`}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Ends: {formatDate(module.end_date)}</span>
                    </div>
                  </div>

                  {isUrgent && (
                    <div className="urgent-warning">
                      <FontAwesomeIcon icon={faExclamationCircle} />
                      <span>{daysRemaining} days remaining</span>
                    </div>
                  )}
                </div>

                <div className="module-card-footer">
                  <div className="start-date">
                    <FontAwesomeIcon icon={faClock} />
                    <span>Started: {formatDate(module.start_date)}</span>
                  </div>
                  {canViewModule && (
                    <div className="view-tasks">
                      <span>View Tasks</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignedModule;