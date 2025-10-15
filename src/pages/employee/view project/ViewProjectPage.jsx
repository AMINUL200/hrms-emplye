import React, { useState } from 'react';
import './ViewProjectPage.css';
import { Paperclip } from 'lucide-react';

const ViewProjectPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [taskComment, setTaskComment] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  // Message enhancement states
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState('');
  const [messageAttachments, setMessageAttachments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  
  // Task menu states
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState(null);
  const [showStatusChangePopup, setShowStatusChangePopup] = useState(false);
  const [showMoveTaskPopup, setShowMoveTaskPopup] = useState(false);
  const [messagesEndRef, setMessagesEndRef] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  
  // Drag and drop states
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Sample project data
  const project = {
    title: "Website Redesign Project",
    description: "Complete overhaul of company website with modern design and improved user experience",
    status: "In Progress",
    deadline: "December 31, 2024",
    budget: "$50,000",
    startDate: "January 15, 2024",
    progress: 65
  };

  // Sample team members
  const teamMembers = [
    { id: 1, name: "John Doe", role: "Project Manager", email: "john@company.com" },
    { id: 2, name: "Jane Smith", role: "Frontend Developer", email: "jane@company.com" },
    { id: 3, name: "Mike Johnson", role: "Backend Developer", email: "mike@company.com" },
    { id: 4, name: "Sarah Wilson", role: "UI/UX Designer", email: "sarah@company.com" }
  ];

  // Sample tasks with enhanced data
  const [tasks, setTasks] = useState({
    todo: [
      {
        id: 1,
        title: "Create wireframes",
        description: "Design initial wireframes for homepage and inner pages",
        priority: "high",
        assignee: "Sarah Wilson",
        dueDate: "2024-02-15",
        createdDate: "2024-01-15",
        status: "todo",
        activities: [
          {
            id: 1,
            type: "created",
            user: "John Doe",
            timestamp: "2024-01-15 09:00",
            description: "Task created"
          },
          {
            id: 2,
            type: "assigned",
            user: "John Doe",
            timestamp: "2024-01-15 09:05",
            description: "Assigned to Sarah Wilson"
          }
        ],
        comments: [
          {
            id: 1,
            user: "Sarah Wilson",
            message: "I'll start working on this tomorrow. Need to review the requirements first.",
            timestamp: "2024-01-15 14:30",
            attachments: []
          }
        ]
      },
      {
        id: 2,
        title: "Set up development environment",
        description: "Configure React, Bootstrap, and development tools",
        priority: "medium",
        assignee: "Jane Smith",
        dueDate: "2024-02-20",
        createdDate: "2024-01-16",
        status: "todo",
        activities: [
          {
            id: 3,
            type: "created",
            user: "John Doe",
            timestamp: "2024-01-16 10:00",
            description: "Task created"
          }
        ],
        comments: []
      }
    ],
    progress: [
      {
        id: 3,
        title: "Database schema design",
        description: "Design and implement database structure with relationships",
        priority: "high",
        assignee: "Mike Johnson",
        dueDate: "2024-02-25",
        createdDate: "2024-01-14",
        status: "progress",
        activities: [
          {
            id: 4,
            type: "created",
            user: "John Doe",
            timestamp: "2024-01-14 08:00",
            description: "Task created"
          },
          {
            id: 5,
            type: "moved",
            user: "Mike Johnson",
            timestamp: "2024-01-20 11:00",
            description: "Moved to In Progress"
          }
        ],
        comments: [
          {
            id: 2,
            user: "Mike Johnson",
            message: "Started working on the database design. Here's the initial schema:",
            timestamp: "2024-01-20 11:15",
            attachments: [
              {
                id: 1,
                name: "database_schema.pdf",
                type: "pdf",
                size: "2.3 MB"
              }
            ]
          }
        ]
      }
    ],
    complete: [
      {
        id: 4,
        title: "Project planning",
        description: "Initial project scope, timeline, and resource allocation",
        priority: "low",
        assignee: "John Doe",
        dueDate: "2024-01-30",
        createdDate: "2024-01-10",
        status: "complete",
        activities: [
          {
            id: 6,
            type: "created",
            user: "John Doe",
            timestamp: "2024-01-10 09:00",
            description: "Task created"
          },
          {
            id: 7,
            type: "completed",
            user: "John Doe",
            timestamp: "2024-01-30 16:00",
            description: "Task completed"
          }
        ],
        comments: [
          {
            id: 3,
            user: "John Doe",
            message: "Project planning completed. All documents are ready for review.",
            timestamp: "2024-01-30 16:05",
            attachments: [
              {
                id: 2,
                name: "project_plan.docx",
                type: "word",
                size: "1.8 MB"
              },
              {
                id: 3,
                name: "timeline.xlsx",
                type: "excel",
                size: "0.5 MB"
              }
            ]
          }
        ]
      }
    ]
  });

  // Group messages with current user and enhanced features
  const currentUser = "You"; // This would come from auth context in real app
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: "John Doe", 
      content: "Welcome everyone! Let's make this project a great success. We have an exciting roadmap ahead.", 
      time: "10:00 AM",
      isCurrentUser: false,
      attachments: [],
      replies: [],
      isEdited: false,
      editedAt: null
    },
    { 
      id: 2, 
      sender: "Sarah Wilson", 
      content: "I'll have the initial designs ready by Friday. Looking forward to your feedback on the wireframes.", 
      time: "10:15 AM",
      isCurrentUser: false,
      attachments: [],
      replies: [],
      isEdited: false,
      editedAt: null
    },
    { 
      id: 3, 
      sender: "You", 
      content: "Thanks Sarah! I'll review them as soon as they're ready. Looking forward to seeing the new design direction.", 
      time: "10:20 AM",
      isCurrentUser: true,
      attachments: [],
      replies: [],
      isEdited: false,
      editedAt: null
    },
    { 
      id: 4, 
      sender: "Mike Johnson", 
      content: "The database architecture is coming along well. Should have the initial setup ready for review by next week.", 
      time: "11:30 AM",
      isCurrentUser: false,
      attachments: [
        {
          id: 1,
          name: "db_diagram.png",
          type: "image",
          size: "1.2 MB",
          url: "https://via.placeholder.com/300x200/0052cc/ffffff?text=Database+Diagram"
        }
      ],
      replies: [],
      isEdited: false,
      editedAt: null
    },
    { 
      id: 5, 
      sender: "You", 
      content: "Great work Mike! I've attached the updated requirements document for your reference.", 
      time: "11:45 AM",
      isCurrentUser: true,
      attachments: [
        {
          id: 2,
          name: "requirements_v2.pdf",
          type: "pdf",
          size: "3.1 MB"
        }
      ],
      replies: [
        {
          id: 1,
          sender: "Mike Johnson",
          content: "Thanks! I'll review this document and get back to you with any questions.",
          time: "11:50 AM",
          isCurrentUser: false
        }
      ],
      isEdited: false,
      editedAt: null
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Drag and drop handlers
  const handleDragStart = (e, taskId, sourceColumn) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    e.dataTransfer.setData('sourceColumn', sourceColumn);
    setDraggedTask({ id: taskId, sourceColumn });
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, columnName) => {
    e.preventDefault();
    setDragOverColumn(columnName);
  };

  const handleDragLeave = (e) => {
    // Only clear drag over if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    const sourceColumn = e.dataTransfer.getData('sourceColumn');

    if (sourceColumn === targetColumn) return;

    const taskToMove = tasks[sourceColumn].find(task => task.id === taskId);
    
    if (taskToMove) {
      // Create updated task with new status
      const updatedTask = {
        ...taskToMove,
        status: targetColumn
      };

      // Add activity log for the move
      const moveActivity = {
        id: Date.now(),
        type: "moved",
        user: currentUser,
        timestamp: new Date().toLocaleString(),
        description: `Moved to ${targetColumn === 'todo' ? 'To Do' : targetColumn === 'progress' ? 'In Progress' : 'Complete'}`
      };

      updatedTask.activities = [...updatedTask.activities, moveActivity];

      const updatedSourceTasks = tasks[sourceColumn].filter(task => task.id !== taskId);
      const updatedTargetTasks = [...tasks[targetColumn], updatedTask];
      
      setTasks({
        ...tasks,
        [sourceColumn]: updatedSourceTasks,
        [targetColumn]: updatedTargetTasks
      });
    }

    // Clear drag states
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Task popup handlers
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskPopup(true);
  };

  const handleCloseTaskPopup = () => {
    setShowTaskPopup(false);
    setSelectedTask(null);
    setTaskComment('');
    setAttachedFiles([]);
  };

  const handleAddTaskComment = () => {
    if (taskComment.trim() === '') return;

    const newComment = {
      id: Date.now(),
      user: currentUser,
      message: taskComment,
      timestamp: new Date().toLocaleString(),
      attachments: attachedFiles
    };

    // Update the task with new comment
    const updatedTasks = { ...tasks };
    const allTasks = [...updatedTasks.todo, ...updatedTasks.progress, ...updatedTasks.complete];
    const taskIndex = allTasks.findIndex(task => task.id === selectedTask.id);
    
    if (taskIndex !== -1) {
      const taskColumn = selectedTask.status === 'todo' ? 'todo' : 
                        selectedTask.status === 'progress' ? 'progress' : 'complete';
      
      const taskInColumn = updatedTasks[taskColumn].findIndex(task => task.id === selectedTask.id);
      if (taskInColumn !== -1) {
        updatedTasks[taskColumn][taskInColumn].comments.push(newComment);
        setTasks(updatedTasks);
        setSelectedTask({...selectedTask, comments: [...selectedTask.comments, newComment]});
      }
    }

    setTaskComment('');
    setAttachedFiles([]);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type.split('/')[1] || 'file',
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
      file: file
    }));
    setAttachedFiles([...attachedFiles, ...newFiles]);
  };

  // Enhanced message handlers
  const handleSendMessage = () => {
    if (newMessage.trim() === '' && messageAttachments.length === 0) return;

    const newMessageObj = {
      id: messages.length + 1,
      sender: currentUser,
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
      attachments: messageAttachments,
      replies: [],
      isEdited: false,
      editedAt: null,
      replyingTo: replyingTo
    };

    setMessages([...messages, newMessageObj]);
    setNewMessage('');
    setMessageAttachments([]);
    setReplyingTo(null);
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setEditMessageText(message.content);
  };

  const handleSaveEdit = () => {
    if (editMessageText.trim() === '') return;

    const updatedMessages = messages.map(msg => 
      msg.id === editingMessage.id 
        ? { 
            ...msg, 
            content: editMessageText, 
            isEdited: true, 
            editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        : msg
    );

    setMessages(updatedMessages);
    setEditingMessage(null);
    setEditMessageText('');
  };

  const handleDeleteMessage = (messageId) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
  };

  const handleAttachmentTypeSelect = (type) => {
    setSelectedAttachmentType(type);
    setShowAttachmentPopup(false);
    
    // Create file input for the selected type
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    if (type === 'image') {
      input.accept = 'image/*';
    } else if (type === 'document') {
      input.accept = '.pdf,.doc,.docx,.txt';
    } else if (type === 'file') {
      input.accept = '*';
    }
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      const newAttachments = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: type === 'image' ? 'image' : 
              file.name.endsWith('.pdf') ? 'pdf' :
              file.name.endsWith('.doc') || file.name.endsWith('.docx') ? 'word' :
              file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ? 'excel' : 'file',
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        file: file,
        url: type === 'image' ? URL.createObjectURL(file) : null
      }));
      
      setMessageAttachments([...messageAttachments, ...newAttachments]);
    };
    
    input.click();
  };

  const handleRemoveAttachment = (attachmentId) => {
    setMessageAttachments(messageAttachments.filter(att => att.id !== attachmentId));
  };

  // Task menu handlers
  const handleTaskMenuClick = (task, event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 5,
      right: window.innerWidth - rect.right
    });
    setSelectedTaskForMenu(task);
    setShowTaskMenu(true);
  };

  const handleCloseTaskMenu = () => {
    setShowTaskMenu(false);
    setSelectedTaskForMenu(null);
  };

  const handleStatusChangeClick = () => {
    setShowStatusChangePopup(true);
    setShowTaskMenu(false);
  };

  const handleMoveTaskClick = () => {
    setShowMoveTaskPopup(true);
    setShowTaskMenu(false);
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedTaskForMenu) return;

    const updatedTasks = { ...tasks };
    const currentColumn = selectedTaskForMenu.status;
    
    // Remove from current column
    const taskIndex = updatedTasks[currentColumn].findIndex(task => task.id === selectedTaskForMenu.id);
    if (taskIndex !== -1) {
      const taskToMove = updatedTasks[currentColumn][taskIndex];
      updatedTasks[currentColumn].splice(taskIndex, 1);
      
      // Add to new column
      const updatedTask = { ...taskToMove, status: newStatus };
      updatedTasks[newStatus].push(updatedTask);
      
      setTasks(updatedTasks);
    }
    
    setShowStatusChangePopup(false);
    setSelectedTaskForMenu(null);
  };

  const handleMoveTask = (position) => {
    if (!selectedTaskForMenu) return;

    const updatedTasks = { ...tasks };
    const currentColumn = selectedTaskForMenu.status;
    const currentIndex = updatedTasks[currentColumn].findIndex(task => task.id === selectedTaskForMenu.id);
    
    if (currentIndex !== -1) {
      const taskToMove = updatedTasks[currentColumn][currentIndex];
      updatedTasks[currentColumn].splice(currentIndex, 1);
      
      let newIndex;
      if (position === 'top') {
        newIndex = 0;
      } else if (position === 'bottom') {
        newIndex = updatedTasks[currentColumn].length;
      } else { // middle
        newIndex = Math.floor(updatedTasks[currentColumn].length / 2);
      }
      
      updatedTasks[currentColumn].splice(newIndex, 0, taskToMove);
      setTasks(updatedTasks);
    }
    
    setShowMoveTaskPopup(false);
    setSelectedTaskForMenu(null);
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  // Icons for navigation
  const getNavIcon = (tabName) => {
    switch (tabName) {
      case 'overview':
        return '📊';
      case 'tasks':
        return '✅';
      case 'messages':
        return '💬';
      default:
        return '🔗';
    }
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="overview-card">
                <h4>Project Details</h4>
                <div className="project-details">
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="status-badge">{project.status}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{project.startDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Deadline:</span>
                    <span className="detail-value">{project.deadline}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Budget:</span>
                    <span className="detail-value">{project.budget}</span>
                  </div>
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="detail-label">Progress:</span>
                      <span className="progress-percentage">{project.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h4>Team Members</h4>
                <div className="team-members">
                  {teamMembers.map(member => (
                    <div key={member.id} className="team-member">
                      <div className="member-avatar">
                        {getInitials(member.name)}
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

            <div className="project-stats">
              <div className="stat-item">
                <span className="stat-value">{tasks.todo.length}</span>
                <span className="stat-label">To Do Tasks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{tasks.progress.length}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{tasks.complete.length}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{teamMembers.length}</span>
                <span className="stat-label">Team Members</span>
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="tasks-content">
            <div className="task-board">
              {/* To Do Column */}
              <div 
                className={`task-column ${dragOverColumn === 'todo' ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, 'todo')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'todo')}
              >
                <div className="column-header todo-header">To Do ({tasks.todo.length})</div>
                {tasks.todo.map(task => (
                  <div
                    key={task.id}
                    className="task-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, 'todo')}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="task-header">
                      <div className="task-title">{task.title}</div>
                      <button 
                        className="task-menu-btn"
                        onClick={(e) => handleTaskMenuClick(task, e)}
                      >
                        ⋮
                      </button>
                    </div>
                    <div className="task-description">{task.description}</div>
                    <div className="task-meta">
                      <span>Assigned to: {task.assignee}</span>
                      <span className={`task-priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                    <small style={{color: '#6c757d'}}>Due: {task.dueDate}</small>
                    {task.comments.length > 0 && (
                      <div className="task-comments-count">
                        💬 {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* In Progress Column */}
              <div 
                className={`task-column ${dragOverColumn === 'progress' ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, 'progress')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'progress')}
              >
                <div className="column-header progress-header">In Progress ({tasks.progress.length})</div>
                {tasks.progress.map(task => (
                  <div
                    key={task.id}
                    className="task-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, 'progress')}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="task-header">
                      <div className="task-title">{task.title}</div>
                      <button 
                        className="task-menu-btn"
                        onClick={(e) => handleTaskMenuClick(task, e)}
                      >
                        ⋮
                      </button>
                    </div>
                    <div className="task-description">{task.description}</div>
                    <div className="task-meta">
                      <span>Assigned to: {task.assignee}</span>
                      <span className={`task-priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                    <small style={{color: '#6c757d'}}>Due: {task.dueDate}</small>
                    {task.comments.length > 0 && (
                      <div className="task-comments-count">
                        💬 {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Complete Column */}
              <div 
                className={`task-column ${dragOverColumn === 'complete' ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, 'complete')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'complete')}
              >
                <div className="column-header complete-header">Complete ({tasks.complete.length})</div>
                {tasks.complete.map(task => (
                  <div
                    key={task.id}
                    className="task-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, 'complete')}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="task-header">
                      <div className="task-title">{task.title}</div>
                      <button 
                        className="task-menu-btn"
                        onClick={(e) => handleTaskMenuClick(task, e)}
                      >
                        ⋮
                      </button>
                    </div>
                    <div className="task-description">{task.description}</div>
                    <div className="task-meta">
                      <span>Assigned to: {task.assignee}</span>
                      <span className={`task-priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                    <small style={{color: '#6c757d'}}>Due: {task.dueDate}</small>
                    {task.comments.length > 0 && (
                      <div className="task-comments-count">
                        💬 {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="messages-content">
            <div className="messages-container">
              <div className="messages-header">
                <h4>Group Messages</h4>
                <small>Team communication channel</small>
              </div>
              
              <div className="messages-list custom-scroll">
                {messages.map(message => (
                  <div key={message.id} className={`message ${message.isCurrentUser ? 'message-current-user' : 'message-other-user'}`}>
                    <div className="message-sender">
                      {message.sender}
                      <span className="message-time">
                        {message.time}
                        {message.isEdited && (
                          <span className="edited-indicator"> (edited)</span>
                        )}
                      </span>
                    </div>
                    
                    {message.replyingTo && (
                      <div className="reply-preview">
                        <div className="reply-sender">{message.replyingTo.sender}</div>
                        <div className="reply-content">{message.replyingTo.content}</div>
                      </div>
                    )}
                    
                    {editingMessage && editingMessage.id === message.id ? (
                      <div className="edit-message">
                        <textarea
                          value={editMessageText}
                          onChange={(e) => setEditMessageText(e.target.value)}
                          className="edit-textarea"
                        />
                        <div className="edit-actions">
                          <button onClick={handleSaveEdit} className="save-edit-btn">Save</button>
                          <button onClick={() => setEditingMessage(null)} className="cancel-edit-btn">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="message-content">{message.content}</div>
                    )}
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="message-attachments">
                        {message.attachments.map(attachment => (
                          <div key={attachment.id} className="attachment-item">
                            {attachment.type === 'image' ? (
                              <div className="image-preview">
                                <img src={attachment.url} alt={attachment.name} />
                                <div className="image-overlay">
                                  <span className="image-name">{attachment.name}</span>
                                  <span className="image-size">{attachment.size}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="file-attachment">
                                <span className="attachment-icon">
                                  {attachment.type === 'pdf' ? '📄' : 
                                   attachment.type === 'word' ? '📝' : 
                                   attachment.type === 'excel' ? '📊' : '📎'}
                                </span>
                                <span className="attachment-name">{attachment.name}</span>
                                <span className="attachment-size">{attachment.size}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.replies && message.replies.length > 0 && (
                      <div className="message-replies">
                        {message.replies.map(reply => (
                          <div key={reply.id} className="reply-item">
                            <div className="reply-sender">{reply.sender}</div>
                            <div className="reply-content">{reply.content}</div>
                            <div className="reply-time">{reply.time}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="message-actions">
                      <button 
                        className="action-btn reply-btn"
                        onClick={() => handleReplyToMessage(message)}
                      >
                        💬 Reply
                      </button>
                      {message.isCurrentUser && (
                        <>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => handleEditMessage(message)}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={setMessagesEndRef} />
              </div>
              
              <div className="message-input-container">
                {replyingTo && (
                  <div className="reply-indicator">
                    <span>Replying to {replyingTo.sender}</span>
                    <button onClick={() => setReplyingTo(null)}>×</button>
                  </div>
                )}
                
                {messageAttachments.length > 0 && (
                  <div className="attachments-preview">
                    {messageAttachments.map(attachment => (
                      <div key={attachment.id} className="attachment-preview">
                        {attachment.type === 'image' ? (
                          <div className="image-preview-small">
                            <img src={attachment.url} alt={attachment.name} />
                            <span className="image-name">{attachment.name}</span>
                          </div>
                        ) : (
                          <div className="file-preview">
                            <span className="file-icon">
                              {attachment.type === 'pdf' ? '📄' : 
                               attachment.type === 'word' ? '📝' : 
                               attachment.type === 'excel' ? '📊' : '📎'}
                            </span>
                            <span className="file-name">{attachment.name}</span>
                          </div>
                        )}
                        <button 
                          className="remove-attachment"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="message-input">
                  <input
                    type="text"
                    placeholder={replyingTo ? `Reply to ${replyingTo.sender}...` : "Type your message..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    className="attachment-btn"
                    onClick={() => setShowAttachmentPopup(true)}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button onClick={handleSendMessage}>Send Message</button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="project-page-container">
      {/* Project Header */}
      <div className="project-header">
        <h1 className="project-title">{project.title}</h1>
        <p className="project-description">{project.description}</p>
      </div>

      {/* Modern Navigation Tabs */}
      <nav className="project-nav">
        <ul className="nav-tabs">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">{getNavIcon('overview')}</span>
              Overview
              <span className="nav-badge">Details</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <span className="nav-icon">{getNavIcon('tasks')}</span>
              Tasks
              <span className="nav-badge">
                {tasks.todo.length + tasks.progress.length + tasks.complete.length}
              </span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <span className="nav-icon">{getNavIcon('messages')}</span>
              Messages
              <span className="nav-badge">{messages.length}</span>
            </button>
          </li>
        </ul>
        
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </nav>

      {/* Task Details Popup */}
      {showTaskPopup && selectedTask && (
        <div className="task-popup-overlay" onClick={handleCloseTaskPopup}>
          <div className="task-popup" onClick={(e) => e.stopPropagation()}>
            <div className="task-popup-header">
              <h3>{selectedTask.title}</h3>
              <button className="close-btn" onClick={handleCloseTaskPopup}>×</button>
            </div>
            
            <div className="task-popup-content">
              <div className="task-details-section">
                <div className="task-info">
                  <div className="info-row">
                    <span className="info-label">Description:</span>
                    <span className="info-value">{selectedTask.description}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Assignee:</span>
                    <span className="info-value">{selectedTask.assignee}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Priority:</span>
                    <span className={`priority-badge priority-${selectedTask.priority}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Due Date:</span>
                    <span className="info-value">{selectedTask.dueDate}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Created:</span>
                    <span className="info-value">{selectedTask.createdDate}</span>
                  </div>
                </div>
              </div>

              <div className="task-activities-section">
                <h4>Activity Timeline</h4>
                <div className="activities-list">
                  {selectedTask.activities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'created' ? '➕' : 
                         activity.type === 'assigned' ? '👤' : 
                         activity.type === 'moved' ? '🔄' : 
                         activity.type === 'completed' ? '✅' : '📝'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-description">{activity.description}</div>
                        <div className="activity-meta">
                          <span className="activity-user">{activity.user}</span>
                          <span className="activity-time">{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="task-comments-section">
                <h4>Comments ({selectedTask.comments.length})</h4>
                <div className="comments-list">
                  {selectedTask.comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-user">{comment.user}</span>
                        <span className="comment-time">{comment.timestamp}</span>
                      </div>
                      <div className="comment-content">{comment.message}</div>
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="comment-attachments">
                          {comment.attachments.map(attachment => (
                            <div key={attachment.id} className="attachment-item">
                              <span className="attachment-icon">
                                {attachment.type === 'pdf' ? '📄' : 
                                 attachment.type === 'image' ? '🖼️' : 
                                 attachment.type === 'word' ? '📝' : 
                                 attachment.type === 'excel' ? '📊' : '📎'}
                              </span>
                              <span className="attachment-name">{attachment.name}</span>
                              <span className="attachment-size">{attachment.size}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="add-comment-section">
                  <div className="comment-input">
                    <textarea
                      placeholder="Add a comment..."
                      value={taskComment}
                      onChange={(e) => setTaskComment(e.target.value)}
                      rows="3"
                    />
                    <div className="comment-actions">
                      <label className="file-upload-btn">
                        📎 Attach Files
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {attachedFiles.length > 0 && (
                        <div className="attached-files">
                          {attachedFiles.map(file => (
                            <div key={file.id} className="attached-file">
                              <span>{file.name}</span>
                              <button onClick={() => setAttachedFiles(attachedFiles.filter(f => f.id !== file.id))}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button 
                        className="add-comment-btn"
                        onClick={handleAddTaskComment}
                        disabled={taskComment.trim() === ''}
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Type Selection Popup */}
      {showAttachmentPopup && (
        <div className="attachment-popup-overlay" onClick={() => setShowAttachmentPopup(false)}>
          <div className="attachment-popup" onClick={(e) => e.stopPropagation()}>
            <div className="attachment-popup-header">
              <h4>Attach File</h4>
              <button onClick={() => setShowAttachmentPopup(false)}>×</button>
            </div>
            <div className="attachment-options">
              <button 
                className="attachment-option"
                onClick={() => handleAttachmentTypeSelect('image')}
              >
                <span className="option-icon">🖼️</span>
                <span className="option-label">Image</span>
                <span className="option-desc">Photos, screenshots</span>
              </button>
              <button 
                className="attachment-option"
                onClick={() => handleAttachmentTypeSelect('document')}
              >
                <span className="option-icon">📄</span>
                <span className="option-label">Document</span>
                <span className="option-desc">PDF, Word, Text files</span>
              </button>
              <button 
                className="attachment-option"
                onClick={() => handleAttachmentTypeSelect('file')}
              >
                <span className="option-icon">📎</span>
                <span className="option-label">File</span>
                <span className="option-desc">Any file type</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Menu Dropdown */}
      {showTaskMenu && selectedTaskForMenu && (
        <div className="task-menu-overlay" onClick={handleCloseTaskMenu}>
          <div 
            className="task-menu-dropdown" 
            onClick={(e) => e.stopPropagation()}
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`
            }}
          >
            <div className="task-menu-options">
              <button 
                className="menu-option"
                onClick={handleStatusChangeClick}
              >
                🔄 Change Status
              </button>
              <button 
                className="menu-option"
                onClick={handleMoveTaskClick}
              >
                📍 Move Work Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Popup */}
      {showStatusChangePopup && selectedTaskForMenu && (
        <div className="status-popup-overlay" onClick={() => setShowStatusChangePopup(false)}>
          <div className="status-popup" onClick={(e) => e.stopPropagation()}>
            <div className="status-popup-header">
              <h4>Change Status</h4>
              <button onClick={() => setShowStatusChangePopup(false)}>×</button>
            </div>
            <div className="status-options">
              {selectedTaskForMenu.status === 'todo' && (
                <>
                  <button 
                    className="status-option"
                    onClick={() => handleStatusChange('progress')}
                  >
                    🔄 Move to In Progress
                  </button>
                  <button 
                    className="status-option"
                    onClick={() => handleStatusChange('complete')}
                  >
                    ✅ Move to Complete
                  </button>
                </>
              )}
              {selectedTaskForMenu.status === 'progress' && (
                <>
                  <button 
                    className="status-option"
                    onClick={() => handleStatusChange('todo')}
                  >
                    📋 Move to To Do
                  </button>
                  <button 
                    className="status-option"
                    onClick={() => handleStatusChange('complete')}
                  >
                    ✅ Move to Complete
                  </button>
                </>
              )}
              {selectedTaskForMenu.status === 'complete' && (
                <>
                  <button 
                    className="status-option"
                    onClick={() => handleStatusChange('todo')}
                  >
                    📋 Move to To Do
                  </button>
                  <button 
                    className="status-option"
                    onClick={() => handleStatusChange('progress')}
                  >
                    🔄 Move to In Progress
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Move Task Popup */}
      {showMoveTaskPopup && selectedTaskForMenu && (
        <div className="move-popup-overlay" onClick={() => setShowMoveTaskPopup(false)}>
          <div className="move-popup" onClick={(e) => e.stopPropagation()}>
            <div className="move-popup-header">
              <h4>Move Work Item</h4>
              <button onClick={() => setShowMoveTaskPopup(false)}>×</button>
            </div>
            <div className="move-options">
              <button 
                className="move-option"
                onClick={() => handleMoveTask('top')}
              >
                ⬆️ Move to Top
              </button>
              <button 
                className="move-option"
                onClick={() => handleMoveTask('bottom')}
              >
                ⬇️ Move to Bottom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProjectPage;