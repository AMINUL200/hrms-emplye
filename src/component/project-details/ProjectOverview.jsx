import React from "react";
import "./ProjectOverview.css";
import {
  FileText,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Flag,
  User,
} from "lucide-react";

const MILESTONES = [
  { key: "m1", title: "Project Planning", date: "05 Mar 2026", state: "done" },
  { key: "m2", title: "Design Phase", date: "22 Apr 2026", state: "active" },
  { key: "m3", title: "Development Phase", date: "18 Jun 2026", state: "upcoming" },
  { key: "m4", title: "Testing Phase", date: "10 Aug 2026", state: "upcoming" },
  { key: "m5", title: "Deployment", date: "21 Feb 2027", state: "upcoming" },
];

const PRIORITY_TASKS = [
  {
    key: "t1",
    title: "Finalize homepage wireframes",
    assignee: "Jane Smith",
    due: "12 Jul 2026",
    priority: "High",
  },
  {
    key: "t2",
    title: "API contract review with backend team",
    assignee: "Mike Johnson",
    due: "14 Jul 2026",
    priority: "High",
  },
  {
    key: "t3",
    title: "Set up CI/CD pipeline",
    assignee: "John Doe",
    due: "18 Jul 2026",
    priority: "Medium",
  },
  {
    key: "t4",
    title: "Draft QA test plan",
    assignee: "Sarah Wilson",
    due: "22 Jul 2026",
    priority: "Medium",
  },
];

const PRIORITY_CLASS = {
  High: "po-priority--high",
  Medium: "po-priority--medium",
  Low: "po-priority--low",
};

const MILESTONE_ICON = {
  done: CheckCircle2,
  active: Circle,
  upcoming: Circle,
};

const ProjectOverview = () => {
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
        <p className="po-description">
          Complete redesign and rebuild of the SWC Global corporate website,
          covering UX research, visual design, front-end development, and
          integration with the internal CMS. The project spans planning,
          design, development, testing, and deployment phases with a target
          go-live date of February 2027.
        </p>
      </div>

      {/* Milestones + Priority tasks side by side */}
      <div className="po-grid">
        <div className="po-card">
          <div className="po-card-header">
            <span className="po-header-icon po-header-icon--orange">
              <Flag size={15} />
            </span>
            <h3>Key Milestones</h3>
          </div>

          <div className="po-timeline">
            {MILESTONES.map((m, idx) => {
              const Icon = MILESTONE_ICON[m.state];
              return (
                <div className={`po-timeline-item po-timeline-item--${m.state}`} key={m.key}>
                  <div className="po-timeline-marker">
                    <Icon size={14} />
                  </div>
                  {idx < MILESTONES.length - 1 && <span className="po-timeline-line" />}
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
          </div>

          <div className="po-task-list">
            {PRIORITY_TASKS.map((t) => (
              <div className="po-task-row" key={t.key}>
                <div className="po-task-text">
                  <span className="po-task-title">{t.title}</span>
                  <span className="po-task-meta">
                    <User size={11} /> {t.assignee} &middot; Due {t.due}
                  </span>
                </div>
                <span className={`po-priority-pill ${PRIORITY_CLASS[t.priority]}`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;