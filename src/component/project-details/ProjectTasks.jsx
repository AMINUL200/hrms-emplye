import React, { useState } from "react";
import "./ProjectTasks.css";
import { Search, Plus, ChevronDown, User } from "lucide-react";

const TASKS = [
  { id: 1, title: "Finalize homepage wireframes", module: "Design Phase", assignee: "Jane Smith", due: "12 Jul 2026", priority: "High", status: "In Progress" },
  { id: 2, title: "API contract review with backend", module: "Development Phase", assignee: "Mike Johnson", due: "14 Jul 2026", priority: "High", status: "To Do" },
  { id: 3, title: "Set up CI/CD pipeline", module: "Development Phase", assignee: "John Doe", due: "18 Jul 2026", priority: "Medium", status: "To Do" },
  { id: 4, title: "Draft QA test plan", module: "Testing Phase", assignee: "Sarah Wilson", due: "22 Jul 2026", priority: "Medium", status: "To Do" },
  { id: 5, title: "Requirements sign-off", module: "Project Planning", assignee: "John Doe", due: "05 Mar 2026", priority: "High", status: "Completed" },
  { id: 6, title: "Resource allocation plan", module: "Project Planning", assignee: "Jane Smith", due: "08 Mar 2026", priority: "Low", status: "Completed" },
  { id: 7, title: "Technical architecture doc", module: "Design Phase", assignee: "Mike Johnson", due: "28 Jun 2026", priority: "Medium", status: "In Progress" },
  { id: 8, title: "Deployment checklist", module: "Deployment Phase", assignee: "Sarah Wilson", due: "15 Feb 2027", priority: "Low", status: "To Do" },
];

const STATUS_CLASS = {
  "To Do": "pt-status--todo",
  "In Progress": "pt-status--progress",
  Completed: "pt-status--completed",
};

const PRIORITY_CLASS = {
  High: "pt-priority--high",
  Medium: "pt-priority--medium",
  Low: "pt-priority--low",
};

const ProjectTasks = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredTasks = TASKS.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-card">
      <div className="pt-header">
        <h3>Tasks</h3>
        <div className="pt-controls">
          <div className="pt-search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="pt-select-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Status</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <ChevronDown size={14} className="pt-select-caret" />
          </div>

          <button type="button" className="pt-add-btn">
            <Plus size={14} />
            Add Task
          </button>
        </div>
      </div>

      <div className="pt-table-scroll">
        <table className="pt-table">
          <thead>
            <tr>
              <th>TASK</th>
              <th>MODULE</th>
              <th>ASSIGNEE</th>
              <th>DUE DATE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((t) => (
              <tr key={t.id}>
                <td className="pt-task-title">{t.title}</td>
                <td className="pt-module-cell">{t.module}</td>
                <td>
                  <span className="pt-assignee">
                    <User size={12} />
                    {t.assignee}
                  </span>
                </td>
                <td>{t.due}</td>
                <td>
                  <span className={`pt-pill ${PRIORITY_CLASS[t.priority]}`}>{t.priority}</span>
                </td>
                <td>
                  <span className={`pt-pill ${STATUS_CLASS[t.status]}`}>{t.status}</span>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={6} className="pt-empty">
                  No tasks match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTasks;