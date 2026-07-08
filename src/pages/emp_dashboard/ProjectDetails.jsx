import React, { useMemo } from "react";
import "./ProjectDetails.css";
import { FolderKanban, CheckCircle2, Hourglass, ListChecks } from "lucide-react";

// Color palette for project dots (cycle through these)
const DOT_COLORS = [
  "#7c3aed", // Purple
  "#2563eb", // Blue
  "#8b5cf6", // Violet
  "#f472b6", // Pink
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ef4444", // Red
  "#6366f1", // Indigo
  "#14b8a6", // Teal
];

const ProjectDetails = ({ projectInfo }) => {
  console.log("ProjectDetails received projectInfo:", projectInfo);

  // Process and format project data
  const projects = useMemo(() => {
    if (!projectInfo || projectInfo.length === 0) {
      return [];
    }

    return projectInfo.map((project, index) => ({
      key: project.project_id || `project-${index}`,
      name: project.project_name || "Unnamed Project",
      dotColor: DOT_COLORS[index % DOT_COLORS.length],
      completed: project.completed_tasks || 0,
      pending: project.pending_tasks || 0,
      total: project.total_tasks || 0,
      progress: project.progress || 0,
    }));
  }, [projectInfo]);

  // If no projects, show empty state
  if (projects.length === 0) {
    return (
      <div className="pd-card">
        <div className="pd-header">
          <div className="pd-title">
            <FolderKanban size={17} className="pd-title-icon" />
            <h3>Project Details</h3>
          </div>
          <a href="#!" className="pd-view-all">View All</a>
        </div>
        <div className="pd-empty-state">
          <p>No projects assigned yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-card">
      <div className="pd-header">
        <div className="pd-title">
          <FolderKanban size={17} className="pd-title-icon" />
          <h3>Project Details</h3>
        </div>
        <a href="#!" className="pd-view-all">View All</a>
      </div>

      <div className="pd-table-scroll">
        <table className="pd-table">
          <thead>
            <tr>
              <th>PROJECT NAME</th>
              <th>COMPLETED TASKS</th>
              <th>PENDING TASKS</th>
              <th>TOTAL TASKS</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.key}>
                <td>
                  <div className="pd-project-cell">
                    <span className="pd-dot" style={{ background: p.dotColor }} />
                    <div className="pd-project-info">
                      <span className="pd-project-name">{p.name}</span>
                      <div className="pd-progress-track">
                        <div
                          className="pd-progress-fill"
                          style={{ width: `${p.progress}%`, background: p.dotColor }}
                        />
                      </div>
                      <span className="pd-progress-pct">{p.progress}%</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="pd-metric pd-metric--completed">
                    <CheckCircle2 size={14} />
                    {p.completed}
                  </span>
                </td>
                <td>
                  <span className="pd-metric pd-metric--pending">
                    <Hourglass size={14} />
                    {p.pending}
                  </span>
                </td>
                <td>
                  <span className="pd-metric pd-metric--total">
                    <ListChecks size={14} />
                    {p.total}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectDetails;