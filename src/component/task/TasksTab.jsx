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
              {formatColumnName(column)} ({tasks[column]?.length || 0})
            </div>
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
                  >
                    ⋮
                  </button>
                </div>
                <div className="task-description">{task.description}</div>
                <div className="task-meta">
                  <span>Assigned to: {task.assignee}</span>
                  {task.priority && (
                    <span
                      className={`task-priority priority-${task.priority}`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
                <small style={{ color: "#6c757d" }}>
                  Due: {task.dueDate}
                </small>
                {task.comments.length > 0 && (
                  <div className="task-comments-count">
                    💬 {task.comments.length} comment
                    {task.comments.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksComponent;