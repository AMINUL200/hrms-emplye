import React from "react";
import "./MyPerformance.css";

const METRICS = [
  { key: "attendance", label: "Attendance", sub: "Excellent", value: 96, color: "#7c3aed" },
  { key: "task", label: "Task Score", sub: "Very Good", value: 88, color: "#2563eb" },
  { key: "performance", label: "Performance", sub: "Excellent", value: 92, color: "#16a34a" },
];

const RADIUS = 32;
const CIRC = 2 * Math.PI * RADIUS;

const CircularProgress = ({ value, color }) => {
  const offset = CIRC - (value / 100) * CIRC;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="mp-ring">
      <circle
        cx="40"
        cy="40"
        r={RADIUS}
        fill="none"
        stroke="#eef0f7"
        strokeWidth="7"
      />
      <circle
        cx="40"
        cy="40"
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
      />
      <text
        x="40"
        y="45"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="#1f2333"
      >
        {value}%
      </text>
    </svg>
  );
};

const Sparkline = ({ color }) => (
  <svg width="72" height="26" viewBox="0 0 72 26" className="mp-sparkline">
    <polyline
      points="0,18 8,10 16,20 24,6 32,14 40,4 48,16 56,8 64,18 72,10"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MyPerformance = () => {
  return (
    <div className="mp-card">
      <div className="mp-header">
        <h3>My Performance</h3>
        <button type="button" className="mp-period-btn">This Month</button>
      </div>

      <div className="mp-row">
        {METRICS.map(({ key, label, sub, value, color }) => (
          <div className="mp-item" key={key}>
            <CircularProgress value={value} color={color} />
            <div className="mp-item-text">
              <span className="mp-item-label">{label}</span>
              <Sparkline color={color} />
              <span className="mp-item-sub" style={{ color }}>{sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPerformance;