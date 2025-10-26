import React from "react";

const TasksComponent = ({
  taskColumns,
  tasks,
  formatColumnName,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDrop,
  handleDragStart,
  handleDragEnd,
  handleTaskClick,
  handleTaskMenuClick,
  dragOverColumn
}) => {
  return (
    <div className="tasks-content">
      <div className="task-board">
        {taskColumns.map(column => (
          <div
            key={column}
            className={`task-column ${
              dragOverColumn === column ? "drag-over" : ""
            }`}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, column)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column)}
          >
            <div className={`column-header ${column.toLowerCase()}-header`}>
              <div className="column-title">
                {formatColumnName(column)} 
                <span className="task-count">({tasks[column]?.length || 0})</span>
              </div>
              {dragOverColumn === column && (
                <div className="drop-indicator">Drop here to move</div>
              )}
            </div>
            
            <div className="task-list">
              {tasks[column]?.map((task) => (
                <div
                  key={task.id}
                  className="task-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id, column)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="task-header">
                    <div className="task-title">{task.title}</div>
                    <button
                      className="task-menu-btn"
                      onClick={(e) => handleTaskMenuClick(task, e)}
                      title="Task options"
                    >
                      ⋮
                    </button>
                  </div>
                  
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                  
                  <div className="task-meta">
                    <div className="assignee-info">
                      <span className="assignee-label">Assigned to:</span>
                      <span className="assignee-name">{task.assignee}</span>
                    </div>
                    {task.priority && (
                      <span
                        className={`task-priority priority-${task.priority}`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                  
                  <div className="task-footer">
                    {task.dueDate && (
                      <small className="due-date">
                        📅 {task.dueDate}
                      </small>
                    )}
                    {task.comments.length > 0 && (
                      <div className="task-comments-count">
                        💬 {task.comments.length}
                      </div>
                    )}
                  </div>
                  
                  <div className="task-drag-handle" title="Drag to move">
                    ⋯⋯
                  </div>
                </div>
              ))}
              
              {tasks[column]?.length === 0 && (
                <div className="empty-column">
                  <div className="empty-icon">📋</div>
                  <p>No tasks in {formatColumnName(column).toLowerCase()}</p>
                  <small>Drag tasks here or create new ones</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksComponent;