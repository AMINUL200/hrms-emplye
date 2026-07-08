import React from "react";
import "./ProjectReports.css";
import { 
  Download, 
  TrendingUp, 
  FileBarChart2, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye
} from "lucide-react";

const MODULE_PROGRESS = [
  { name: "Project Planning", pct: 100, color: "#10B981" },
  { name: "Design Phase", pct: 60, color: "#6366F1" },
  { name: "Development Phase", pct: 25, color: "#F59E0B" },
  { name: "Testing Phase", pct: 0, color: "#94A3B8" },
  { name: "Deployment Phase", pct: 0, color: "#94A3B8" },
];

const REPORTS = [
  { id: 1, title: "Weekly Progress Report", date: "07 Jul 2026", type: "PDF" },
  { id: 2, title: "Task Completion Summary", date: "01 Jul 2026", type: "XLSX" },
  { id: 3, title: "Team Productivity Report", date: "24 Jun 2026", type: "PDF" },
  { id: 4, title: "Monthly Status Report - June", date: "30 Jun 2026", type: "PDF" },
];

const STATS = [
  { label: "Total Reports", value: "12", icon: FileText, variant: "primary" },
  { label: "Completed", value: "8", icon: CheckCircle2, variant: "success" },
  { label: "In Progress", value: "3", icon: Clock, variant: "warning" },
  { label: "Pending", value: "1", icon: AlertCircle, variant: "danger" },
];

const DONUT_DATA = [
  { label: "Completed", count: 8, color: "#10B981" },
  { label: "In Progress", count: 3, color: "#6366F1" },
  { label: "Pending", count: 1, color: "#F59E0B" },
];

const ProjectReports = () => {
  const totalTasks = DONUT_DATA.reduce((sum, d) => sum + d.count, 0);
  const completedTasks = DONUT_DATA.find(d => d.label === "Completed")?.count || 0;
  const percentage = Math.round((completedTasks / totalTasks) * 100);

  const getTypeBadgeClass = (type) => {
    const map = {
      PDF: "prp-report-type-badge--pdf",
      XLSX: "prp-report-type-badge--xlsx",
      DOC: "prp-report-type-badge--doc",
    };
    return map[type] || "";
  };

  return (
    <div className="prp-wrap">
      {/* Stats Cards */}
      <div className="prp-stats-grid">
        {STATS.map((stat) => (
          <div key={stat.label} className={`prp-stat-item prp-stat-item--${stat.variant}`}>
            <div className="prp-stat-value">{stat.value}</div>
            <div className="prp-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Module progress bar chart */}
      <div className="prp-card">
        <div className="prp-card-header">
          <span className="prp-header-icon">
            <TrendingUp size={16} />
          </span>
          <h3>Module Progress</h3>
          <span className="prp-count-badge" style={{ marginLeft: 'auto', background: '#F8FAFC', color: '#64748B', fontSize: '12px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px' }}>
            {MODULE_PROGRESS.filter(m => m.pct === 100).length}/{MODULE_PROGRESS.length} Complete
          </span>
        </div>

        <div className="prp-bar-chart">
          {MODULE_PROGRESS.map((m) => (
            <div className="prp-bar-row" key={m.name}>
              <span className="prp-bar-label">{m.name}</span>
              <div className="prp-bar-track">
                <div
                  className="prp-bar-fill"
                  style={{ width: `${m.pct}%`, background: m.color }}
                />
              </div>
              <span className="prp-bar-pct">{m.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Donut Chart and Generated Reports combined */}
      <div className="prp-card">
        <div className="prp-card-header">
          <span className="prp-header-icon prp-header-icon--violet">
            <FileBarChart2 size={16} />
          </span>
          <h3>Overview & Reports</h3>
        </div>

        <div className="prp-donut-wrap">
          <div className="prp-donut">
            <svg viewBox="0 0 120 120">
              <circle className="prp-donut-bg" cx="60" cy="60" r="50" />
              <circle
                className="prp-donut-fill"
                cx="60"
                cy="60"
                r="50"
                strokeDasharray={`${(percentage / 100) * 314.159} 314.159`}
              />
            </svg>
            <div className="prp-donut-center">
              <div className="prp-donut-number">{percentage}%</div>
              <div className="prp-donut-label">Completed</div>
            </div>
          </div>

          <div className="prp-donut-details">
            {DONUT_DATA.map((item) => (
              <div key={item.label} className="prp-donut-detail">
                <span 
                  className="prp-donut-dot" 
                  style={{ background: item.color }}
                />
                <span className="prp-donut-text">{item.label}</span>
                <span className="prp-donut-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="prp-report-list">
          {REPORTS.map((r) => (
            <div className="prp-report-row" key={r.id}>
              <div className="prp-report-info">
                <span className="prp-report-title">
                  {r.title}
                  <span className={`prp-report-type-badge ${getTypeBadgeClass(r.type)}`}>
                    {r.type}
                  </span>
                </span>
                <span className="prp-report-meta">{r.date}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  className="prp-download-btn" 
                  aria-label="View report"
                  style={{ borderColor: '#E2E8F0' }}
                >
                  <Eye size={15} />
                </button>
                <button 
                  type="button" 
                  className="prp-download-btn" 
                  aria-label="Download report"
                >
                  <Download size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="prp-actions">
          <button className="prp-action-btn prp-action-btn--primary">
            <Plus size={16} />
            Generate Report
          </button>
          <button className="prp-action-btn prp-action-btn--outline">
            View All Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectReports;