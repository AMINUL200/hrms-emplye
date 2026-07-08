import React from "react";
import "./ProjectTeam.css";
import { Mail, Phone, CheckCircle2, ListTodo, Users } from "lucide-react";

const TEAM = [
  {
    id: 1,
    name: "John Doe",
    employeeId: "EMP001",
    role: "Project Manager",
    initials: "JD",
    color: "#8B5CF6",
    assignedBy: "Admin",
    assignedAt: "2026-01-15",
    status: "active",
    email: "john.doe@swcglobal.com",
    phone: "+91 98765 43210",
    tasksAssigned: 12,
    tasksCompleted: 9,
  },
  {
    id: 2,
    name: "Jane Smith",
    employeeId: "EMP002",
    role: "UI/UX Designer",
    initials: "JS",
    color: "#6366F1",
    assignedBy: "Project Lead",
    assignedAt: "2026-02-01",
    status: "active",
    email: "jane.smith@swcglobal.com",
    phone: "+91 91234 56789",
    tasksAssigned: 10,
    tasksCompleted: 7,
  },
  {
    id: 3,
    name: "Mike Johnson",
    employeeId: "EMP003",
    role: "Backend Developer",
    initials: "MJ",
    color: "#0F172A",
    assignedBy: "Admin",
    assignedAt: "2026-01-20",
    status: "active",
    email: "mike.johnson@swcglobal.com",
    phone: "+91 99887 66554",
    tasksAssigned: 14,
    tasksCompleted: 6,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    employeeId: "EMP004",
    role: "QA Engineer",
    initials: "SW",
    color: "#10B981",
    assignedBy: "Project Lead",
    assignedAt: "2026-02-10",
    status: "pending",
    email: "sarah.wilson@swcglobal.com",
    phone: "+91 90000 12345",
    tasksAssigned: 8,
    tasksCompleted: 5,
  },
  {
    id: 5,
    name: "Alex Turner",
    employeeId: "EMP005",
    role: "Frontend Developer",
    initials: "AT",
    color: "#F59E0B",
    assignedBy: "Admin",
    assignedAt: "2026-01-25",
    status: "active",
    email: "alex.turner@swcglobal.com",
    phone: "+91 93456 78901",
    tasksAssigned: 11,
    tasksCompleted: 8,
  },
  {
    id: 6,
    name: "Priya Nair",
    employeeId: "EMP006",
    role: "DevOps Engineer",
    initials: "PN",
    color: "#EF4444",
    assignedBy: "Project Lead",
    assignedAt: "2026-02-05",
    status: "inactive",
    email: "priya.nair@swcglobal.com",
    phone: "+91 97654 32109",
    tasksAssigned: 6,
    tasksCompleted: 4,
  },
];

const ProjectTeam = () => {
  const getStatusBadge = (status) => {
    const statusMap = {
      active: "ptm-status-badge--active",
      inactive: "ptm-status-badge--inactive",
      pending: "ptm-status-badge--pending",
    };
    return `ptm-status-badge ${statusMap[status] || "ptm-status-badge--pending"}`;
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="ptm-card">
      <div className="ptm-header">
        <h3>Team Members</h3>
        <span className="ptm-count-badge">{TEAM.length} Members</span>
      </div>

      <div className="ptm-table-scroll">
        <table className="ptm-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Role</th>
              <th>Assigned By</th>
              <th>Assigned At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="ptm-cell-employee">
                    <span className="ptm-avatar" style={{ background: m.color }}>
                      {m.initials}
                    </span>
                    <div>
                      <div className="ptm-employee-name">{m.name}</div>
                      <div className="ptm-employee-id">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="ptm-employee-id">{m.employeeId}</span>
                </td>
                <td>
                  <span className="ptm-cell-role">{m.role}</span>
                </td>
                <td>
                  <span className="ptm-cell-assigned-by">{m.assignedBy}</span>
                </td>
                <td>
                  <span className="ptm-cell-assigned-at">{m.assignedAt}</span>
                </td>
                <td>
                  <span className={getStatusBadge(m.status)}>
                    {getStatusLabel(m.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTeam;