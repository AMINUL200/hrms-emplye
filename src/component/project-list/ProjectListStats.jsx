import React from "react";
import "./ProjectListStats.css";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
} from "lucide-react";

const ProjectListStats = ({ dashboardStats }) => {
  // Use dashboardStats data or fallback to default values
  const stats = dashboardStats || {
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    overdue_projects: 0,
    team_members: 0,
  };

  const STATS = [
    {
      key: "total",
      label: "Total Projects",
      value: stats.total_projects || 0,
      trend: `${stats.total_projects || 0} Total Projects`,
      iconBg: "pls-icon--purple",
      icon: FolderKanban,
    },
    {
      key: "active",
      label: "Active Projects",
      value: stats.active_projects || 0,
      trend:
        stats.total_projects > 0
          ? `${Math.round((stats.active_projects / stats.total_projects) * 100)}% of total`
          : "No active projects",
      iconBg: "pls-icon--blue",
      icon: Clock,
    },
    {
      key: "completed",
      label: "Completed",
      value: stats.completed_projects || 0,
      trend:
        stats.total_projects > 0
          ? `${Math.round((stats.completed_projects / stats.total_projects) * 100)}% of total`
          : "No completed projects",
      iconBg: "pls-icon--green",
      icon: CheckCircle2,
    },
    {
      key: "overdue",
      label: "Overdue",
      value: stats.overdue_projects || 0,
      trend:
        stats.overdue_projects > 0
          ? `${stats.overdue_projects} project${stats.overdue_projects > 1 ? "s" : ""} overdue`
          : "All projects on track",
      iconBg: "pls-icon--red",
      icon: AlertTriangle,
    },
    {
      key: "members",
      label: "Team Members",
      value: stats.team_members || 0,
      trend:
        stats.team_members > 0
          ? `${stats.team_members} member${stats.team_members > 1 ? "s" : ""} across projects`
          : "No team members",
      iconBg: "pls-icon--orange",
      icon: Users,
    },
  ];

  return (
    <div className="pls-row">
      {STATS.map(({ key, label, value, trend, iconBg, icon: Icon }) => (
        <div className="pls-card" key={key}>
          <div className="pls-card-top">
            <span className="pls-label">{label}</span>
            <span className={`pls-icon ${iconBg}`}>
              <Icon size={17} />
            </span>
          </div>
          <div className="pls-value">{value}</div>
          <div className="pls-trend">{trend}</div>
        </div>
      ))}
    </div>
  );
};

export default ProjectListStats;
