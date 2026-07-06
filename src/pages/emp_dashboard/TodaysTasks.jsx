import React, { useState } from "react";
import "./TodaysTasks.css";
import { ListTodo, Check } from "lucide-react";

const INITIAL_TASKS = [
  {
    id: 1,
    title: "Update project documentation",
    sub: "SponicHR – Web Version",
    priority: "High",
    done: false,
  },
  {
    id: 2,
    title: "Fix attendance module bugs",
    sub: "SponicHR – Web Version",
    priority: "Medium",
    done: true,
  },
  {
    id: 3,
    title: "Prepare monthly report",
    sub: "SWC Global",
    priority: "Medium",
    done: false,
  },
  {
    id: 4,
    title: "Team meeting at 04:00 PM",
    sub: "General",
    priority: "Low",
    done: true,
  },
];

const PRIORITY_CLASS = {
  High: "tt-priority--high",
  Medium: "tt-priority--medium",
  Low: "tt-priority--low",
};

const TodaysTasks = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <div className="tt-card">
      <div className="tt-header">
        <div className="tt-title">
          <ListTodo size={17} className="tt-title-icon" />
          <h3>Today&apos;s Tasks</h3>
        </div>
        <a href="#!" className="tt-view-all">View All</a>
      </div>

      <div className="tt-list">
        {tasks.map((task) => (
          <div className="tt-item" key={task.id}>
            <button
              type="button"
              className={`tt-checkbox ${task.done ? "tt-checkbox--done" : ""}`}
              onClick={() => toggleTask(task.id)}
              aria-label={task.done ? "Mark as not done" : "Mark as done"}
            >
              {task.done && <Check size={12} strokeWidth={3} />}
            </button>
            <div className="tt-item-text">
              <span className={`tt-item-title ${task.done ? "tt-item-title--done" : ""}`}>
                {task.title}
              </span>
              <span className="tt-item-sub">{task.sub}</span>
            </div>
            <span className={`tt-priority ${PRIORITY_CLASS[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysTasks;