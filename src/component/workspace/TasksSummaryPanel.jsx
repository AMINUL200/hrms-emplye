import React from "react";
import "./TasksSummaryPanel.css";
import { PieChart } from "lucide-react";

const SEGMENTS = [
  { key: "completed", label: "Completed", value: 7, pct: 35, color: "#16a34a" },
  { key: "progress", label: "In Progress", value: 8, pct: 40, color: "#2563eb" },
  { key: "pending", label: "Pending", value: 5, pct: 25, color: "#f97316" },
];

const RADIUS = 55;
const STROKE = 22;
const CIRC = 2 * Math.PI * RADIUS;
const TOTAL = SEGMENTS.reduce((sum, s) => sum + s.value, 0);

const TasksSummaryPanel = () => {
  let cumulativePct = 0;

  return (
    <div className="tsp-card">
      <div className="tsp-header">
        <div className="tsp-title">
          <span className="tsp-header-icon">
            <PieChart size={16} />
          </span>
          <h3>Tasks Summary</h3>
        </div>
        <button type="button" className="tsp-view-all-btn">View All</button>
      </div>

      <div className="tsp-body">
        <div className="tsp-chart-wrap">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke="#eef0f7"
              strokeWidth={STROKE}
            />
            {SEGMENTS.map((seg) => {
              const dash = (seg.pct / 100) * CIRC;
              const offset = CIRC - (cumulativePct / 100) * CIRC;
              cumulativePct += seg.pct;
              return (
                <circle
                  key={seg.key}
                  cx="70"
                  cy="70"
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRC - dash}`}
                  strokeDashoffset={offset}
                  transform="rotate(-90 70 70)"
                />
              );
            })}
          </svg>
        </div>

        <div className="tsp-legend">
          <div className="tsp-total-row">
            <span className="tsp-total-label">Total Tasks</span>
            <span className="tsp-total-value">{TOTAL}</span>
          </div>
          {SEGMENTS.map((seg) => (
            <div className="tsp-legend-item" key={seg.key}>
              <span className="tsp-legend-dot" style={{ background: seg.color }} />
              <span className="tsp-legend-label">{seg.label}</span>
              <span className="tsp-legend-value">
                {seg.value} ({seg.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksSummaryPanel;