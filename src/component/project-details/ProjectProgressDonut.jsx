import React, { useMemo } from "react";
import "./ProjectProgressDonut.css";

const RADIUS = 60;
const STROKE = 16;
const CIRC = 2 * Math.PI * RADIUS;

const ProjectProgressDonut = ({ projectProgress }) => {
  // Extract progress data with fallbacks
  const {
    completed = { count: 0, percentage: 0 },
    in_progress = { count: 0, percentage: 0 },
    assigned = { count: 0, percentage: 0 },
    overall_progress = 0,
  } = projectProgress || {};

  // Prepare segments for the donut chart
  const segments = useMemo(() => {
    const segs = [];

    // Only add segments with percentage > 0
    if (completed.percentage > 0) {
      segs.push({
        key: "completed",
        label: "Completed",
        value: completed.count,
        pct: completed.percentage,
        color: "#10B981", // Success color
      });
    }

    if (in_progress.percentage > 0) {
      segs.push({
        key: "in_progress",
        label: "In Progress",
        value: in_progress.count,
        pct: in_progress.percentage,
        color: "#6366F1", // Primary color
      });
    }

    if (assigned.percentage > 0) {
      segs.push({
        key: "assigned",
        label: "Assigned",
        value: assigned.count,
        pct: assigned.percentage,
        color: "#F59E0B", // Warning color
      });
    }

    // If no segments have data, show a default "No Data" state
    if (segs.length === 0) {
      segs.push({
        key: "no_data",
        label: "No Data",
        value: 0,
        pct: 100,
        color: "#E2E8F0", // Border color
      });
    }

    return segs;
  }, [completed, in_progress, assigned]);

  // Calculate overall progress for display
  const displayProgress = overall_progress || 0;

  // Get status color based on progress
  const getProgressColor = (progress) => {
    if (progress === 100) return "#10B981"; // Complete - Green
    if (progress >= 60) return "#6366F1"; // Good - Violet
    if (progress >= 30) return "#F59E0B"; // Medium - Orange
    return "#EF4444"; // Low - Red
  };

  // Calculate total tasks
  const totalTasks = (completed.count || 0) + (in_progress.count || 0) + (assigned.count || 0);

  // Get status message
  const getStatusMessage = (progress) => {
    if (progress === 100) return "Complete! 🎉";
    if (progress >= 60) return "On Track";
    if (progress >= 30) return "In Progress";
    return "Just Started";
  };

  // If no data is available
  const hasData = totalTasks > 0 || displayProgress > 0;

  return (
    <div className="ppd-card">
      <h3 className="ppd-title">Project Progress</h3>

      <div className="ppd-body">
        <div className="ppd-chart-wrap">
          <svg width="150" height="150" viewBox="0 0 150 150">
            {/* Background circle */}
            <circle
              cx="75"
              cy="75"
              r={RADIUS}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={STROKE}
            />
            
            {/* Segments */}
            {segments.map((seg) => {
              const dash = (seg.pct / 100) * CIRC;
              // Calculate offset based on previous segments
              const prevPct = segments
                .slice(0, segments.indexOf(seg))
                .reduce((sum, s) => sum + s.pct, 0);
              const offset = CIRC - (prevPct / 100) * CIRC;
              
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
                  strokeLinecap="round"
                  transform="rotate(-90 75 75)"
                  className="ppd-donut-segment"
                />
              );
            })}

            {/* Center text - Overall Progress */}
            <text
              x="75"
              y="68"
              textAnchor="middle"
              fontSize="24"
              fontWeight="800"
              fill="#0F172A"
              className="ppd-center-value"
            >
              {hasData ? `${displayProgress}%` : '—'}
            </text>
            <text
              x="75"
              y="86"
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="#64748B"
              className="ppd-center-label"
            >
              {hasData ? getStatusMessage(displayProgress) : 'No Data'}
            </text>
          </svg>
        </div>

        <div className="ppd-legend">
          {/* Tasks Summary */}
          <div className="ppd-legend-summary">
            <span className="ppd-summary-label">Total Tasks</span>
            <span className="ppd-summary-value">{totalTasks}</span>
          </div>

          {/* Legend Items */}
          {segments.map((seg) => (
            <div className="ppd-legend-item" key={seg.key}>
              <span className="ppd-legend-dot" style={{ background: seg.color }} />
              <span className="ppd-legend-label">{seg.label}</span>
              <span className="ppd-legend-value">
                {seg.value} ({seg.pct}%)
              </span>
            </div>
          ))}

          {/* Show message when no data */}
          {!hasData && (
            <div className="ppd-no-data">
              <p>No tasks assigned yet</p>
              <span className="ppd-no-data-sub">Progress will appear here</span>
            </div>
          )}

          {/* Overall Progress Bar */}
          <div className="ppd-progress-bar-wrap">
            <div className="ppd-progress-bar-label">
              <span>Overall Progress</span>
              <span className="ppd-progress-bar-pct">{displayProgress}%</span>
            </div>
            <div className="ppd-progress-bar-track">
              <div 
                className="ppd-progress-bar-fill"
                style={{ 
                  width: `${displayProgress}%`,
                  background: getProgressColor(displayProgress)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgressDonut;