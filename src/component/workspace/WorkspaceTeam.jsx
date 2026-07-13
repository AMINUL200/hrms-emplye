import React from "react";
import "./WorkspaceTeam.css";
import { UsersRound, Search, UserPlus } from "lucide-react";

const TEAM = [
  {
    id: 1,
    name: "SK Shamim",
    employeeId: "SWCS",
    initials: "SS",
    color: "#1f2333",
    role: "Project Manager",
    roleClass: "wst-role--manager",
    assignedBy: "Admin",
    assignedAt: "10 Jun 2026",
  },
  {
    id: 2,
    name: "Tanvir Hasan",
    employeeId: "SWC112",
    initials: "TH",
    color: "#2563eb",
    role: "Developer",
    roleClass: "wst-role--developer",
    assignedBy: "SK Shamim",
    assignedAt: "12 Jun 2026",
  },
  {
    id: 3,
    name: "Rafia Sultana",
    employeeId: "SWC118",
    initials: "RS",
    color: "#16a34a",
    role: "UI/UX Designer",
    roleClass: "wst-role--designer",
    assignedBy: "SK Shamim",
    assignedAt: "12 Jun 2026",
  },
  {
    id: 4,
    name: "Jakaria Ahmed",
    employeeId: "SWC121",
    initials: "JA",
    color: "#0f172a",
    role: "Frontend Developer",
    roleClass: "wst-role--developer",
    assignedBy: "Tanvir Hasan",
    assignedAt: "14 Jun 2026",
  },
];

const WorkspaceTeam = () => {
  return (
    <div className="wst-card">
      <div className="wst-header">
        <div className="wst-title">
          <span className="wst-header-icon">
            <UsersRound size={16} />
          </span>
          <h3>Team Members ({TEAM.length})</h3>
        </div>

        <div className="wst-controls">
          <div className="wst-search-box">
            <Search size={14} />
            <input type="text" placeholder="Search members..." />
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
              <th>EMPLOYEE ID</th>
              <th>ROLE</th>
              <th>ASSIGNED BY</th>
              <th>ASSIGNED AT</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m, idx) => (
              <tr key={m.id}>
                <td>{idx + 1}</td>
                <td>
                  <div className="wst-employee-cell">
                    <span className="wst-avatar" style={{ background: m.color }}>
                      {m.initials}
                    </span>
                    <span className="wst-employee-name">{m.name}</span>
                  </div>
                </td>
                <td className="wst-employee-id">{m.employeeId}</td>
                <td>
                  <span className={`wst-role-badge ${m.roleClass}`}>{m.role}</span>
                </td>
                <td className="wst-assigned-by">{m.assignedBy}</td>
                <td className="wst-assigned-at">{m.assignedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkspaceTeam;