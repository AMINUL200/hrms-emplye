import React from "react";
import "./TeamMembersPanel.css";
import { UsersRound, ArrowRight, User, UserCheck, UserX } from "lucide-react";

const TeamMembersPanel = ({ teamInfo = [], onTabChange }) => {
  // Get color based on role
  const getRoleColor = (roleName) => {
    const colorMap = {
      Admin: "#8B5CF6",
      Manager: "#6366F1",
      Members: "#10B981",
      Developer: "#2563eb",
      Designer: "#16a34a",
      "Project Manager": "#0F172A",
      Lead: "#F59E0B",
    };
    return colorMap[roleName] || "#64748B";
  };

  // Get badge class based on role
  const getBadgeClass = (roleName) => {
    const classMap = {
      Admin: "tmp-badge--admin",
      Manager: "tmp-badge--manager",
      Members: "tmp-badge--members",
      Developer: "tmp-badge--developer",
      Designer: "tmp-badge--designer",
      "Project Manager": "tmp-badge--manager",
      Lead: "tmp-badge--lead",
    };
    return classMap[roleName] || "tmp-badge--default";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case "assigned":
        return <UserCheck size={12} className="tmp-status-icon tmp-status--assigned" />;
      case "unassigned":
        return <UserX size={12} className="tmp-status-icon tmp-status--unassigned" />;
      default:
        return <User size={12} className="tmp-status-icon tmp-status--default" />;
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    if (!status) return "N/A";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Handle View All click - switch to team tab
  const handleViewAll = () => {
    if (onTabChange) {
      onTabChange('team');
    }
  };

  // Handle View All link click
  const handleViewAllLink = (e) => {
    e.preventDefault();
    if (onTabChange) {
      onTabChange('team');
    }
  };

  // Limit to 4 members
  const displayMembers = teamInfo.slice(0, 4);
  const totalMembers = teamInfo.length;
  const hasMore = totalMembers > 4;

  return (
    <div className="tmp-card">
      <div className="tmp-header">
        <div className="tmp-title">
          <span className="tmp-header-icon">
            <UsersRound size={16} />
          </span>
          <h3>Team Members ({totalMembers})</h3>
        </div>
        <button 
          type="button" 
          className="tmp-view-all-btn"
          onClick={handleViewAll}
        >
          View All
        </button>
      </div>

      <div className="tmp-list">
        {displayMembers.length > 0 ? (
          displayMembers.map((member, index) => {
            const color = getRoleColor(member.role_name);
            const initials = getInitials(member.employee_name);
            const badgeClass = getBadgeClass(member.role_name);

            return (
              <div className="tmp-row" key={member.employee_id || index}>
                <span className="tmp-avatar" style={{ background: color }}>
                  {initials}
                </span>
                <div className="tmp-info">
                  <span className="tmp-name">{member.employee_name}</span>
                  <span className="tmp-role">
                    {member.role_name}
                    {member.assigned_by_name && (
                      <span className="tmp-assigned-by">
                        &nbsp;· Assigned by {member.assigned_by_name}
                      </span>
                    )}
                  </span>
                </div>
                <div className="tmp-right">
                  <span className={`tmp-badge ${badgeClass}`}>
                    {member.role_name}
                  </span>
                  {member.status && (
                    <span className="tmp-status-badge">
                      {getStatusIcon(member.status)}
                      {getStatusLabel(member.status)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="tmp-empty-state">
            <span className="tmp-empty-icon">👥</span>
            <p className="tmp-empty-text">No team members assigned</p>
          </div>
        )}
      </div>

      {hasMore && (
        <a 
          href="#!" 
          className="tmp-view-all-link"
          onClick={handleViewAllLink}
        >
          View All {totalMembers} Team Members
          <ArrowRight size={14} />
        </a>
      )}
    </div>
  );
};

export default TeamMembersPanel;