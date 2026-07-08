import React, { useState } from "react";
import "./ProjectModulesList.css";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Search,
  ChevronDown as CaretDown,
  List,
  LayoutGrid,
  MoreVertical,
} from "lucide-react";

const MODULES = [
  {
    id: "m1",
    index: "1.",
    title: "Project Planning",
    status: "Completed",
    progress: 100,
    tasks: 5,
    subLabel: "3 Sub Modules",
    children: [
      {
        id: "m1-1",
        index: "1.1",
        title: "Requirements Gathering",
        status: "Completed",
        progress: 100,
        tasks: 3,
        subLabel: "2 Sub Tasks",
      },
      {
        id: "m1-2",
        index: "1.2",
        title: "Resource Planning",
        status: "Completed",
        progress: 100,
        tasks: 2,
        subLabel: "1 Sub Tasks",
      },
    ],
  },
  {
    id: "m2",
    index: "2.",
    title: "Design Phase",
    status: "In Progress",
    progress: 60,
    tasks: 8,
    subLabel: "2 Sub Modules",
    children: [
      {
        id: "m2-1",
        index: "2.1",
        title: "UI/UX Design",
        status: "In Progress",
        progress: 75,
        tasks: 4,
        subLabel: "2 Sub Tasks",
      },
      {
        id: "m2-2",
        index: "2.2",
        title: "Technical Architecture",
        status: "In Progress",
        progress: 50,
        tasks: 4,
        subLabel: "1 Sub Tasks",
      },
    ],
  },
  {
    id: "m3",
    index: "3.",
    title: "Development Phase",
    status: "Pending",
    progress: 25,
    tasks: 12,
    subLabel: "3 Sub Modules",
    children: [],
  },
  {
    id: "m4",
    index: "4.",
    title: "Testing Phase",
    status: "Pending",
    progress: 0,
    tasks: 8,
    subLabel: "2 Sub Modules",
    children: [],
  },
  {
    id: "m5",
    index: "5.",
    title: "Deployment Phase",
    status: "Pending",
    progress: 0,
    tasks: 5,
    subLabel: "1 Sub Module",
    children: [],
  },
];

const STATUS_CLASS = {
  Completed: "pml-status--completed",
  "In Progress": "pml-status--progress",
  Pending: "pml-status--pending",
};

const PROGRESS_CLASS = {
  Completed: "pml-progress-fill--green",
  "In Progress": "pml-progress-fill--blue",
  Pending: "pml-progress-fill--orange",
};

const ProjectModulesList = () => {
  const [expanded, setExpanded] = useState({ m1: true, m2: true });
  const [viewMode, setViewMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [search, setSearch] = useState("");

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="pml-card">
      {/* Header */}
      <div className="pml-header">
        <div className="pml-title">
          <h3>Project Modules</h3>
          <span className="pml-count-badge">{MODULES.length}</span>
        </div>

        <div className="pml-controls">
          <div className="pml-search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="pml-select-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Completed</option>
              <option>In Progress</option>
              <option>Pending</option>
            </select>
            <CaretDown size={14} className="pml-select-caret" />
          </div>

          <div className="pml-view-toggle">
            <button
              type="button"
              className={viewMode === "list" ? "pml-view-btn--active" : ""}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              className={viewMode === "grid" ? "pml-view-btn--active" : ""}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Tree list */}
      <div className="pml-list">
        {MODULES.map((mod) => {
          const hasChildren = mod.children && mod.children.length > 0;
          const isOpen = expanded[mod.id];

          return (
            <div className="pml-module-group" key={mod.id}>
              <div className="pml-row pml-row--parent">
                <button
                  type="button"
                  className="pml-expand-btn"
                  onClick={() => hasChildren && toggleExpand(mod.id)}
                  aria-label={isOpen ? "Collapse" : "Expand"}
                >
                  {hasChildren ? (
                    isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />
                  ) : (
                    <ChevronRight size={15} className="pml-expand-btn--disabled" />
                  )}
                </button>

                <Folder size={16} className="pml-folder-icon" />

                <span className="pml-row-title">
                  {mod.index} {mod.title}
                </span>

                <span className={`pml-status-pill ${STATUS_CLASS[mod.status]}`}>
                  {mod.status}
                </span>

                <div className="pml-progress-wrap">
                  <div className="pml-progress-track">
                    <div
                      className={`pml-progress-fill ${PROGRESS_CLASS[mod.status]}`}
                      style={{ width: `${mod.progress}%` }}
                    />
                  </div>
                  <span className="pml-progress-pct">{mod.progress}%</span>
                </div>

                <span className="pml-tasks-count">{mod.tasks} Tasks</span>
                <span className="pml-sub-label">{mod.subLabel}</span>

                <button type="button" className="pml-more-btn" aria-label="More options">
                  <MoreVertical size={16} />
                </button>
              </div>

              {hasChildren && isOpen && (
                <div className="pml-children">
                  {mod.children.map((child) => (
                    <div className="pml-row pml-row--child" key={child.id}>
                      <span className="pml-child-dash">-</span>
                      <Folder size={14} className="pml-folder-icon pml-folder-icon--sm" />

                      <span className="pml-row-title pml-row-title--sm">
                        {child.index} {child.title}
                      </span>

                      <span className={`pml-status-pill ${STATUS_CLASS[child.status]}`}>
                        {child.status}
                      </span>

                      <div className="pml-progress-wrap">
                        <div className="pml-progress-track">
                          <div
                            className={`pml-progress-fill ${PROGRESS_CLASS[child.status]}`}
                            style={{ width: `${child.progress}%` }}
                          />
                        </div>
                        <span className="pml-progress-pct">{child.progress}%</span>
                      </div>

                      <span className="pml-tasks-count">{child.tasks} Tasks</span>
                      <span className="pml-sub-label">{child.subLabel}</span>

                      <span className="pml-more-btn-spacer" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectModulesList;