import React, { useState, useEffect } from 'react';
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
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons';

const AssignedModule = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project;

  // Dummy modules data
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);

  // Check if user has permission to assign employees (you can add logic based on user role)
  const hasAssignPermission = true; // Replace with actual permission check
  
  // Check if user has permission to create modules
  const hasCreateModulePermission = true; // Replace with actual permission check

  // Dummy modules array of objects
  const dummyModules = [
    {
      module_id: 1,
      module_name: "User Authentication & Authorization",
      module_description: "Implement login, registration, password reset, and role-based access control system with JWT tokens.",
      module_status: "in-progress",
      priority: "high",
      start_date: "2024-01-15",
      expected_end_date: "2024-02-15",
      completed_tasks: 8,
      total_tasks: 12,
      assigned_team_members: 4,
      assigned_employees: [
        { id: 1, name: "John Doe", role: "Developer", status: "active" },
        { id: 2, name: "Jane Smith", role: "Tester", status: "active" }
      ],
      tasks: [
        { task_id: 101, task_name: "Design login UI", task_status: "Completed" },
        { task_id: 102, task_name: "Implement JWT authentication", task_status: "Completed" },
        { task_id: 103, task_name: "Create registration form", task_status: "Completed" },
        { task_id: 104, task_name: "Password reset functionality", task_status: "In Progress" },
        { task_id: 105, task_name: "Role-based access control", task_status: "Pending" },
        { task_id: 106, task_name: "Session management", task_status: "Pending" },
        { task_id: 107, task_name: "Two-factor authentication", task_status: "Pending" },
        { task_id: 108, task_name: "OAuth integration", task_status: "Pending" },
        { task_id: 109, task_name: "API security testing", task_status: "Pending" },
        { task_id: 110, task_name: "User profile management", task_status: "Pending" },
        { task_id: 111, task_name: "Activity logging", task_status: "Pending" },
        { task_id: 112, task_name: "Documentation", task_status: "Pending" }
      ]
    },
    {
      module_id: 2,
      module_name: "Dashboard & Analytics",
      module_description: "Create interactive dashboard with charts, graphs, and real-time analytics for project metrics and KPIs.",
      module_status: "in-progress",
      priority: "medium",
      start_date: "2024-01-20",
      expected_end_date: "2024-02-28",
      completed_tasks: 5,
      total_tasks: 10,
      assigned_team_members: 3,
      assigned_employees: [
        { id: 3, name: "Mike Johnson", role: "Frontend Developer", status: "active" }
      ],
      tasks: [
        { task_id: 201, task_name: "Design dashboard layout", task_status: "Completed" },
        { task_id: 202, task_name: "Implement charts using Chart.js", task_status: "Completed" },
        { task_id: 203, task_name: "Create KPI widgets", task_status: "Completed" },
        { task_id: 204, task_name: "Real-time data updates", task_status: "Completed" },
        { task_id: 205, task_name: "Export reports", task_status: "Completed" },
        { task_id: 206, task_name: "User activity tracking", task_status: "In Progress" },
        { task_id: 207, task_name: "Performance optimization", task_status: "Pending" },
        { task_id: 208, task_name: "Mobile responsive design", task_status: "Pending" },
        { task_id: 209, task_name: "Custom widget builder", task_status: "Pending" },
        { task_id: 210, task_name: "Analytics API integration", task_status: "Pending" }
      ]
    },
    {
      module_id: 3,
      module_name: "Task Management System",
      module_description: "Complete task management system with CRUD operations, task assignment, status tracking, and notifications.",
      module_status: "not-started",
      priority: "high",
      start_date: "2024-02-01",
      expected_end_date: "2024-03-15",
      completed_tasks: 0,
      total_tasks: 15,
      assigned_team_members: 0,
      assigned_employees: [],
      tasks: [
        { task_id: 301, task_name: "Design task board UI", task_status: "Pending" },
        { task_id: 302, task_name: "Create task model", task_status: "Pending" },
        { task_id: 303, task_name: "Implement task CRUD", task_status: "Pending" },
        { task_id: 304, task_name: "Task assignment feature", task_status: "Pending" },
        { task_id: 305, task_name: "Status update system", task_status: "Pending" },
        { task_id: 306, task_name: "Due date tracking", task_status: "Pending" },
        { task_id: 307, task_name: "Comment system", task_status: "Pending" },
        { task_id: 308, task_name: "File attachments", task_status: "Pending" },
        { task_id: 309, task_name: "Task dependencies", task_status: "Pending" },
        { task_id: 310, task_name: "Email notifications", task_status: "Pending" },
        { task_id: 311, task_name: "Task search & filter", task_status: "Pending" },
        { task_id: 312, task_name: "Bulk operations", task_status: "Pending" },
        { task_id: 313, task_name: "Task templates", task_status: "Pending" },
        { task_id: 314, task_name: "Activity log", task_status: "Pending" },
        { task_id: 315, task_name: "API documentation", task_status: "Pending" }
      ]
    },
    {
      module_id: 4,
      module_name: "Notification Service",
      module_description: "Real-time notification system for email, SMS, and in-app notifications with customizable preferences.",
      module_status: "completed",
      priority: "low",
      start_date: "2024-01-10",
      expected_end_date: "2024-02-10",
      completed_tasks: 8,
      total_tasks: 8,
      assigned_team_members: 2,
      assigned_employees: [
        { id: 4, name: "Sarah Wilson", role: "Backend Developer", status: "active" },
        { id: 5, name: "Tom Brown", role: "DevOps", status: "active" }
      ],
      tasks: [
        { task_id: 401, task_name: "Design notification schema", task_status: "Completed" },
        { task_id: 402, task_name: "Implement email service", task_status: "Completed" },
        { task_id: 403, task_name: "Implement SMS service", task_status: "Completed" },
        { task_id: 404, task_name: "In-app notifications", task_status: "Completed" },
        { task_id: 405, task_name: "User preferences", task_status: "Completed" },
        { task_id: 406, task_name: "Notification templates", task_status: "Completed" },
        { task_id: 407, task_name: "Queue management", task_status: "Completed" },
        { task_id: 408, task_name: "Testing & documentation", task_status: "Completed" }
      ]
    },
    {
      module_id: 5,
      module_name: "Reporting Engine",
      module_description: "Generate comprehensive reports for projects, tasks, team performance, and resource utilization.",
      module_status: "in-progress",
      priority: "medium",
      start_date: "2024-02-05",
      expected_end_date: "2024-03-20",
      completed_tasks: 3,
      total_tasks: 11,
      assigned_team_members: 3,
      assigned_employees: [
        { id: 6, name: "Emily Davis", role: "Data Analyst", status: "active" }
      ],
      tasks: [
        { task_id: 501, task_name: "Report templates", task_status: "Completed" },
        { task_id: 502, task_name: "PDF generation", task_status: "Completed" },
        { task_id: 503, task_name: "Excel export", task_status: "Completed" },
        { task_id: 504, task_name: "Schedule reports", task_status: "In Progress" },
        { task_id: 505, task_name: "Custom report builder", task_status: "Pending" },
        { task_id: 506, task_name: "Data visualization", task_status: "Pending" },
        { task_id: 507, task_name: "Report sharing", task_status: "Pending" },
        { task_id: 508, task_name: "Archiving system", task_status: "Pending" },
        { task_id: 509, task_name: "Performance metrics", task_status: "Pending" },
        { task_id: 510, task_name: "API for reports", task_status: "Pending" },
        { task_id: 511, task_name: "Documentation", task_status: "Pending" }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call with dummy data
    setTimeout(() => {
      setModules(dummyModules);
      setLoading(false);
    }, 1000);
  }, [projectId]);

  const getModuleProgress = (module) => {
    if (module.total_tasks === 0) return 0;
    return Math.round((module.completed_tasks / module.total_tasks) * 100);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'not-started':
        return 'status-not-started';
      default:
        return 'status-not-started';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return faCheckCircle;
      case 'in-progress':
        return faPlayCircle;
      case 'not-started':
        return faPauseCircle;
      default:
        return faClock;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    // Navigate to task details page with module info
    navigate(`/organization/assigned-project/${projectId}/module/${module.module_id}/tasks`, {
      state: { 
        project: project,
        module: module 
      }
    });
  };

  const handleAssignEmployee = (module, e) => {
    e.stopPropagation(); // Prevent triggering the card click
    // Navigate with module_id and add=false (edit mode)
    navigate(`/organization/emp-assigned-module/${module.module_id}?add=false`, {
      state: { 
        project: project,
        module: module,
        isEditMode: true
      }
    });
  };

  const handleAddModule = () => {
    // Navigate with add=true parameter for creating new module
    // Use 0 or 'new' as ID for new module creation
    navigate(`/organization/emp-assigned-module/new?add=true`, {
      state: { 
        project: project,
        isAddMode: true
      }
    });
  };

  const handleBackToProjects = () => {
    navigate('/organization/assigned-project');
  };

  if (loading) {
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

  return (
    <div className="assigned-module-container">
      <div className="module-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBackToProjects}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Projects</span>
          </button>
          
          {/* Add Module Button */}
          {hasCreateModulePermission && (
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
              <span className="summary-number">{modules.length}</span>
              <span className="summary-label">Total Modules</span>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faCheckCircle} />
            <div>
              <span className="summary-number">
                {modules.filter(m => m.module_status === 'completed').length}
              </span>
              <span className="summary-label">Completed</span>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faChartLine} />
            <div>
              <span className="summary-number">
                {Math.round((modules.filter(m => m.module_status === 'completed').length / modules.length) * 100)}%
              </span>
              <span className="summary-label">Overall Progress</span>
            </div>
          </div>
        </div>
      </div>

      <div className="modules-grid">
        {modules.map((module) => {
          const progress = getModuleProgress(module);
          const daysRemaining = getDaysRemaining(module.expected_end_date);
          const isUrgent = daysRemaining <= 7 && module.module_status !== 'completed';
          
          return (
            <div
              className="module-card"
              key={module.module_id}
              onClick={() => handleModuleClick(module)}
            >
              <div className="module-card-header">
                <div className="module-badges">
                  <span className={`module-status ${getStatusColor(module.module_status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(module.module_status)} />
                    {module.module_status.replace('-', ' ')}
                  </span>
                  <span className={`module-priority ${getPriorityColor(module.priority)}`}>
                    {module.priority} priority
                  </span>
                </div>
                
                {/* Assign Employee Button */}
                {hasAssignPermission && (
                  <button 
                    className="assign-employee-btn"
                    onClick={(e) => handleAssignEmployee(module, e)}
                    title="Assign employee to this module"
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span>Assign</span>
                  </button>
                )}
              </div>

              <div className="module-card-content">
                <h3 className="module-name">{module.module_name}</h3>
                <p className="module-description">{module.module_description}</p>
                
                <div className="module-stats">
                  <div className="stat-item">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>{module.completed_tasks}/{module.total_tasks} tasks</span>
                  </div>
                  <div className="stat-item">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{module.assigned_team_members} members</span>
                  </div>
                  <div className={`stat-item ${isUrgent ? 'urgent' : ''}`}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{formatDate(module.expected_end_date)}</span>
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
                <div className="view-tasks">
                  <span>View Tasks</span>
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

export default AssignedModule;