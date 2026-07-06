import React from "react";
import "./ProjectDetails.css";
import { FolderKanban, CheckCircle2, Hourglass, ListChecks } from "lucide-react";

const PROJECTS = [
  {
    key: "sponichr",
    name: "SponicHR – Web Version",
    dotColor: "#7c3aed",
    completed: 7,
    pending: 3,
    total: 10,
    progress: 70,
  },
  {
    key: "hubers-website",
    name: "Hubers Law Website",
    dotColor: "#2563eb",
    completed: 0,
    pending: 4,
    total: 4,
    progress: 0,
  },
  {
    key: "swc-global",
    name: "SWC Global",
    dotColor: "#8b5cf6",
    completed: 0,
    pending: 2,
    total: 2,
    progress: 0,
  },
  {
    key: "hubers-law",
    name: "Hubers Law",
    dotColor: "#f472b6",
    completed: 0,
    pending: 1,
    total: 1,
    progress: 0,
  },
];

const ProjectDetails = () => {
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
            {PROJECTS.map((p) => (
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