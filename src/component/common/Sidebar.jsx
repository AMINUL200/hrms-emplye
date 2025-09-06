import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faCube } from '@fortawesome/free-solid-svg-icons';
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [openMenu, setOpenMenu] = useState({});

  const toggleSubMenu = (menuKey) => {
    setOpenMenu((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  return (
    <div className={`sidebar ${isOpen ? 'visible' : 'not-visible'}`} id="sidebar">
      <div className="sidebar-inner slimscroll">
        <div id="sidebar-menu" className="sidebar-menu">
          <ul className="sidebar-menu-vertical">
            <li className="menu-title">
              <span>Main</span>
            </li>

            {/* Dashboard Section */}
            <li className={`has-dropdown ${location.pathname.startsWith('/organization') ? 'active-parent' : ''}`}>
              <a className='side-title' onClick={() => toggleSubMenu('dashboard')}>
                <FontAwesomeIcon icon={faCube} />
                <span> Employ Access Value</span>
                <span className={`menu-arrow ${openMenu.dashboard ? 'rotate' : 'un-rotate'}`}>
                  <FontAwesomeIcon icon={faAngleRight} />
                </span>
              </a>
              <ul className={`submenu ${openMenu.dashboard ? 'submenu-open' : ""}`}>
                <li>
                  <NavLink
                    to="/organization/employerdashboard"
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/organization/employee-attendance"
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Employee Attendance
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/organization/employerprofile"
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    View Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/organization/holiday"
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Holiday Calendar
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/organization/holiday-list"
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Holiday Apply
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/organization/work-update"
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                     Work Update
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/organization/leaves"
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Leave Apply
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/organization/attendance-status"
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Attendance Status
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/organization/post"
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Post
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Apps Section */}
            {/* <li className={`has-dropdown ${location.pathname.startsWith('/apps') ? 'active-parent' : ''}`}>
              <a className='side-title' onClick={() => toggleSubMenu('apps')}>
                <span> Apps</span>
                <span className={`menu-arrow ${openMenu.apps ? 'rotate' : 'un-rotate'}`}>
                  <FontAwesomeIcon icon={faAngleRight} />
                </span>
              </a>
              <ul className={`submenu ${openMenu.apps ? 'submenu-open' : ""}`}>
                <li className="has-dropdown">
                  <a className='side-title' onClick={() => toggleSubMenu('calls')}>
                    <span> Calls</span>
                    <span className={`menu-arrow ${openMenu.calls ? 'rotate' : 'un-rotate'}`} style={{ marginRight: "10px" }}>
                      <FontAwesomeIcon icon={faAngleRight} />
                    </span>
                  </a>
                  <ul className={`submenu ${openMenu.calls ? 'submenu-open' : ""}`}>
                    <li>
                      <NavLink
                        to="/apps/voice-call"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                      >
                        Voice Call
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/apps/video-call"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                      >
                        Video Call
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/apps/outgoing-call"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                      >
                        Outgoing Call
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/apps/incoming-call"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                      >
                        Incoming Call
                      </NavLink>
                    </li>
                  </ul>
                </li>
                <li>
                  <NavLink
                    to="/apps/chat"
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    Chat
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/apps/calendar"
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    Calendar
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/apps/contacts"
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    Contacts
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/apps/email"
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    Email
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/apps/file-manager"
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    File Manager
                  </NavLink>
                </li>
              </ul>
            </li> */}


          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;