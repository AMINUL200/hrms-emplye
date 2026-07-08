import React from "react";
import "./ProjectTimeline.css";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const EVENTS = [
  {
    id: 1,
    title: "Project Kickoff",
    date: "01 Mar 2026",
    description: "Initial planning meeting with stakeholders and project scope finalized.",
    state: "done",
  },
  {
    id: 2,
    title: "Requirements Gathering Completed",
    date: "05 Mar 2026",
    description: "All functional and non-functional requirements signed off by the client.",
    state: "done",
  },
  {
    id: 3,
    title: "Design Phase Started",
    date: "22 Apr 2026",
    description: "UI/UX design and technical architecture work began.",
    state: "done",
  },
  {
    id: 4,
    title: "UI/UX Design Review",
    date: "08 Jul 2026",
    description: "Mid-phase design review with 75% of screens completed.",
    state: "active",
  },
  {
    id: 5,
    title: "Development Phase",
    date: "18 Jun 2026 – 10 Aug 2026",
    description: "Front-end and back-end implementation across all modules.",
    state: "upcoming",
  },
  {
    id: 6,
    title: "Testing Phase",
    date: "10 Aug 2026 – 05 Sep 2026",
    description: "QA testing, bug fixes, and performance optimization.",
    state: "upcoming",
  },
  {
    id: 7,
    title: "Go-Live",
    date: "21 Feb 2027",
    description: "Production deployment and project handover.",
    state: "upcoming",
  },
];

const STATE_ICON = {
  done: CheckCircle2,
  active: Clock,
  upcoming: Circle,
};

const ProjectTimeline = () => {
  return (
    <div className="ptl-card">
      <h3 className="ptl-title">Timeline</h3>

      <div className="ptl-list">
        {EVENTS.map((ev, idx) => {
          const Icon = STATE_ICON[ev.state];
          return (
            <div className={`ptl-item ptl-item--${ev.state}`} key={ev.id}>
              <div className="ptl-marker">
                <Icon size={15} />
              </div>
              {idx < EVENTS.length - 1 && <span className="ptl-line" />}
              <div className="ptl-content">
                <div className="ptl-content-header">
                  <span className="ptl-event-title">{ev.title}</span>
                  <span className="ptl-event-date">{ev.date}</span>
                </div>
                <p className="ptl-event-desc">{ev.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTimeline;