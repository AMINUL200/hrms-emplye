import React, { useState } from "react";
import "./ProjectDetails.css";

const ProjectDetails = ({ projectData }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState({});
  const [completedTasks, setCompletedTasks] = useState(new Set());

  const isTaskOverdue = (endDate) => {
    const today = new Date();
    const taskEnd = new Date(endDate);
    const diffTime = taskEnd - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const handleTaskClick = (task, index) => {
    setSelectedTask(selectedTask === index ? null : index);
    setComment("");
  };

  const handleCommentSubmit = (taskIndex) => {
    if (comment.trim()) {
      setComments({
        ...comments,
        [taskIndex]: [...(comments[taskIndex] || []), {
          text: comment,
          timestamp: new Date().toLocaleString()
        }]
      });
      setComment("");
    }
  };

  const toggleTaskComplete = (taskIndex) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskIndex)) {
      newCompleted.delete(taskIndex);
    } else {
      newCompleted.add(taskIndex);
    }
    setCompletedTasks(newCompleted);
  };

  const getStatusColor = (status) => {
    const colors = {
      'development-phase': '#4361ee',
      'planning': '#f72585',
      'completed': '#06d6a0',
      'on-hold': '#ffa500'
    };
    return colors[status.toLowerCase().replace(/\s+/g, '-')] || '#4361ee';
  };

  const getStatusStyles = (status) => ({
    background: `${getStatusColor(status)}20`,
    color: getStatusColor(status),
    border: `2px solid ${getStatusColor(status)}`
  });

  return (
    <div className="project-details-container custom-scrollbar">
      {/* Header */}
      <div className="project-header">
        <h2 className="project-title">{projectData.title}</h2>
        <span 
          className="status-badge"
          style={getStatusStyles(projectData.status)}
        >
          {projectData.status}
        </span>
      </div>

      {/* Description */}
      <div className="description-container">
        <p className="description-text">{projectData.description}</p>
      </div>

      {/* Tasks Section */}
      <div className="tasks-container">
        <div className="section-header">
          <div className="section-accent"></div>
          <h3 className="section-title">Tasks</h3>
          <span className="section-count">{projectData.tasks.length}</span>
        </div>

        <div className="tasks-list">
          {projectData.tasks.map((task, index) => {
            const isOverdue = isTaskOverdue(task.expected_end_date);
            const isCompleted = completedTasks.has(index);
            const isSelected = selectedTask === index;

            const taskItemClass = `task-item ${
              isCompleted ? 'completed' : isOverdue ? 'overdue' : ''
            } ${isSelected ? 'selected' : ''}`;

            return (
              <div key={index} className={taskItemClass}>
                {/* Priority Indicator */}
                <div className="task-priority-indicator"></div>

                <div onClick={() => handleTaskClick(task, index)}>
                  <div className="task-header">
                    <div className="task-content">
                      <h4 className={`task-name ${isCompleted ? 'completed' : ''}`}>
                        {task.task_name}
                      </h4>
                      <p className="task-description">{task.task_desc}</p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(index);
                      }}
                      className={`complete-btn ${isCompleted ? 'completed' : ''}`}
                    >
                      {isCompleted && (
                        <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>✓</span>
                      )}
                    </button>
                  </div>

                  <div className="task-meta">
                    <div className="meta-item">
                      <span style={{ fontSize: '16px' }}>📅</span>
                      <div>
                        <div className="meta-label">START</div>
                        <div className="meta-value">{task.start_date}</div>
                      </div>
                    </div>
                    
                    <div className={`meta-item ${isOverdue ? 'overdue' : ''}`}>
                      <span style={{ fontSize: '16px' }}>{isOverdue ? '⚠️' : '🎯'}</span>
                      <div>
                        <div className={`meta-label ${isOverdue ? 'overdue' : ''}`}>
                          {isOverdue ? 'DUE SOON!' : 'DUE DATE'}
                        </div>
                        <div className={`meta-value ${isOverdue ? 'overdue' : ''}`}>
                          {task.expected_end_date}
                        </div>
                      </div>
                    </div>

                    {comments[index] && comments[index].length > 0 && (
                      <div className="meta-item comments">
                        <span style={{ fontSize: '16px' }}>💬</span>
                        <div className="meta-value comments">
                          {comments[index].length} {comments[index].length === 1 ? 'comment' : 'comments'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Comment Section */}
                {isSelected && (
                  <div className="comments-section">
                    {/* Previous Comments */}
                    {comments[index] && comments[index].length > 0 && (
                      <div className="comments-list">
                        <h5 className="comments-title">Comments</h5>
                        {comments[index].map((c, i) => (
                          <div key={i} className="comment-item">
                            <p className="comment-text">{c.text}</p>
                            <span className="comment-timestamp">{c.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="comment-input-container">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(index)}
                        className="comment-input"
                      />
                      <button
                        onClick={() => handleCommentSubmit(index)}
                        className="send-btn"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Members */}
      <div className="team-container">
        <div className="section-header">
          <div className="section-accent"></div>
          <h3 className="section-title">Team Members</h3>
          <span className="section-count">{projectData.members.length}</span>
        </div>

        <div className="team-grid">
          {projectData.members.map((member, index) => (
            <div key={index} className="team-member">
              <div className="member-avatar">
                {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="member-info">
                <span className="member-name">
                  {member.name || 'Unknown User'}
                </span>
                <span className="member-role">
                  {member.role || 'Team Member'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;