import React, { useState } from 'react';
import './ModuleDetailsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faInfoCircle,
  faTasks,
  faComments,
  faUser,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faExclamationCircle,
  faPaperclip,
  faPaperPlane,
  faSmile,
  faThumbsUp,
  faComment,
  faUserPlus,
  faFlag,
  faCheck,
  faPlus,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';

const ModuleDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');

  // Dummy Module Data
  const moduleData = {
    id: 1,
    name: "User Authentication & Authorization",
    description: "Implement secure authentication system with JWT tokens, role-based access control, and session management for the entire platform.",
    status: "in-progress",
    priority: "high",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    progress: 67,
    createdBy: "John Doe",
    createdAt: "2024-01-10",
    lastUpdated: "2024-02-01"
  };

  // Dummy Team Members
  const teamMembers = [
    { id: 1, name: "John Doe", role: "Project Manager", avatar: "JD", status: "online", email: "john@example.com" },
    { id: 2, name: "Jane Smith", role: "Lead Developer", avatar: "JS", status: "busy", email: "jane@example.com" },
    { id: 3, name: "Mike Johnson", role: "Frontend Developer", avatar: "MJ", status: "online", email: "mike@example.com" },
    { id: 4, name: "Sarah Wilson", role: "QA Engineer", avatar: "SW", status: "offline", email: "sarah@example.com" },
    { id: 5, name: "Tom Brown", role: "DevOps", avatar: "TB", status: "online", email: "tom@example.com" }
  ];

  // Dummy Tasks with Subtasks
  const [tasks, setTasks] = useState({
    todo: [
      {
        id: 1,
        title: "Design login page UI",
        description: "Create responsive login page with validation",
        assignee: { name: "Jane Smith", avatar: "JS" },
        priority: "high",
        dueDate: "2024-02-05",
        subtasks: [
          { id: 101, title: "Create wireframe", completed: true },
          { id: 102, title: "Design high-fidelity mockup", completed: true },
          { id: 103, title: "Get approval from client", completed: false }
        ]
      },
      {
        id: 2,
        title: "Implement JWT authentication",
        description: "Set up JWT token generation and validation",
        assignee: { name: "Mike Johnson", avatar: "MJ" },
        priority: "medium",
        dueDate: "2024-02-07",
        subtasks: [
          { id: 201, title: "Install JWT library", completed: true },
          { id: 202, title: "Create token generation service", completed: false },
          { id: 203, title: "Implement token validation middleware", completed: false }
        ]
      },
      {
        id: 3,
        title: "Create registration form",
        description: "User registration with email verification",
        assignee: { name: "Sarah Wilson", avatar: "SW" },
        priority: "medium",
        dueDate: "2024-02-08",
        subtasks: [
          { id: 301, title: "Design form UI", completed: true },
          { id: 302, title: "Implement form validation", completed: false },
          { id: 303, title: "Connect to backend API", completed: false }
        ]
      }
    ],
    inProgress: [
      {
        id: 4,
        title: "Password reset functionality",
        description: "Implement forgot password and reset password flow",
        assignee: { name: "John Doe", avatar: "JD" },
        priority: "high",
        dueDate: "2024-02-03",
        subtasks: [
          { id: 401, title: "Create reset request endpoint", completed: true },
          { id: 402, title: "Implement email service", completed: true },
          { id: 403, title: "Create reset password form", completed: false },
          { id: 404, title: "Add security questions", completed: false }
        ]
      },
      {
        id: 5,
        title: "Role-based access control",
        description: "Implement RBAC for different user roles",
        assignee: { name: "Jane Smith", avatar: "JS" },
        priority: "high",
        dueDate: "2024-02-06",
        subtasks: [
          { id: 501, title: "Define role permissions", completed: true },
          { id: 502, title: "Create role management UI", completed: false },
          { id: 503, title: "Implement permission checks", completed: false }
        ]
      }
    ],
    done: [
      {
        id: 6,
        title: "Project setup",
        description: "Initialize project structure and dependencies",
        assignee: { name: "Tom Brown", avatar: "TB" },
        priority: "low",
        dueDate: "2024-01-20",
        subtasks: [
          { id: 601, title: "Create project repository", completed: true },
          { id: 602, title: "Setup development environment", completed: true },
          { id: 603, title: "Configure linting", completed: true }
        ]
      },
      {
        id: 7,
        title: "Database schema design",
        description: "Design user and authentication tables",
        assignee: { name: "Mike Johnson", avatar: "MJ" },
        priority: "medium",
        dueDate: "2024-01-25",
        subtasks: [
          { id: 701, title: "Create ER diagram", completed: true },
          { id: 702, title: "Write migration scripts", completed: true },
          { id: 703, title: "Setup database indexes", completed: true }
        ]
      }
    ]
  });

  // Dummy Messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: { name: "John Doe", avatar: "JD", role: "Project Manager" },
      message: "We need to complete the authentication module by Friday. Let's focus on the remaining tasks.",
      time: "10:30 AM",
      date: "2024-02-01",
      likes: 3
    },
    {
      id: 2,
      user: { name: "Jane Smith", avatar: "JS", role: "Lead Developer" },
      message: "I've completed the JWT implementation. Ready for review.",
      time: "11:45 AM",
      date: "2024-02-01",
      likes: 5
    },
    {
      id: 3,
      user: { name: "Mike Johnson", avatar: "MJ", role: "Frontend Developer" },
      message: "The login page UI is ready. I'll start working on the registration form tomorrow.",
      time: "02:15 PM",
      date: "2024-02-01",
      likes: 2
    },
    {
      id: 4,
      user: { name: "Sarah Wilson", avatar: "SW", role: "QA Engineer" },
      message: "I've started testing the authentication endpoints. Found a few issues that need fixing.",
      time: "03:30 PM",
      date: "2024-02-01",
      likes: 1
    }
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        user: { name: "Current User", avatar: "CU", role: "Team Member" },
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        likes: 0
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  const handleToggleSubtask = (taskId, subtaskId, column) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              )
            }
          : task
      )
    }));
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      case 'not-started': return 'status-not-started';
      default: return 'status-not-started';
    }
  };

  const getSubtaskProgress = (subtasks) => {
    const completed = subtasks.filter(st => st.completed).length;
    return { completed, total: subtasks.length, percentage: (completed / subtasks.length) * 100 };
  };

  const TaskCard = ({ task, column, onToggleSubtask }) => {
    const progress = getSubtaskProgress(task.subtasks);
    
    return (
      <div className="task-card">
        <div className="task-card-header">
          <h4 className="task-title">{task.title}</h4>
          <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
            <FontAwesomeIcon icon={faFlag} />
            {task.priority}
          </span>
        </div>
        
        <p className="task-description">{task.description}</p>
        
        <div className="task-assignee">
          <div className="assignee-avatar small">
            {task.assignee.avatar}
          </div>
          <span>{task.assignee.name}</span>
        </div>
        
        <div className="task-due-date">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        
        <div className="subtasks-section">
          <div className="subtasks-header">
            <span>Subtasks ({progress.completed}/{progress.total})</span>
            <div className="subtask-progress-bar">
              <div 
                className="subtask-progress-fill"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="subtasks-list">
            {task.subtasks.map(subtask => (
              <label key={subtask.id} className="subtask-item">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => onToggleSubtask(task.id, subtask.id, column)}
                />
                <span className={subtask.completed ? 'completed' : ''}>
                  {subtask.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="module-details-page">
      {/* Header */}
      <div className="module-header">
        <div className="header-top">
          <button className="back-button" onClick={() => window.history.back()}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Modules
          </button>
          <div className="header-actions">
            <button className="icon-button">
              <FontAwesomeIcon icon={faUserPlus} />
            </button>
            <button className="icon-button">
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
          </div>
        </div>
        
        <div className="header-content">
          <div className="module-title-section">
            <h1 className="module-title">{moduleData.name}</h1>
            <div className="module-badges">
              <span className={`module-status ${getStatusColor(moduleData.status)}`}>
                {moduleData.status.replace('-', ' ')}
              </span>
              <span className={`priority-badge ${getPriorityColor(moduleData.priority)}`}>
                <FontAwesomeIcon icon={faFlag} />
                {moduleData.priority} priority
              </span>
            </div>
          </div>
          
          <p className="module-description">{moduleData.description}</p>
          
          <div className="module-meta">
            <div className="meta-item">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{new Date(moduleData.startDate).toLocaleDateString()} - {new Date(moduleData.endDate).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <FontAwesomeIcon icon={faUser} />
              <span>Created by: {moduleData.createdBy}</span>
            </div>
          </div>
          
          <div className="progress-section">
            <div className="progress-labels">
              <span>Overall Progress</span>
              <span className="progress-percentage">{moduleData.progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${moduleData.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <FontAwesomeIcon icon={faTasks} />
          Tasks
        </button>
        <button 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <FontAwesomeIcon icon={faComments} />
          Messages
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Module Details */}
              <div className="info-card">
                <h3 className="card-title">Module Details</h3>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">Module ID:</span>
                    <span className="detail-value">MOD-{moduleData.id.toString().padStart(3, '0')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created At:</span>
                    <span className="detail-value">{new Date(moduleData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">{new Date(moduleData.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time Remaining:</span>
                    <span className="detail-value">14 days</span>
                  </div>
                </div>
              </div>
              
              {/* Progress Stats */}
              <div className="info-card">
                <h3 className="card-title">Progress Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">67%</div>
                    <div className="stat-label">Overall Progress</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">3/7</div>
                    <div className="stat-label">Tasks Completed</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">12/25</div>
                    <div className="stat-label">Subtasks Completed</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">5</div>
                    <div className="stat-label">Team Members</div>
                  </div>
                </div>
              </div>
              
              {/* Team Members */}
              <div className="info-card full-width">
                <h3 className="card-title">
                  <FontAwesomeIcon icon={faUser} />
                  Team Members
                </h3>
                <div className="team-members-grid">
                  {teamMembers.map(member => (
                    <div key={member.id} className="team-member-card">
                      <div className="member-avatar">
                        {member.avatar}
                        <span className={`status-indicator ${member.status}`}></span>
                      </div>
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{member.role}</div>
                        <div className="member-email">{member.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tasks Tab - Kanban Board */}
        {activeTab === 'tasks' && (
          <div className="tasks-tab">
            <div className="kanban-board">
              {/* Todo Column */}
              <div className="kanban-column">
                <div className="column-header">
                  <h3>
                    <span className="column-dot todo"></span>
                    To Do
                  </h3>
                  <span className="task-count">{tasks.todo.length}</span>
                </div>
                <div className="column-content">
                  {tasks.todo.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      column="todo"
                      onToggleSubtask={handleToggleSubtask}
                    />
                  ))}
                  <button className="add-task-btn">
                    <FontAwesomeIcon icon={faPlus} />
                    Add Task
                  </button>
                </div>
              </div>
              
              {/* In Progress Column */}
              <div className="kanban-column">
                <div className="column-header">
                  <h3>
                    <span className="column-dot in-progress"></span>
                    In Progress
                  </h3>
                  <span className="task-count">{tasks.inProgress.length}</span>
                </div>
                <div className="column-content">
                  {tasks.inProgress.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      column="inProgress"
                      onToggleSubtask={handleToggleSubtask}
                    />
                  ))}
                  <button className="add-task-btn">
                    <FontAwesomeIcon icon={faPlus} />
                    Add Task
                  </button>
                </div>
              </div>
              
              {/* Done Column */}
              <div className="kanban-column">
                <div className="column-header">
                  <h3>
                    <span className="column-dot done"></span>
                    Done
                  </h3>
                  <span className="task-count">{tasks.done.length}</span>
                </div>
                <div className="column-content">
                  {tasks.done.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      column="done"
                      onToggleSubtask={handleToggleSubtask}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="messages-tab">
            <div className="chat-container">
              <div className="messages-list">
                {messages.map(message => (
                  <div key={message.id} className="message-item">
                    <div className="message-avatar">
                      {message.user.avatar}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <div className="message-user">
                          <span className="user-name">{message.user.name}</span>
                          <span className="user-role">{message.user.role}</span>
                        </div>
                        <div className="message-time">
                          {message.time}
                        </div>
                      </div>
                      <div className="message-text">
                        {message.message}
                      </div>
                      <div className="message-actions">
                        <button className="message-action-btn">
                          <FontAwesomeIcon icon={faThumbsUp} />
                          {message.likes}
                        </button>
                        <button className="message-action-btn">
                          <FontAwesomeIcon icon={faComment} />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="chat-input-area">
                <div className="input-actions">
                  <button className="input-action-btn">
                    <FontAwesomeIcon icon={faPaperclip} />
                  </button>
                  <button className="input-action-btn">
                    <FontAwesomeIcon icon={faSmile} />
                  </button>
                </div>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Write a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="send-btn" onClick={handleSendMessage}>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleDetailsPage;