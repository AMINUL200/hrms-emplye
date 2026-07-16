import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectOverview.css";
import {
  FileText,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Flag,
  User,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";

const MILESTONE_ICON = {
  done: CheckCircle2,
  active: Circle,
  upcoming: Circle,
};

const PRIORITY_CLASS = {
  High: "po-priority--high",
  Medium: "po-priority--medium",
  Low: "po-priority--low",
};

const ProjectOverview = ({
  projectDetails = {},
  projectProgress = {},
  tasks = [],
  milestones = [],
  projectId = null, // Add projectId prop
  onTabChange = null, // Optional callback for tab change
}) => {
  const navigate = useNavigate();

  // Extract project details with fallbacks
  const {
    title = "Project",
    description = "No description available",
    status = "open",
    project_start_date = null,
    project_end_date = null,
    identifier = "N/A",
    emid = "N/A",
    createdBy = "N/A",
    created_at = null,
    id: project_id = projectId, // Use projectId prop or from details
  } = projectDetails;

  // Format date function
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      open: "Open",
      in_progress: "In Progress",
      completed: "Completed",
      pending: "Pending",
      closed: "Closed",
      on_hold: "On Hold",
    };
    return statusMap[status] || status;
  };

  // Get priority based on identifier or tasks
  const getPriority = () => {
    if (identifier.includes("High") || identifier.includes("UK")) return "High";
    if (tasks.some((t) => t.priority === "High")) return "High";
    return "Medium";
  };

  // Get total tasks count
  const totalTasks = tasks.length || 0;

  // Get completed tasks count
  const completedTasks =
    tasks.filter((t) => t.status === "completed").length || 0;

  // Get in progress tasks count
  const inProgressTasks =
    tasks.filter((t) => t.status === "in_progress" || t.status === "open")
      .length || 0;

  // Get high priority tasks
  const highPriorityTasks = tasks
    .filter((t) => t.priority === "High")
    .slice(0, 5);

  // Get all tasks for the bottom list (limited to 5)
  const recentTasks = tasks.slice(0, 5);

  // Generate milestones from tasks or use provided milestones
  const generatedMilestones = useMemo(() => {
    if (milestones.length > 0) return milestones;

    // Generate milestones from tasks
    const taskMilestones = tasks.map((task, index) => ({
      key: `milestone-${index}`,
      title: task.title || `Task ${index + 1}`,
      date: formatDate(task.end_date || task.start_date),
      state:
        task.status === "completed"
          ? "done"
          : task.status === "in_progress"
            ? "active"
            : "upcoming",
    }));

    // If no tasks, use default milestones
    if (taskMilestones.length === 0) {
      return [
        {
          key: "m1",
          title: "Project Start",
          date: formatDate(project_start_date),
          state: "done",
        },
        {
          key: "m2",
          title: "In Progress",
          date: formatDate(new Date()),
          state: "active",
        },
        {
          key: "m3",
          title: "Project End",
          date: formatDate(project_end_date),
          state: "upcoming",
        },
      ];
    }

    return taskMilestones.slice(0, 5);
  }, [tasks, milestones, project_start_date, project_end_date]);

  // Clean description (remove HTML tags for preview)
  const cleanDescription = (html) => {
    if (!html) return "No description available";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "No description available";
  };

  // Get overall progress
  const overallProgress = projectProgress?.overall_progress || 0;

  // Handle task click - navigate to workspace in new tab
  const handleTaskClick = (taskId) => {
    if (project_id) {
      // Construct the URL
      const url = `/organization/assigned-project/${project_id}/workspace/${taskId}`;

      // Open in new tab
      window.open(url, "_blank", "noopener,noreferrer");

      // Optional: Also navigate in current tab if you want both
      // navigate(url);
    } else {
      console.log("Project ID not available for navigation");
      // Fallback: if onTabChange is provided, use it
      if (onTabChange) {
        onTabChange("tasks");
      }
    }
  };

  // Handle "View All Tasks" click
  const handleViewAllTasks = () => {
    if (project_id) {
      // Navigate to the workspace with project_id
      // You can pass a special value like 'all' or use the first task
      navigate(`/organization/assigned-project/${project_id}/workspace/tasks`);
    } else {
      if (onTabChange) {
        onTabChange("tasks");
      }
    }
  };

  // Get status class for task items
  const getTaskStatusClass = (status) => {
    const statusMap = {
      completed: "po-task-status--completed",
      in_progress: "po-task-status--progress",
      open: "po-task-status--open",
      pending: "po-task-status--pending",
      closed: "po-task-status--closed",
    };
    return statusMap[status] || "po-task-status--open";
  };

  // Get status label for tasks
  const getTaskStatusLabel = (status) => {
    const statusMap = {
      completed: "Completed",
      in_progress: "In Progress",
      open: "Open",
      pending: "Pending",
      closed: "Closed",
    };
    return statusMap[status] || status;
  };

  // Get priority class for task priority pill
  const getTaskPriorityClass = (priority) => {
    return PRIORITY_CLASS[priority] || "po-priority--medium";
  };

  return (
    <div className="po-wrap">
      {/* Description */}
      <div className="po-card">
        <div className="po-card-header">
          <span className="po-header-icon">
            <FileText size={16} />
          </span>
          <h3>Project Description</h3>
        </div>
        <div className="po-description">{cleanDescription(description)}</div>
      </div>

      {/* Milestones + Priority tasks side by side */}
      <div className="po-grid">
        <div className="po-card">
          <div className="po-card-header">
            <span className="po-header-icon po-header-icon--orange">
              <Flag size={15} />
            </span>
            <h3>Key Milestones</h3>
            <span className="po-badge">{generatedMilestones.length}</span>
          </div>

          <div className="po-timeline">
            {generatedMilestones.map((m, idx) => {
              const Icon = MILESTONE_ICON[m.state] || Circle;
              return (
                <div
                  className={`po-timeline-item po-timeline-item--${m.state}`}
                  key={m.key}
                >
                  <div className="po-timeline-marker">
                    <Icon size={14} />
                  </div>
                  {idx < generatedMilestones.length - 1 && (
                    <span className="po-timeline-line" />
                  )}
                  <div className="po-timeline-text">
                    <span className="po-timeline-title">{m.title}</span>
                    <span className="po-timeline-date">{m.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="po-card">
          <div className="po-card-header">
            <span className="po-header-icon po-header-icon--red">
              <AlertTriangle size={15} />
            </span>
            <h3>Priority Tasks</h3>
            <span className="po-badge">{highPriorityTasks.length}</span>
          </div>

          <div className="po-task-list">
            {highPriorityTasks.length > 0 ? (
              highPriorityTasks.map((t) => (
                <div
                  className="po-task-row po-task-row--clickable"
                  key={t.id || t.key}
                  onClick={() => handleTaskClick(t.id)}
                >
                  <div className="po-task-text">
                    <span className="po-task-title">{t.title}</span>
                    <span className="po-task-meta">
                      <User size={11} /> {t.emid || "Unassigned"} &middot; Due{" "}
                      {formatDate(t.end_date)}
                    </span>
                  </div>
                  <div className="po-task-right">
                    <span
                      className={`po-priority-pill ${getTaskPriorityClass(t.priority)}`}
                    >
                      {t.priority}
                    </span>
                    <ChevronRight size={14} className="po-task-arrow" />
                  </div>
                </div>
              ))
            ) : (
              <div className="po-empty-state">
                <p>No high priority tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
