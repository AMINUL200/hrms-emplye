import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleRight,
  faCube,
  faTachometerAlt,
  faUser,
  faCalendarCheck,
  faCalendarAlt,
  faClipboardList,
  faBriefcase,
  faSignOutAlt,
  faUmbrellaBeach,
  faTasks,
  faNewspaper,
  faInfoCircle,
  faQuestionCircle,
  faCog,
  faUsers,
  faChartBar,
  faFileAlt,
  faBell,
  faPlusCircle,
  faListAlt,
  faProjectDiagram

} from '@fortawesome/free-solid-svg-icons';
import { logo, logo2 } from '../../assets';

const Sidebar = ({ isOpen, toggleSidebar, isMediumScreen, isSmallScreen }) => {
  const [openMenu, setOpenMenu] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // Enhanced menu configuration array supporting different types
  const menuItems = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      path: '/organization/employerdashboard',
      icon: faCube,
      type: 'single'
    },
    {
      key: 'profile',
      title: 'View Profile',
      path: '/organization/employerprofile',
      icon: faUser,
      type: 'single'
    },
    {
      key: 'attendance',
      title: 'Attendance',
      icon: faUsers,
      type: 'dropdown',
      submenu: [
        {
          title: 'Add Attendance',
          path: '/organization/employee-attendance',
          icon: faCalendarCheck,
          type: 'single'
        },
        {
          title: 'Attendance Status',
          path: '/organization/attendance-status',
          icon: faClipboardList,
          type: 'single'
        }
      ]
    },
    {
      key: 'work-management',
      title: 'Work Management',
      icon: faTasks,
      type: 'dropdown',
      submenu: [
        {
          title: 'Work Update List',
          path: '/organization/work-update',
          icon: faClipboardList,
          type: 'single'
        },
        {
          title: 'Add Work Report',
          path: '/organization/add-work-update',
          icon: faPlusCircle,
          type: 'single'
        },
      ]
    },
    {
      key: 'leave-management',
      title: 'Leave Management',
      icon: faBriefcase,
      type: 'dropdown',
      submenu: [
        {
          title: 'Leave Apply',
          path: '/organization/leaves',
          icon: faClipboardList,
          type: 'single'
        },
        {
          title: 'Leave List',
          path: '/organization/leave-list',
          icon: faListAlt,
          type: 'single'
        }
      ]
    },
    {
      key: 'assign-project',
      title: 'Assign Project',
      path: '/organization/assigned-project',
      icon: faProjectDiagram,
      type: 'single'
    },
    {
      key: 'calendar-holidays',
      title: 'Calendar & Holidays',
      icon: faCalendarAlt,
      type: 'multilevel',
      submenu: [
        {
          title: 'Holiday Calendar',
          path: '/organization/holiday',
          icon: faCalendarAlt,
          type: 'single'
        },
        {
          title: 'Holiday Management',
          icon: faUmbrellaBeach,
          type: 'dropdown',
          submenu: [
            {
              title: 'Holiday List',
              path: '/organization/holiday-list',
              icon: faUmbrellaBeach,
              type: 'single'
            },
            {
              title: 'Holiday Apply',
              path: '/organization/holiday-apply',
              icon: faChartBar,
              type: 'single'
            }
          ]
        }
      ]
    },
    {
      key: 'post',
      title: 'Post',
      path: '/organization/post',
      icon: faNewspaper,
      type: 'single'
    }
  ];
  // Handle menu item clicks on small screens - close sidebar after selection
  const handleMenuItemClick = () => {
    if (isSmallScreen) {
      toggleSidebar();
    }
  };

  const toggleSubMenu = (menuKey) => {
    setOpenMenu((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Check if a menu item is active based on current path
  const isMenuItemActive = (menuPath) => {
    if (!menuPath) return false;
    return location.pathname.startsWith(menuPath);
  };

  // Check if any submenu item is active (for parent highlighting)
  const hasActiveSubmenu = (submenu) => {
    if (!submenu) return false;
    return submenu.some(item => {
      if (item.path && isMenuItemActive(item.path)) return true;
      if (item.submenu) return hasActiveSubmenu(item.submenu);
      return false;
    });
  };

  // Render submenu items recursively
  const renderSubmenu = (submenu, level = 1) => {
    return submenu.map((item, index) => {
      const itemKey = `${item.title}-${level}-${index}`;

      if (item.type === 'single') {
        // Single link item
        return (
          <li key={itemKey}
          // style={{ paddingLeft: `${level * 15}px` }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={handleMenuItemClick}
            >
              <FontAwesomeIcon icon={item.icon} className="submenu-icon" />
              <span>{item.title}</span>
            </NavLink>
          </li>
        );
      } else if (item.type === 'dropdown' || item.type === 'multilevel') {
        // Nested dropdown item
        return (
          <li
            key={itemKey}
            className={`has-dropdown nested-dropdown ${hasActiveSubmenu(item.submenu) ? 'active-parent' : ''}`}
          // style={{ paddingLeft: `${(level - 1) * 15}px` }}
          >
            <a
              className='side-title nested-title'
              onClick={() => toggleSubMenu(itemKey)}
            // style={{ paddingLeft: `${level * 15}px` }}
            >
              <span className="menu-icon">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <span className="menu-text">{item.title}</span>
              <span className={`menu-arrow ${openMenu[itemKey] ? 'rotate' : 'un-rotate'}`}>
                <FontAwesomeIcon icon={faAngleRight} />
              </span>
            </a>
            <ul className={`submenu nested-submenu ${openMenu[itemKey] ? 'submenu-open' : ""}`}>
              {item.submenu && renderSubmenu(item.submenu, level + 1)}
            </ul>
          </li>
        );
      }

      return null;
    });
  };

  return (
    <div
      className={`sidebar 
        ${isOpen ? 'visible' : 'not-visible'} 
        ${isMediumScreen ? 'medium-screen' : ''}
        ${isSmallScreen ? 'small-screen' : ''}
        ${isHovered ? 'hovered' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar-inner">
        <div className="sidebar-menu">
          {/* <div className="sidebar-header">
            <div className="logo-container">
              <span className="logo-icon">
                <FontAwesomeIcon icon={faCube} />
              </span>
              <span className="logo-text">Employ Access</span>
            </div>
          </div> */}

          <ul className="sidebar-menu-vertical">
            <li className="menu-title">
              <span>Main</span>
            </li>

            {/* Render menu items from configuration array */}
            {menuItems.map((menuItem) => {
              if (menuItem.type === 'single') {
                // Direct single link
                return (
                  <li key={menuItem.key} className="menu-item">
                    <NavLink
                      to={menuItem.path}
                      className={({ isActive }) =>
                        `side-title ${isActive ? 'active' : ''}`
                      }
                      onClick={handleMenuItemClick}
                    >
                      <span className="menu-icon">
                        <FontAwesomeIcon icon={menuItem.icon} />
                      </span>
                      <span className="menu-text">{menuItem.title}</span>
                    </NavLink>
                  </li>
                );
              } else if (menuItem.type === 'dropdown' || menuItem.type === 'multilevel') {
                // Dropdown menu item
                return (
                  <li
                    key={menuItem.key}
                    className={`has-dropdown ${(menuItem.path && isMenuItemActive(menuItem.path)) || hasActiveSubmenu(menuItem.submenu)
                      ? 'active-parent'
                      : ''
                      }`}
                  >
                    <a className='side-title' onClick={() => toggleSubMenu(menuItem.key)}>
                      <span className="menu-icon">
                        <FontAwesomeIcon icon={menuItem.icon} />
                      </span>
                      <span className="menu-text">{menuItem.title}</span>
                      <span className={`menu-arrow ${openMenu[menuItem.key] ? 'rotate' : 'un-rotate'}`}>
                        <FontAwesomeIcon icon={faAngleRight} />
                      </span>
                    </a>
                    <ul className={`submenu ${openMenu[menuItem.key] ? 'submenu-open' : ""}`}>
                      {menuItem.submenu && renderSubmenu(menuItem.submenu)}
                    </ul>
                  </li>
                );
              }

              return null;
            })}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <hr className="sidebar-divider" />

          {/* Footer logo and version info */}
          <div className="sidebar-footer-bottom">
            <div className="footer-logo">
              <img src={logo} width="50" height="50" alt="Logo" />
              <span>Develop By</span>
              <img src={logo2} width="50" height="50" alt="Logo" />
            </div>
            <div className="footer-version">&copy; 2025 SponicHR. All rights reserved.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;