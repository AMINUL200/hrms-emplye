import React from "react";

const OverviewComponent = ({ projectData, taskColumns, tasks, formatColumnName, getInitials }) => {
  return (
    <div className="overview-content">
      <div className="overview-grid">
        <div className="overview-card">
          <h4>Project Details</h4>
          <div className="project-details">
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="status-badge">{projectData.project.status}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Start Date:</span>
              <span className="detail-value">{projectData.project?.project_start_date}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Deadline:</span>
              <span className="detail-value">{projectData.project?.project_end_date}</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h4>Team Members</h4>
          <div className="team-members">
            {projectData.members.map((member) => (
              <div key={member.id} className="team-member">
                <div className="member-avatar">
                  {getInitials(member.name)}
                </div>
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  <div className="member-role">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="project-stats">
        {taskColumns.map(column => (
          <div key={column} className="stat-item">
            <span className="stat-value">{tasks[column]?.length || 0}</span>
            <span className="stat-label">{formatColumnName(column)}</span>
          </div>
        ))}
        <div className="stat-item">
          <span className="stat-value">{projectData.members.length}</span>
          <span className="stat-label">Team Members</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewComponent;