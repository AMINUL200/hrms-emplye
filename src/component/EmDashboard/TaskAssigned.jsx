import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faCheckCircle, 
  faClock, 
  faChartLine,
  faProjectDiagram,
  faSpinner,
  faCheckDouble
} from '@fortawesome/free-solid-svg-icons';
import './TaskAssigned.css';
import { useNavigate } from 'react-router-dom';

const TaskAssigned = () => {
  const navigate = useNavigate();
  // Sample data - you can replace this with actual data from your API
  const projectTasks = [
    {
      id: 1,
      projectName: "SponicHR – Web Version",
      incompleteTasks: 3,
      completedTasks: 7,
      totalTasks: 10
    },
    {
      id: 2,
      projectName: "Hubers Law Website",
      incompleteTasks: 4,
      completedTasks: 0,
      totalTasks: 4
    },
    {
      id: 3,
      projectName: "SWC Global",
      incompleteTasks: 2,
      completedTasks: 0,
      totalTasks: 2
    },
    {
      id: 4,
      projectName: "Hubers Law",
      incompleteTasks: 1,
      completedTasks: 0,
      totalTasks: 1
    },
    {
      id: 5,
      projectName: "One More Rep",
      incompleteTasks: 4,
      completedTasks: 0,
      totalTasks: 4
    }
  ];

  // Calculate totals
  const totals = projectTasks.reduce(
    (acc, project) => ({
      totalIncomplete: acc.totalIncomplete + project.incompleteTasks,
      totalCompleted: acc.totalCompleted + project.completedTasks,
      totalAssigned: acc.totalAssigned + project.totalTasks
    }),
    { totalIncomplete: 0, totalCompleted: 0, totalAssigned: 0 }
  );

  const completionRate = Math.round((totals.totalCompleted / totals.totalAssigned) * 100) || 0;

  return (
    <div className="task-assigned-premium">
     

      {/* Projects Table */}
      <div className="projects-section">
        <div className="section-header">
          <div className="header-icon-group">
            <FontAwesomeIcon icon={faProjectDiagram} className="section-icon" />
            <h4>Project Details</h4>
          </div>
          <span className="section-subtitle">Track your assigned tasks</span>
        </div>
        
        <div className="table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Completed Tasks</th>
                <th>Pending Tasks</th>
                <th>Total Tasks</th>
              </tr>
            </thead>
            <tbody>
              {projectTasks.map((project) => (
                <tr key={project.id}  onClick={() => navigate(`/organization/assigned-task/${project.id}`)} className="clickable-row">
                  <td className="project-cell">
                    <div className="project-info">
                      <div className="project-dot"></div>
                      <span className="project-name">{project.projectName}</span>
                    </div>
                  </td>
                  <td className="completed-cell">
                    <div className="task-stat-single">
                      <FontAwesomeIcon icon={faCheckDouble} className="stat-icon-completed" />
                      <span className="stat-value completed">{project.completedTasks}</span>
                    </div>
                  </td>
                  <td className="pending-cell">
                    <div className="task-stat-single">
                      <FontAwesomeIcon icon={faSpinner} className="stat-icon-pending" />
                      <span className="stat-value pending">{project.incompleteTasks}</span>
                    </div>
                  </td>
                  <td className="total-cell">
                    <div className="task-stat-single">
                      <FontAwesomeIcon icon={faTasks} className="stat-icon-total" />
                      <span className="stat-value total">{project.totalTasks}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskAssigned;