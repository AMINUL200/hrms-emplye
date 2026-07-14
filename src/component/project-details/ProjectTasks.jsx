import React, {
  useMemo,
  useState,
} from "react";

import "./ProjectTasks.css";

import {
  Search,
  Plus,
  ChevronDown,
  Users,
} from "lucide-react";

// ==========================================
// STATUS CLASS
// ==========================================

const STATUS_CLASS = {
  open: "pt-status--todo",
  todo: "pt-status--todo",
  "to do": "pt-status--todo",

  in_progress:
    "pt-status--progress",
  "in progress":
    "pt-status--progress",

  completed:
    "pt-status--completed",
  complete:
    "pt-status--completed",
  done:
    "pt-status--completed",

  review:
    "pt-status--review",
  "in review":
    "pt-status--review",

  on_hold:
    "pt-status--on-hold",
  "on hold":
    "pt-status--on-hold",
};

// ==========================================
// PRIORITY CLASS
// ==========================================

const PRIORITY_CLASS = {
  High: "pt-priority--high",
  Medium:
    "pt-priority--medium",
  Low: "pt-priority--low",
};

// ==========================================
// FORMAT STATUS
// ==========================================

const formatStatus = (status) => {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

// ==========================================
// FORMAT DATE
// 2026-07-14 -> 14 Jul 2026
// ==========================================

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(`${date}T00:00:00`);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ==========================================
// PROJECT TASKS
// ==========================================

const ProjectTasks = ({
  tasksData = [],
}) => {
  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  console.log(
    "Tasks Data in ProjectTasks:",
    tasksData
  );

  // ==========================================
  // GET AVAILABLE STATUSES
  // ==========================================

  const availableStatuses =
    useMemo(() => {
      return [
        ...new Set(
          tasksData
            .map(
              (task) =>
                task.status
            )
            .filter(Boolean)
        ),
      ];
    }, [tasksData]);

  // ==========================================
  // FILTER TASKS
  // ==========================================

  const filteredTasks =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return tasksData.filter(
        (task) => {
          const taskTitle =
            task.title
              ?.toLowerCase() ||
            "";

          const taskId =
            task.unique_id
              ?.toLowerCase() ||
            "";

          const priority =
            task.priority
              ?.toLowerCase() ||
            "";

          const matchesSearch =
            !normalizedSearch ||
            taskTitle.includes(
              normalizedSearch
            ) ||
            taskId.includes(
              normalizedSearch
            ) ||
            priority.includes(
              normalizedSearch
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            task.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      tasksData,
      search,
      statusFilter,
    ]);

  return (
    <div className="pt-card">
      {/* =========================
          HEADER
      ========================= */}

      <div className="pt-header">
        <div className="pt-title-wrap">
          <h3>Tasks</h3>

          <span className="pt-count">
            {tasksData.length}
          </span>
        </div>

        <div className="pt-controls">
          {/* Search */}

          <div className="pt-search-box">
            <Search size={14} />

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          {/* Status Filter */}

          <div className="pt-select-wrap">
            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Status
              </option>

              {availableStatuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatStatus(
                      status
                    )}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={14}
              className="pt-select-caret"
            />
          </div>

          {/* Add Task */}

          <button
            type="button"
            className="pt-add-btn"
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>
      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="pt-table-scroll">
        <table className="pt-table">
          <thead>
            <tr>
              <th>TASK</th>

              <th>
                TASK ID
              </th>

              <th>
                ASSIGNED
              </th>

              <th>
                DUE DATE
              </th>

              <th>
                PRIORITY
              </th>

              <th>
                STATUS
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map(
              (task) => {
                const statusKey =
                  task.status
                    ?.toLowerCase();

                const statusClass =
                  STATUS_CLASS[
                    statusKey
                  ] ||
                  "pt-status--todo";

                const priorityClass =
                  PRIORITY_CLASS[
                    task.priority
                  ] || "";

                const assignedCount =
                  task
                    .assignment_summary
                    ?.total_employee ??
                  0;

                return (
                  <tr key={task.id}>
                    {/* Task Title */}

                    <td>
                      <div className="pt-task-info">
                        <span className="pt-task-title">
                          {
                            task.title
                          }
                        </span>

                        {task
                          .children
                          ?.length >
                          0 && (
                          <span className="pt-subtask-text">
                            {
                              task
                                .children
                                .length
                            }{" "}
                            subtask
                            {task
                              .children
                              .length >
                            1
                              ? "s"
                              : ""}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Task ID */}

                    <td>
                      <span className="pt-task-id">
                        {task.unique_id ||
                          "—"}
                      </span>
                    </td>

                    {/* Assigned Employees */}

                    <td>
                      <span className="pt-assignee">
                        <Users
                          size={13}
                        />

                        {assignedCount ===
                        0
                          ? "Unassigned"
                          : `${assignedCount} Assigned`}
                      </span>
                    </td>

                    {/* Due Date */}

                    <td>
                      <span className="pt-due-date">
                        {formatDate(
                          task.end_date
                        )}
                      </span>
                    </td>

                    {/* Priority */}

                    <td>
                      <span
                        className={`
                          pt-pill
                          ${priorityClass}
                        `}
                      >
                        {task.priority ||
                          "—"}
                      </span>
                    </td>

                    {/* Status */}

                    <td>
                      <span
                        className={`
                          pt-pill
                          ${statusClass}
                        `}
                      >
                        {formatStatus(
                          task.status
                        )}
                      </span>
                    </td>
                  </tr>
                );
              }
            )}

            {/* Empty State */}

            {filteredTasks.length ===
              0 && (
              <tr>
                <td
                  colSpan={6}
                  className="pt-empty"
                >
                  {tasksData.length ===
                  0
                    ? "No tasks found for this project."
                    : "No tasks match your search or filter."}
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