import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  Eye,
  UserPlus,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ==========================================
// GET ICON BASED ON ITEM TYPE
// ==========================================

const getIcon = (type) => {
  switch (type) {
    case "module":
      return (
        <Folder
          size={16}
          className="pml-folder-icon"
        />
      );

    case "submodule":
      return (
        <Folder
          size={14}
          className="
            pml-folder-icon
            pml-folder-icon--sm
          "
        />
      );

    case "task":
      return (
        <FileText
          size={14}
          className="pml-file-icon"
        />
      );

    case "subtask":
      return (
        <CheckSquare
          size={14}
          className="pml-check-icon"
        />
      );

    default:
      return (
        <Square
          size={14}
          className="pml-check-icon"
        />
      );
  }
};

// ==========================================
// INDENT BASED ON LEVEL
// ==========================================

const getIndentLevel = (level) => {
  return level * 30;
};

// ==========================================
// FORMAT STATUS
// ==========================================

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

// ==========================================
// GET STATUS CLASS
// ==========================================

const getStatusClass = (status) => {
  const normalizedStatus =
    status?.toLowerCase();

  switch (normalizedStatus) {
    case "completed":
    case "complete":
    case "done":
    case "closed":
      return "pml-status--completed";

    case "in_progress":
    case "in progress":
    case "progress":
      return "pml-status--progress";

    case "open":
    case "pending":
    case "assigned":
      return "pml-status--pending";

    default:
      return "pml-status--pending";
  }
};

// ==========================================
// GET PROGRESS CLASS
// ==========================================

const getProgressClass = (percentage) => {
  if (percentage >= 100) {
    return "pml-progress-fill--green";
  }

  if (percentage > 0) {
    return "pml-progress-fill--blue";
  }

  return "pml-progress-fill--orange";
};

// ==========================================
// RECURSIVE SEARCH + STATUS FILTER
// Keeps parent if a child matches
// ==========================================

const filterTree = (
  items = [],
  search = "",
  statusFilter = "All Status"
) => {
  const normalizedSearch =
    search.trim().toLowerCase();

  return items
    .map((item) => {
      const filteredChildren =
        filterTree(
          item.children || [],
          search,
          statusFilter
        );

      const matchesSearch =
        !normalizedSearch ||
        item.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        item.unique_id
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All Status" ||
        item.status
          ?.toLowerCase() ===
          statusFilter.toLowerCase();

      if (
        (matchesSearch &&
          matchesStatus) ||
        filteredChildren.length > 0
      ) {
        return {
          ...item,
          children: filteredChildren,
        };
      }

      return null;
    })
    .filter(Boolean);
};

// ==========================================
// PROJECT MODULES LIST
// ==========================================

const ProjectModulesList = ({
  modulesInfo = [],
}) => {

  const navigate = useNavigate();

  const [expanded, setExpanded] =
    useState({});

  const [viewMode, setViewMode] =
    useState("list");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All Status");

  const [search, setSearch] =
    useState("");

  const [
    openDropdown,
    setOpenDropdown,
  ] = useState(null);

  // ==========================================
  // AUTO EXPAND TOP LEVEL MODULES
  // ==========================================

  useEffect(() => {
    if (
      !Array.isArray(modulesInfo) ||
      modulesInfo.length === 0
    ) {
      return;
    }

    const initialExpanded = {};

    modulesInfo.forEach((item) => {
      initialExpanded[item.id] = true;
    });

    setExpanded(initialExpanded);
  }, [modulesInfo]);

  // ==========================================
  // FILTERED DATA
  // ==========================================

  const filteredModules =
    useMemo(() => {
      return filterTree(
        modulesInfo,
        search,
        statusFilter
      );
    }, [
      modulesInfo,
      search,
      statusFilter,
    ]);

  // ==========================================
  // TOGGLE TREE
  // ==========================================

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ==========================================
  // DROPDOWN
  // ==========================================

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) =>
      prev === id ? null : id
    );
  };

  const handleDropdownAction = (
    action,
    item
  ) => {
    console.log(
      `${action} clicked for:`,
      item
    );

    setOpenDropdown(null);

    // Add your navigation / modal logic here
    if (action === "View") {
      navigate(
        `/organization/assigned-project/${item.project_id}/workspace/${item.id}`
      );
    }
  };

  // ==========================================
  // RIGHT SIDE INFO
  // ==========================================

  const getRightInfo = (item) => {
    switch (item.type) {
      case "module":
        return (
          <div className="pml-right-info">
            <span className="pml-info-item">
              <span className="pml-info-label">
                Tasks
              </span>

              <span className="pml-info-value">
                {item.total_tasks ?? 0}
              </span>
            </span>

            <span className="pml-info-divider">
              |
            </span>

            <span className="pml-info-item">
              <span className="pml-info-label">
                Submodules
              </span>

              <span className="pml-info-value">
                {item.total_submodules ?? 0}
              </span>
            </span>
          </div>
        );

      case "submodule":
        return (
          <div className="pml-right-info">
            <span className="pml-info-item">
              <span className="pml-info-label">
                Tasks
              </span>

              <span className="pml-info-value">
                {item.total_tasks ?? 0}
              </span>
            </span>

            <span className="pml-info-divider">
              |
            </span>

            <span className="pml-info-item">
              <span className="pml-info-label">
                Subtasks
              </span>

              <span className="pml-info-value">
                {item.total_subtasks ?? 0}
              </span>
            </span>
          </div>
        );

      case "task":
        return (
          <div className="pml-right-info">
            <span className="pml-info-item">
              <span className="pml-info-label">
                Subtasks
              </span>

              <span className="pml-info-value">
                {item.total_subtasks ?? 0}
              </span>
            </span>
          </div>
        );

      case "subtask":
        return (
          <div className="pml-right-info">
            <span className="pml-info-item">
              

              <span className="pml-info-value">
                N/A -
              </span>
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  // ==========================================
  // RECURSIVE TREE RENDER
  // parentIndex examples:
  // 1
  // 1.1
  // 1.1.1
  // 1.1.1.1
  // ==========================================

  const renderTree = (
    items = [],
    level = 0,
    parentIndex = ""
  ) => {
    return items.map(
      (item, itemIndex) => {
        const displayIndex =
          parentIndex
            ? `${parentIndex}.${
                itemIndex + 1
              }`
            : `${itemIndex + 1}`;

        const hasChildren =
          Array.isArray(
            item.children
          ) &&
          item.children.length > 0;

        const isOpen =
          expanded[item.id];

        const indent =
          getIndentLevel(level);

        const isDropdownOpen =
          openDropdown === item.id;

        const progress =
          item.assignment_summary
            ?.percentage ?? 0;

        return (
          <div
            className="pml-module-group"
            key={item.id}
          >
            <div
              className={`
                pml-row
                pml-row--${item.type}
              `}
              style={{
                paddingLeft:
                  `${indent + 4}px`,
              }}
            >
              {/* Expand Button */}
              <button
                type="button"
                className="pml-expand-btn"
                onClick={() =>
                  hasChildren &&
                  toggleExpand(item.id)
                }
                aria-label={
                  isOpen
                    ? "Collapse"
                    : "Expand"
                }
              >
                {hasChildren ? (
                  isOpen ? (
                    <ChevronDown
                      size={15}
                    />
                  ) : (
                    <ChevronRight
                      size={15}
                    />
                  )
                ) : (
                  <span
                    className="
                      pml-expand-btn--disabled
                    "
                    style={{
                      width: 15,
                      display:
                        "inline-block",
                    }}
                  >
                    •
                  </span>
                )}
              </button>

              {/* Type Icon */}
              {getIcon(item.type)}

              {/* Title */}
              <span
                className={`
                  pml-row-title
                  ${
                    item.type ===
                    "subtask"
                      ? "pml-row-title--subtask"
                      : ""
                  }
                `}
                title={item.title}
              >
              
                {item.title}
              </span>

              {/* Status */}
              <span
                className={`
                  pml-status-pill
                  ${getStatusClass(
                    item.status
                  )}
                `}
              >
                {formatStatus(
                  item.status
                )}
              </span>

              {/* Progress */}
              <div className="pml-progress-wrap">
                <div className="pml-progress-track">
                  <div
                    className={`
                      pml-progress-fill
                      ${getProgressClass(
                        progress
                      )}
                    `}
                    style={{
                      width:
                        `${progress}%`,
                    }}
                  />
                </div>

                <span className="pml-progress-pct">
                  {progress}%
                </span>
              </div>

              {/* Right Side Counts */}
              <div className="pml-right-section">
                {getRightInfo(item)}
              </div>

              {/* Dropdown */}
              <div className="pml-dropdown-wrapper">
                <button
                  type="button"
                  className="pml-more-btn"
                  onClick={(
                    event
                  ) => {
                    event.stopPropagation();

                    toggleDropdown(
                      item.id
                    );
                  }}
                  aria-label="More options"
                >
                  <MoreVertical
                    size={16}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="pml-dropdown-menu">
                    <button
                      type="button"
                      className="pml-dropdown-item"
                      onClick={() =>
                        handleDropdownAction(
                          "View",
                          item
                        )
                      }
                    >
                      <Eye size={15} />
                      View
                    </button>

                    {/* <button
                      type="button"
                      className="pml-dropdown-item"
                      onClick={() =>
                        handleDropdownAction(
                          "Assigned",
                          item
                        )
                      }
                    >
                      <UserPlus
                        size={15}
                      />
                      Assigned
                    </button> */}

                    {/* <button
                      type="button"
                      className="pml-dropdown-item"
                      onClick={() =>
                        handleDropdownAction(
                          "Create",
                          item
                        )
                      }
                    >
                      <PlusCircle
                        size={15}
                      />
                      Create
                    </button> */}
                  </div>
                )}
              </div>
            </div>

            {/* Recursive Children */}
            {hasChildren &&
              isOpen && (
                <div className="pml-children">
                  {renderTree(
                    item.children,
                    level + 1,
                    displayIndex
                  )}
                </div>
              )}
          </div>
        );
      }
    );
  };

  // ==========================================
  // CLOSE DROPDOWN OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        !event.target.closest(
          ".pml-dropdown-wrapper"
        )
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener(
      "click",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "click",
        handleClickOutside
      );
  }, []);

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="pml-card">
      {/* Header */}
      <div className="pml-header">
        <div className="pml-title">
          <h3>
            Project Modules
          </h3>

          <span className="pml-count-badge">
            {modulesInfo.length}
          </span>
        </div>

        <div className="pml-controls">
          {/* Search */}
          <div className="pml-search-box">
            <Search size={14} />

            <input
              type="text"
              placeholder="Search modules, tasks..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          {/* Status Filter */}
          <div className="pml-select-wrap">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="All Status">
                All Status
              </option>

              <option value="open">
                Open
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="completed">
                Completed
              </option>
            </select>

            <CaretDown
              size={14}
              className="pml-select-caret"
            />
          </div>

          {/* View Toggle */}
          <div className="pml-view-toggle">
            <button
              type="button"
              className={
                viewMode === "list"
                  ? "pml-view-btn--active"
                  : ""
              }
              onClick={() =>
                setViewMode("list")
              }
              aria-label="List view"
            >
              <List size={15} />
            </button>

            <button
              type="button"
              className={
                viewMode === "grid"
                  ? "pml-view-btn--active"
                  : ""
              }
              onClick={() =>
                setViewMode("grid")
              }
              aria-label="Grid view"
            >
              <LayoutGrid
                size={15}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Tree */}
      <div className="pml-list">
        {filteredModules.length >
        0 ? (
          renderTree(
            filteredModules
          )
        ) : (
          <div className="pml-empty-state">
            <Folder size={32} />

            <p>
              No project items
              found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectModulesList;