import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContex";
import { useNavigate } from "react-router-dom";
import {
  deFlag,
  esFlag,
  frFlag,
  logo2,
  swc_global,
  usFlag,
} from "../../assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import BirthdayDropdown from "./BirthdayDropdown";
import NotificationDropdown from "./NotificationDropdown";
import axios from "axios";
// import NotificationDropdown from '../components/NotificationDropdown';
// import BirthdayDropdown from '../components/BirthdayDropdown';

const Navbar = ({ toggleSidebar, isOpen }) => {
  const { logoutUser, data, token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const storage_url = import.meta.env.VITE_STORAGE_URL;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${api_url}/emp-notice`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params:{
            t: Date.now()
          }
        });
        
        // Make sure data exists
        if (res?.data?.status === 1) {
            console.log(res.data.data);
            
          setNotifications(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []); // Run once

  // Sample notifications data - replace with your API data
//   const [notifications] = useState([
//     {
//       id: 1,
//       title: "New Project Assignment",
//       message: "You have been assigned to Project Alpha",
//       time: "2 hours ago",
//       isRead: false,
//     },
//     {
//       id: 2,
//       title: "Meeting Reminder",
//       message: "Team standup meeting in 30 minutes",
//       time: "30 minutes ago",
//       isRead: false,
//     },
//     {
//       id: 3,
//       title: "Task Completed",
//       message: "Your task has been marked as completed",
//       time: "1 day ago",
//       isRead: true,
//     },
//   ]);

  // Sample birthday data - replace with your API data
  const [birthdays] = useState([
    {
      id: 1,
      name: "John Smith",
      image: "https://i.pravatar.cc/60?img=1",
      birthdate: "Dec 15",
      department: "Engineering",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      image: "https://i.pravatar.cc/60?img=2",
      birthdate: "Dec 15",
      department: "Marketing",
    },
    {
      id: 3,
      name: "Mike Davis",
      image: "https://i.pravatar.cc/60?img=3",
      birthdate: "Dec 16",
      department: "HR",
    },
    {
      id: 4,
      name: "Emma Wilson",
      image: "https://i.pravatar.cc/60?img=4",
      birthdate: "Dec 16",
      department: "Finance",
    },
  ]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Helper function to format employee name
  const getFullName = () => {
    if (!data) return "Loading...";
    const { emp_fname, emp_mname, emp_lname } = data;
    return [emp_fname, emp_mname, emp_lname].filter(Boolean).join(" ");
  };

  // Helper function to get profile image
  const getProfileImage = () => {
    if (data?.emp_image) {
      return `${storage_url}/${data.emp_image}`;
    }
    return "https://i.pravatar.cc/40";
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".notification-dropdown")) {
        // This will be handled within the NotificationDropdown component
      }
      if (!event.target.closest(".birthday-dropdown")) {
        // This will be handled within the BirthdayDropdown component
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        {/* Logo */}
        <div className="header-log">
          <a href="#" className="logo2">
            <img
              src={`${storage_url}/${data?.org_logo}`}
              width="100"
              height="80"
              alt="Logo"
            />
          </a>
        </div>

        {/* Toggle Button */}
        <div className={`toggle_btn sidebar-closed`} onClick={toggleSidebar}>
          <span className="bar-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
      </div>

      {/* Right Side Menu */}
      <div className="hed-right">
        <div className="search-info">
          <div className="search">
            <input type="text" placeholder={t("search")} />
            <button type="submit">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>

          <div className="dropdown lang-dropdown">
            <a className="dropdown-toggle" data-bs-toggle="dropdown">
              <img
                src={
                  i18n.language === "en"
                    ? usFlag
                    : i18n.language === "fr"
                    ? frFlag
                    : i18n.language === "es"
                    ? esFlag
                    : deFlag
                }
                width={20}
                alt=""
              />
              &nbsp;
              <span>
                {i18n.language === "en"
                  ? "English"
                  : i18n.language === "fr"
                  ? "French"
                  : i18n.language === "es"
                  ? "Spanish"
                  : "German"}
              </span>
            </a>
            <div className="dropdown-menu dropdown-menu-end">
              <a
                className="dropdown-toggle"
                data-bs-toggle="dropdown"
                style={{ color: "black" }}
                onClick={() => changeLanguage("en")}
              >
                <img src={usFlag} width={20} alt="" />
                &nbsp; English
              </a>
              <a
                href=""
                className="dropdown-item"
                onClick={() => changeLanguage("fr")}
              >
                <img src={frFlag} width={20} alt="" /> &nbsp; French
              </a>
              <a
                href=""
                className="dropdown-item"
                onClick={() => changeLanguage("es")}
              >
                <img src={esFlag} width={20} alt="" /> &nbsp; Spanish
              </a>
              <a
                href=""
                className="dropdown-item"
                onClick={() => changeLanguage("de")}
              >
                <img src={deFlag} width={20} alt="" /> &nbsp; German
              </a>
            </div>
          </div>

          {/* Use Notification Component */}
          <NotificationDropdown notifications={notifications} />

          {/* Use Birthday Component */}
          <BirthdayDropdown birthdays={birthdays} />
        </div>

        <div className="header-profile">
          <div className="dropdown mobile-user-menu">
            {/* Entire profile trigger area */}
            <a
              href="#"
              className="nav-link dropdown-toggle d-flex align-items-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {/* Profile Image */}
              <div className="user-img-wrapper me-2">
                <img
                  src={getProfileImage()}
                  alt="User Image"
                  className="user-img"
                />
              </div>

              {/* User Name */}
              <div className="user-name">
                <span>{getFullName()}</span>
              </div>

              {/* Icon */}
              <div className="icon">
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </div>
            </a>

            {/* Dropdown Menu */}
            <div className="dropdown-menu dropdown-menu-right">
              <a className="dropdown-item" onClick={() => navigate("/profile")}>
                Profile
              </a>
              <a className="dropdown-item" onClick={logoutUser}>
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
