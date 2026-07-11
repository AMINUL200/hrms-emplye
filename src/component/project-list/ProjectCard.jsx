import React, { useState } from "react";
import "./ProjectCard.css";
import { 
  Calendar, 
  MoreVertical, 
  Edit, 
  FolderPlus, 
  Trash2, 
  Eye,
  X,
  Calendar as CalendarIcon,
  User,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight
} from "lucide-react";

const STATUS_CLASS = {
  Active: "pc-status--active",
  Completed: "pc-status--completed",
  "On Hold": "pc-status--onhold",
  Overdue: "pc-status--overdue",
};

const PRIORITY_CLASS = {
  High: "pc-priority--high",
  Medium: "pc-priority--medium",
  Low: "pc-priority--low",
};

const PROGRESS_COLOR = {
  Active: "#6366F1",
  Completed: "#10B981",
  "On Hold": "#F59E0B",
  Overdue: "#EF4444",
};

const ProjectCard = ({ project }) => {
  const { 
    name, 
    client, 
    status, 
    priority, 
    progress, 
    dueDate, 
    team,
    description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    startDate = "2026-01-01"
  } = project;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const toggleDescription = () => {
    if (description.length > 150) {
      setPopupOpen(true);
    } else {
      setDescriptionExpanded(!descriptionExpanded);
    }
  };

  const handleAction = (action) => {
    console.log(`${action} clicked for ${name}`);
    setDropdownOpen(false);
  };

  const isLongDescription = description.length > 150;

  return (
    <>
      <div className={`pc-card pc-card--status-${status.toLowerCase().replace(' ', '')}`}>
        <div className="pc-card-top">
          <div className="pc-title-block">
            <span className="pc-name">{name}</span>
            <span className="pc-client">
              <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {client}
            </span>
          </div>
          
          <div className="pc-dropdown">
            <button 
              type="button" 
              className="pc-more-btn" 
              aria-label="More options"
              onClick={toggleDropdown}
            >
              <MoreVertical size={16} />
            </button>
            
            <div className={`pc-dropdown-menu ${dropdownOpen ? 'pc-dropdown-menu--open' : ''}`}>
              <button 
                className="pc-dropdown-item" 
                onClick={() => handleAction('edit')}
              >
                <Edit size={15} />
                Edit Project
              </button>
              <button 
                className="pc-dropdown-item" 
                onClick={() => handleAction('module')}
              >
                <FolderPlus size={15} />
                Create Module
              </button>
              <div className="pc-dropdown-divider" />
              <button 
                className="pc-dropdown-item pc-dropdown-item--danger" 
                onClick={() => handleAction('delete')}
              >
                <Trash2 size={15} />
                Delete Project
              </button>
            </div>
          </div>
        </div>

        <div className="pc-badges">
          <span className={`pc-badge ${STATUS_CLASS[status]}`}>{status}</span>
          <span className={`pc-badge ${PRIORITY_CLASS[priority]}`}>{priority}</span>
        </div>

        {/* Description */}
        <div className="pc-description">
          <p className={`pc-description-text ${descriptionExpanded ? 'pc-description-text--expanded' : ''}`}>
            {description}
          </p>
          {isLongDescription && (
            <button className="pc-see-more-btn" onClick={toggleDescription}>
              See More
              <ChevronRight size={14} style={{ display: 'inline', marginLeft: '2px' }} />
            </button>
          )}
        </div>

        <div className="pc-progress-wrap">
          <div className="pc-progress-track">
            <div
              className="pc-progress-fill"
              style={{ 
                width: `${progress}%`, 
                background: PROGRESS_COLOR[status] 
              }}
            />
          </div>
          <span className="pc-progress-pct">{progress}%</span>
        </div>

        <div className="pc-footer">
          <div className="pc-dates">
            <div className="pc-date-row">
              <CalendarIcon size={12} />
              <strong>Start:</strong> {startDate}
            </div>
            <div className="pc-date-row">
              <CalendarIcon size={12} />
              <strong>End:</strong> {dueDate}
            </div>
          </div>

          <div className="pc-footer-right">
            <div className="pc-avatars">
              {team.slice(0, 3).map((m, idx) => (
                <span key={idx} className="pc-avatar" style={{ background: m.color }}>
                  {m.initials}
                </span>
              ))}
              {team.length > 3 && (
                <span className="pc-avatar pc-avatar--extra">+{team.length - 3}</span>
              )}
            </div>
            
            <button className="pc-view-btn" onClick={() => handleAction('view')}>
              <Eye size={14} />
              View
            </button>
          </div>
        </div>
      </div>

      {/* Description Popup */}
      {popupOpen && (
        <div className="pc-popup-overlay" onClick={() => setPopupOpen(false)}>
          <div className="pc-popup" onClick={(e) => e.stopPropagation()}>
            <div className="pc-popup-header">
              <h4>{name}</h4>
              <button className="pc-popup-close" onClick={() => setPopupOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="pc-popup-description">
              {description}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectCard;