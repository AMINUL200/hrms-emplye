import React, { useState } from "react";
import "./WorkspaceTeam.css";
import { UsersRound, Search, UserPlus, User, UserCheck, UserX } from "lucide-react";

const WorkspaceTeam = ({ teamInfo = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Get role class based on role name
  const getRoleClass = (roleName) => {
    const classMap = {
      Admin: "wst-role--admin",
      Manager: "wst-role--manager",
      Members: "wst-role--members",
      Developer: "wst-role--developer",
      Designer: "wst-role--designer",
      "Project Manager": "wst-role--manager",
      Lead: "wst-role--lead",
    };
    return classMap[roleName] || "wst-role--default";
  };

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

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case "assigned":
        return <UserCheck size={12} className="wst-status-icon wst-status--assigned" />;
      case "unassigned":
        return <UserX size={12} className="wst-status-icon wst-status--unassigned" />;
      default:
        return <User size={12} className="wst-status-icon wst-status--default" />;
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    if (!status) return "N/A";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Filter team based on search
  const filteredTeam = teamInfo.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.employee_name?.toLowerCase().includes(searchLower) ||
      member.employee_id?.toLowerCase().includes(searchLower) ||
      member.role_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="wst-card">
      <div className="wst-header">
        <div className="wst-title">
          <span className="wst-header-icon">
            <UsersRound size={16} />
          </span>
          <h3>Team Members ({teamInfo.length})</h3>
        </div>

        <div className="wst-controls">
          <div className="wst-search-box">
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="button" className="wst-add-btn">
            <UserPlus size={14} />
            Assign Member
          </button>
        </div>
      </div>

      <div className="wst-table-scroll">
        <table className="wst-table">
          <thead>
            <tr>
              <th>#</th>
              <th>EMPLOYEE</th>
              {/* <th>EMPLOYEE ID</th> */}
              <th>ROLE</th>
              <th>ASSIGNED BY</th>
              <th>ASSIGNED AT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeam.length > 0 ? (
              filteredTeam.map((member, idx) => {
                const color = getRoleColor(member.role_name);
                const initials = getInitials(member.employee_name);
                const roleClass = getRoleClass(member.role_name);

                return (
                  <tr key={member.employee_id || idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="wst-employee-cell">
                        <span className="wst-avatar" style={{ background: color }}>
                          {initials}
                        </span>
                        <span className="wst-employee-name">{member.employee_name}</span>
                      </div>
                    </td>
                    {/* <td className="wst-employee-id">{member.employee_id}</td> */}
                    <td>
                      <span className={`wst-role-badge ${roleClass}`}>
                        {member.role_name}
                      </span>
                    </td>
                    <td className="wst-assigned-by">
                      {member.assigned_by_name || "N/A"}
                    </td>
                    <td className="wst-assigned-at">
                      {formatDate(member.assigned_at)}
                    </td>
                    <td>
                      {member.status ? (
                        <span className="wst-status-badge">
                          {getStatusIcon(member.status)}
                          {getStatusLabel(member.status)}
                        </span>
                      ) : (
                        <span className="wst-status-badge wst-status--na">
                          <User size={12} />
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="wst-empty-state">
                  <div className="wst-empty-content">
                    <span className="wst-empty-icon">👥</span>
                    <p>No team members found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkspaceTeam;