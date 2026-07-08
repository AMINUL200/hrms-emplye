import React from "react";
import "./ProjectProgressDonut.css";

const SEGMENTS = [
  { key: "completed", label: "Completed", value: 18, pct: 43, color: "#16a34a" },
  { key: "progress", label: "In Progress", value: 16, pct: 38, color: "#2563eb" },
  { key: "pending", label: "Pending", value: 8, pct: 19, color: "#f59e0b" },
];

const RADIUS = 60;
const STROKE = 16;
const CIRC = 2 * Math.PI * RADIUS;

const ProjectProgressDonut = () => {
  let cumulativePct = 0;

  return (
    <div className="ppd-card">
      <h3 className="ppd-title">Project Progress</h3>

      <div className="ppd-body">
        <div className="ppd-chart-wrap">
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
                  strokeLinecap="butt"
                  transform="rotate(-90 75 75)"
                />
              );
            })}
            <text
              x="75"
              y="72"
              textAnchor="middle"
              fontSize="22"
              fontWeight="700"
              fill="#1f2333"
            >
              43%
            </text>
            <text
              x="75"
              y="90"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="600"
              fill="#9aa0b4"
            >
              Overall Progress
            </text>
          </svg>
        </div>

        <div className="ppd-legend">
          {SEGMENTS.map((seg) => (
            <div className="ppd-legend-item" key={seg.key}>
              <span className="ppd-legend-dot" style={{ background: seg.color }} />
              <span className="ppd-legend-label">{seg.label}</span>
              <span className="ppd-legend-value">
                {seg.value} ({seg.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectProgressDonut;