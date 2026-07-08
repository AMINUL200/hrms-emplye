import React from "react";
import "./ProjectStatusPieChart.css";

const SEGMENTS = [
  { key: "active", label: "Active", value: 14, pct: 58, color: "#2563eb" },
  { key: "completed", label: "Completed", value: 7, pct: 29, color: "#16a34a" },
  { key: "onhold", label: "On Hold", value: 2, pct: 8, color: "#f59e0b" },
  { key: "overdue", label: "Overdue", value: 1, pct: 5, color: "#dc2626" },
];

const RADIUS = 58;
const STROKE = 20;
const CIRC = 2 * Math.PI * RADIUS;

const ProjectStatusPieChart = () => {
  let cumulativePct = 0;

  return (
    <div className="pspc-card">
      <h3 className="pspc-title">Projects by Status</h3>

      <div className="pspc-body">
        <div className="pspc-chart-wrap">
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle
              cx="75"
              cy="75"
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
                  cx="75"
                  cy="75"
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRC - dash}`}
                  strokeDashoffset={offset}
                  transform="rotate(-90 75 75)"
                />
              );
            })}
            <text x="75" y="72" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1f2333">
              24
            </text>
            <text x="75" y="90" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#9aa0b4">
              Total Projects
            </text>
          </svg>
        </div>

        <div className="pspc-legend">
          {SEGMENTS.map((seg) => (
            <div className="pspc-legend-item" key={seg.key}>
              <span className="pspc-legend-dot" style={{ background: seg.color }} />
              <span className="pspc-legend-label">{seg.label}</span>
              <span className="pspc-legend-value">
                {seg.value} ({seg.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusPieChart;