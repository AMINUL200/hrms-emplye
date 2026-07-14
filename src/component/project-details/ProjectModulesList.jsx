import React, { useState } from "react";
import "./ProjectModulesList.css";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  CheckSquare,
  Square,
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
    type: "module",
    children: [
      {
        id: "m1-1",
        index: "1.1",
        title: "Requirements Gathering",
        status: "Completed",
        progress: 100,
        tasks: 3,
        type: "submodule",
        children: [
          {
            id: "m1-1-1",
            index: "1.1.1",
            title: "Stakeholder Interviews",
            status: "Completed",
            progress: 100,
            type: "task",
            children: [
              {
                id: "m1-1-1-1",
                index: "1.1.1.1",
                title: "Schedule meetings with stakeholders",
                status: "Completed",
                progress: 100,
                type: "subtask",
              },
              {
                id: "m1-1-1-2",
                index: "1.1.1.2",
                title: "Document requirements",
                status: "Completed",
                progress: 100,
                type: "subtask",
              },
            ],
          },
          {
            id: "m1-1-2",
            index: "1.1.2",
            title: "Technical Feasibility Study",
            status: "Completed",
            progress: 100,
            type: "task",
            children: [
              {
                id: "m1-1-2-1",
                index: "1.1.2.1",
                title: "Technology stack analysis",
                status: "Completed",
                progress: 100,
                type: "subtask",
              },
            ],
          },
          {
            id: "m1-1-3",
            index: "1.1.3",
            title: "Risk Assessment",
            status: "Completed",
            progress: 100,
            type: "task",
          },
        ],
      },
      {
        id: "m1-2",
        index: "1.2",
        title: "Resource Planning",
        status: "Completed",
        progress: 100,
        tasks: 2,
        type: "submodule",
        children: [
          {
            id: "m1-2-1",
            index: "1.2.1",
            title: "Team Allocation",
            status: "Completed",
            progress: 100,
            type: "task",
            children: [],
          },
          {
            id: "m1-2-2",
            index: "1.2.2",
            title: "Budget Estimation",
            status: "Completed",
            progress: 100,
            type: "task",
            children: [],
          },
        ],
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
    type: "module",
    children: [
      {
        id: "m2-1",
        index: "2.1",
        title: "UI/UX Design",
        status: "In Progress",
        progress: 75,
        tasks: 4,
        type: "submodule",
        children: [
          {
            id: "m2-1-1",
            index: "2.1.1",
            title: "Wireframing",
            status: "In Progress",
            progress: 80,
            type: "task",
            children: [
              {
                id: "m2-1-1-1",
                index: "2.1.1.1",
                title: "Low-fidelity wireframes",
                status: "Completed",
                progress: 100,
                type: "subtask",
              },
              {
                id: "m2-1-1-2",
                index: "2.1.1.2",
                title: "High-fidelity wireframes",
                status: "In Progress",
                progress: 60,
                type: "subtask",
              },
            ],
          },
          {
            id: "m2-1-2",
            index: "2.1.2",
            title: "Visual Design",
            status: "In Progress",
            progress: 70,
            type: "task",
            children: [
              {
                id: "m2-1-2-1",
                index: "2.1.2.1",
                title: "Color palette design",
                status: "Completed",
                progress: 100,
                type: "subtask",
              },
              {
                id: "m2-1-2-2",
                index: "2.1.2.2",
                title: "Typography system",
                status: "In Progress",
                progress: 50,
                type: "subtask",
              },
            ],
          },
        ],
      },
      {
        id: "m2-2",
        index: "2.2",
        title: "Technical Architecture",
        status: "In Progress",
        progress: 50,
        tasks: 4,
        type: "submodule",
        children: [
          {
            id: "m2-2-1",
            index: "2.2.1",
            title: "System Architecture Design",
            status: "In Progress",
            progress: 60,
            type: "task",
            children: [],
          },
          {
            id: "m2-2-2",
            index: "2.2.2",
            title: "Database Design",
            status: "Pending",
            progress: 30,
            type: "task",
            children: [],
          },
        ],
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
    type: "module",
    children: [
      {
        id: "m3-1",
        index: "3.1",
        title: "Frontend Development",
        status: "Pending",
        progress: 30,
        tasks: 6,
        type: "submodule",
        children: [
          {
            id: "m3-1-1",
            index: "3.1.1",
            title: "React Component Development",
            status: "Pending",
            progress: 40,
            type: "task",
            children: [],
          },
          {
            id: "m3-1-2",
            index: "3.1.2",
            title: "State Management",
            status: "Pending",
            progress: 20,
            type: "task",
            children: [],
          },
        ],
      },
      {
        id: "m3-2",
        index: "3.2",
        title: "Backend Development",
        status: "Pending",
        progress: 20,
        tasks: 6,
        type: "submodule",
        children: [
          {
            id: "m3-2-1",
            index: "3.2.1",
            title: "API Development",
            status: "Pending",
            progress: 25,
            type: "task",
            children: [],
          },
          {
            id: "m3-2-2",
            index: "3.2.2",
            title: "Database Integration",
            status: "Pending",
            progress: 15,
            type: "task",
            children: [],
          },
        ],
      },
    ],
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

const getIcon = (type) => {
  switch (type) {
    case "module":
      return <Folder size={16} className="pml-folder-icon" />;
    case "submodule":
      return <Folder size={14} className="pml-folder-icon pml-folder-icon--sm" />;
    case "task":
      return <FileText size={14} className="pml-file-icon" />;
    case "subtask":
      return <CheckSquare size={14} className="pml-check-icon" />;
    default:
      return <Square size={14} className="pml-check-icon" />;
  }
};

const getIndentLevel = (type) => {
  switch (type) {
    case "module":
      return 0;
    case "submodule":
      return 30;
    case "task":
      return 60;
    case "subtask":
      return 90;
    default:
      return 0;
  }
};

// Helper function to count total subtasks in a task
const countSubtasks = (item) => {
  if (!item.children) return 0;
  let count = 0;
  item.children.forEach(child => {
    if (child.type === 'subtask') count++;
    if (child.children) count += countSubtasks(child);
  });
  return count;
};

// Helper function to count total tasks in a submodule/module
const countTasks = (item) => {
  if (!item.children) return 0;
  let count = 0;
  item.children.forEach(child => {
    if (child.type === 'task') count++;
    if (child.children) count += countTasks(child);
  });
  return count;
};

// Helper function to count total submodules in a module
const countSubmodules = (item) => {
  if (!item.children) return 0;
  let count = 0;
  item.children.forEach(child => {
    if (child.type === 'submodule') count++;
    if (child.children) count += countSubmodules(child);
  });
  return count;
};

// Helper function to count direct children by type
const countDirectChildren = (item, type) => {
  if (!item.children) return 0;
  return item.children.filter(child => child.type === type).length;
};

const ProjectModulesList = () => {
  const [expanded, setExpanded] = useState({ 
    m1: true, 
    m2: true, 
    m3: true,
    "m1-1": true,
    "m1-2": true,
    "m2-1": true,
    "m2-2": true,
    "m3-1": true,
    "m3-2": true,
    "m1-1-1": true,
    "m1-1-2": true,
    "m2-1-1": true,
    "m2-1-2": true,
  });
  const [viewMode, setViewMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [search, setSearch] = useState("");

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Get right side info based on item type
  const getRightInfo = (item) => {
    switch (item.type) {
      case "module":
        const totalTasks = countTasks(item);
        const totalSubmodules = countSubmodules(item);
        return (
          <div className="pml-right-info">
            <span className="pml-info-item">
              <span className="pml-info-label">Tasks</span>
              <span className="pml-info-value">{totalTasks}</span>
            </span>
            <span className="pml-info-divider">|</span>
            <span className="pml-info-item">
              <span className="pml-info-label">Submodules</span>
              <span className="pml-info-value">{totalSubmodules}</span>
            </span>
          </div>
        );

      case "submodule":
        const submoduleTasks = countTasks(item);
        const totalSubtasks = countSubtasks(item);
        return (
          <div className="pml-right-info">
            <span className="pml-info-item">
              <span className="pml-info-label">Tasks</span>
              <span className="pml-info-value">{submoduleTasks}</span>
            </span>
            <span className="pml-info-divider">|</span>
            <span className="pml-info-item">
              <span className="pml-info-label">Subtasks</span>
              <span className="pml-info-value">{totalSubtasks}</span>
            </span>
          </div>
        );

      case "task":
        const taskSubtasks = countSubtasks(item);
        return (
          <div className="pml-right-info">
            <span className="pml-info-item">
              <span className="pml-info-label">Subtasks</span>
              <span className="pml-info-value">{taskSubtasks}</span>
            </span>
            <span className="pml-info-divider">|</span>
            <span className="pml-info-item">
              <span className="pml-info-label">N/A</span>
              <span className="pml-info-value pml-info-na">—</span>
            </span>
          </div>
        );

      case "subtask":
        return (
          <div className="pml-right-info">
            <span className="pml-info-item">
              <span className="pml-info-label">N/A</span>
              <span className="pml-info-value pml-info-na">—</span>
            </span>
            <span className="pml-info-divider">|</span>
            <span className="pml-info-item">
              <span className="pml-info-label">N/A</span>
              <span className="pml-info-value pml-info-na">—</span>
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTree = (items, level = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = expanded[item.id];
      const indent = getIndentLevel(item.type);

      return (
        <div className="pml-module-group" key={item.id}>
          <div 
            className={`pml-row pml-row--${item.type}`}
            style={{ paddingLeft: `${indent + 4}px` }}
          >
            <button
              type="button"
              className="pml-expand-btn"
              onClick={() => hasChildren && toggleExpand(item.id)}
              aria-label={isOpen ? "Collapse" : "Expand"}
            >
              {hasChildren ? (
                isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />
              ) : (
                <span className="pml-expand-btn--disabled" style={{ width: 15, display: 'inline-block' }}>•</span>
              )}
            </button>

            {getIcon(item.type)}

            <span className={`pml-row-title ${item.type === 'subtask' ? 'pml-row-title--subtask' : ''}`}>
              {item.index} {item.title}
            </span>

            {item.status && (
              <span className={`pml-status-pill ${STATUS_CLASS[item.status]}`}>
                {item.status}
              </span>
            )}

            {item.progress !== undefined && (
              <div className="pml-progress-wrap">
                <div className="pml-progress-track">
                  <div
                    className={`pml-progress-fill ${PROGRESS_CLASS[item.status]}`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="pml-progress-pct">{item.progress}%</span>
              </div>
            )}

            {/* Right side info - counts */}
            <div className="pml-right-section">
              {getRightInfo(item)}
            </div>

            <button type="button" className="pml-more-btn" aria-label="More options">
              <MoreVertical size={16} />
            </button>
          </div>

          {hasChildren && isOpen && (
            <div className="pml-children">
              {renderTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
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
        {renderTree(MODULES)}
      </div>
    </div>
  );
};

export default ProjectModulesList;