import React from "react";
import "./ProjectOverviewCard.css";
import { LayoutGrid, Folder, Flag, Timer, Plus } from "lucide-react";

const ProjectOverviewCard = ({
  status = "Open",
  priority = "Medium",
  progress = 35,
  manager = { name: "SK Shamim", code: "SWCS", avatarUrl: null },
  client = "SWC Global",
  department = "IT & Development",
  budget = "$15,000.00",
  createdOn = "10 Jun 2026",
  lastUpdated = "04 Jul 2026",
  description = "Design and develop a modern, responsive website for SWC UK to enhance their online presence.",
}) => {
  return (
    <div className="poc-card">
      <div className="poc-header">
        <span className="poc-header-icon">
          <LayoutGrid size={16} />
        </span>
        <h3>Project Overview</h3>
      </div>

      {/* Top 4 stat boxes */}
      <div className="poc-stats-row">
        <div className="poc-stat-box">
          <div className="poc-stat-top">
            <span className="poc-stat-icon poc-stat-icon--blue">
              <Folder size={15} />
            </span>
            <span className="poc-stat-label">STATUS</span>
          </div>
          <span className="poc-stat-value">{status}</span>
        </div>

        <div className="poc-stat-box poc-stat-box--priority">
          <div className="poc-stat-top">
            <span className="poc-stat-icon poc-stat-icon--orange">
              <Flag size={15} />
            </span>
            <span className="poc-stat-label">PRIORITY</span>
          </div>
          <span className="poc-stat-value poc-stat-value--orange">{priority}</span>
        </div>

        <div className="poc-stat-box">
          <div className="poc-stat-top">
            <span className="poc-stat-icon poc-stat-icon--green">
              <Timer size={15} />
            </span>
            <span className="poc-stat-label">PROGRESS</span>
          </div>
          <span className="poc-stat-value">{progress}%</span>
        </div>

        <div className="poc-stat-box poc-stat-box--manager">
          <div className="poc-stat-top">
            <span className="poc-manager-plus">
              <Plus size={11} />
            </span>
            <span className="poc-stat-label">PROJECT MANAGER</span>
          </div>
          <div className="poc-manager-row">
            <span className="poc-manager-avatar">
              {manager.avatarUrl ? (
                <img src={manager.avatarUrl} alt={manager.name} />
              ) : (
                manager.name.charAt(0)
              )}
            </span>
            <div className="poc-manager-text">
              <span className="poc-manager-name">{manager.name}</span>
              <span className="poc-manager-code">{manager.code}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="poc-info-grid">
        <div className="poc-info-col">
          <div className="poc-info-row">
            <span className="poc-info-label">Client</span>
            <span className="poc-info-value">{client}</span>
          </div>
          <div className="poc-info-row">
            <span className="poc-info-label">Department</span>
            <span className="poc-info-value">{department}</span>
          </div>
          <div className="poc-info-row">
            <span className="poc-info-label">Budget</span>
            <span className="poc-info-value">{budget}</span>
          </div>
        </div>

        <div className="poc-info-col">
          <div className="poc-info-row">
            <span className="poc-info-label">Created On</span>
            <span className="poc-info-value">{createdOn}</span>
          </div>
          <div className="poc-info-row">
            <span className="poc-info-label">Last Updated</span>
            <span className="poc-info-value">{lastUpdated}</span>
          </div>
          <div className="poc-info-row poc-info-row--desc">
            <span className="poc-info-label">Description</span>
            <span className="poc-info-value poc-info-value--desc">{description}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewCard;