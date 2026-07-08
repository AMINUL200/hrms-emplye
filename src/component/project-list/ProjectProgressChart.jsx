import React from "react";
import "./ProjectProgressChart.css";

const MONTHLY_DATA = [
  { month: "Feb", started: 3, completed: 1 },
  { month: "Mar", started: 5, completed: 2 },
  { month: "Apr", started: 4, completed: 3 },
  { month: "May", started: 6, completed: 4 },
  { month: "Jun", started: 4, completed: 5 },
  { month: "Jul", started: 2, completed: 3 },
];

const MAX_VALUE = 6;
const CHART_HEIGHT = 140;

const ProjectProgressChart = () => {
  return (
    <div className="ppc-card">
      <div className="ppc-header">
        <h3>Projects Started vs Completed</h3>
        <div className="ppc-legend">
          <span className="ppc-legend-item">
            <span className="ppc-legend-dot ppc-legend-dot--started" />
            Started
          </span>
          <span className="ppc-legend-item">
            <span className="ppc-legend-dot ppc-legend-dot--completed" />
            Completed
          </span>
        </div>
      </div>

      <div className="ppc-chart">
        {MONTHLY_DATA.map((d) => (
          <div className="ppc-bar-group" key={d.month}>
            <div className="ppc-bars">
              <div
                className="ppc-bar ppc-bar--started"
                style={{ height: `${(d.started / MAX_VALUE) * CHART_HEIGHT}px` }}
                title={`${d.started} started`}
              />
              <div
                className="ppc-bar ppc-bar--completed"
                style={{ height: `${(d.completed / MAX_VALUE) * CHART_HEIGHT}px` }}
                title={`${d.completed} completed`}
              />
            </div>
            <span className="ppc-month-label">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectProgressChart;