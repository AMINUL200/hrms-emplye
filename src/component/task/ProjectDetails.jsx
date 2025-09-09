import React from "react";
// import "./ProjectDetails.css"; // Optional: if you want separate styling

const ProjectDetails = ({ projectData }) => {
  return (
    <div className="project-details">
      <div className="project-header">
        <h2>{projectData.title}</h2>
        <span className={`project-status ${projectData.status.toLowerCase().replace(/\s+/g, '-')}`}>
          {projectData.status}
        </span>
      </div>

      <p className="project-description">{projectData.description}</p>

      <div className="project-info-section">
        <h3>Tasks</h3>
        <div className="tasks-list">
          {projectData.tasks.map((task, index) => (
            <div key={index} className="task-item">
              <h4>{task.task_name}</h4>
              <p>{task.task_desc}</p>
              <div className="task-dates">
                <span>Start: {task.start_date}</span>
                <span>End: {task.expected_end_date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="project-info-section">
        <h3>Team Members</h3>
        <div className="members-grid">
          {projectData.members.map((member, index) => (
            <div key={index} className="member-card">
              <div className="member-avatar">{member.name ? member.name.charAt(0) : 'U'}</div>
              <div className="member-info">
                <span className="member-name">{member.name || 'Unknown User'}</span>
                <span className="member-role">{member.role || 'Team Member'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;