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
  faGear,
  faHeadset,
  faPaperclip,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import BirthdayDropdown from "./BirthdayDropdown";
import NotificationDropdown from "./NotificationDropdown";
import axios from "axios";
import useNoticeListener from "../../hooks/useNoticeListener";
import { toast } from "react-toastify";
import RingtoneSelector from "./RingtoneSelector";

const Navbar = ({ toggleSidebar, isOpen }) => {
  const { logoutUser, data, token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const storage_url = import.meta.env.VITE_STORAGE_URL;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

 console.log( localStorage.getItem("selectedRingtone"));
 

  // Support form state
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    message: "",
    image: null,
  });
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill user data when support modal opens
  useEffect(() => {
    if (showSupport && data) {
      setSupportForm((prev) => ({
        ...prev,
        name: [data.emp_fname, data.emp_mname, data.emp_lname]
          .filter(Boolean)
          .join(" "),
        email: data.email || "",
      }));
    }
  }, [showSupport, data]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        e.target.value = "";
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX, TXT"
        );
        e.target.value = "";
        return;
      }

      setSupportForm((prev) => ({ ...prev, image: file }));
      setFileName(file.name);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSupportForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSupportSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!supportForm.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!supportForm.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supportForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!supportForm.message.trim()) {
      toast.error("Please enter your message");
      return;
    }
    console.log(supportForm);

    try {
      setIsSubmitting(true);

      // Create FormData object
      const formData = new FormData();
      formData.append("name", supportForm.name);
      formData.append("email", supportForm.email);
      formData.append("message", supportForm.message);
      if (supportForm.image) {
        formData.append("image", supportForm.image);
      }

      // Make API call
      const response = await axios.post(`${api_url}/raise-ticket `, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);

      if (response.data.status === 200) {
        toast.success("Support ticket submitted successfully!");

        // Reset form
        setSupportForm({
          name: "",
          email: "",
          message: "",
          image: null,
        });
        setFileName("");
        setShowSupport(false);
      } else {
        toast.error(response.data.message || "Failed to submit ticket");
      }
    } catch (error) {
      console.error("Support ticket error:", error);

      if (error.response) {
        // Server responded with error
        toast.error(error.response.data.message || "Server error occurred");
      } else if (error.request) {
        // Request made but no response
        toast.error("Network error. Please check your connection.");
      } else {
        // Something else happened
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear file
  const handleClearFile = () => {
    setSupportForm((prev) => ({ ...prev, image: null }));
    setFileName("");
    const fileInput = document.getElementById("support-file");
    if (fileInput) fileInput.value = "";
  };

  // Reset form when modal closes
  const handleCloseSupport = () => {
    setSupportForm({
      name: "",
      email: "",
      message: "",
      image: null,
    });
    setFileName("");
    setShowSupport(false);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${api_url}/emp-notice`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            t: Date.now(),
          },
        });

        // Make sure data exists
        if (res?.data?.status === 1) {
          setNotifications(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []); // Run once

  // Listen for live notification
  useNoticeListener(data.emid, data.employee_id, (newNotification) => {
    // Add new notification at top
    setNotifications((prev) => [newNotification, ...prev]);

    // Optional popup
    toast.info("📢 " + newNotification.title);
  });

  const updateStatus = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 1 } : n))
    );
  };

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
    <>
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
            {/* Settings Icon */}
            <button
              className="notification-btn"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              <FontAwesomeIcon icon={faGear} />
            </button>

            {/* Customer Support Icon */}
            <button
              className="notification-btn"
              onClick={() => setShowSupport(true)}
              title="Customer Support"
            >
              <FontAwesomeIcon icon={faHeadset} />
            </button>

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
            <NotificationDropdown
              notifications={notifications}
              onStatusUpdate={updateStatus}
            />

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
                <a
                  className="dropdown-item"
                  onClick={() => navigate("/profile")}
                >
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

      {showSettings && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="custom-modal settings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-gradient">
              <h2>Settings</h2>
              <p>Customize your notification preferences</p>
            </div>

            <div className="modal-content-body">
              <RingtoneSelector />
            </div>

            <button
              className="close-btn-modern"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSupport && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowSupport(false)}
        >
          <div
            className="custom-modal support-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header-gradient">
              <h2>Customer Support</h2>
              <p>Submit your issue and our team will contact you soon.</p>
            </div>

            {/* Modern Form */}
            <form
              className="support-form-modern "
              onSubmit={handleSupportSubmit}
            >
              {/* Name + Email Row */}
              <div className="two-column-row">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={supportForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={supportForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div className="input-group">
                <label>Message</label>
                <textarea
                  name="message"
                  placeholder="Describe your issue..."
                  value={supportForm.message}
                  onChange={handleInputChange}
                  rows="4"
                  required
                ></textarea>
              </div>

              {/* Attach File */}
              <div className="input-group">
                <label>Attach File (Optional): </label>

                <div className="file-upload-box">
                  <input
                    type="file"
                    id="support-file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="support-file" className="file-label">
                    <FontAwesomeIcon icon={faPaperclip} />
                    <span className="file-text">Choose File</span>
                  </label>
                </div>

                <small className="file-note">
                  Allowed: JPG, PNG, PDF, DOC, DOCX (Max: 5MB)
                </small>
              </div>
              {/* File Preview */}
              {fileName && (
                <div className="file-preview-box">
                  {/* If Image Preview */}
                  {supportForm.image?.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(supportForm.image)}
                      alt="Preview"
                      className="file-preview-image"
                    />
                  ) : (
                    <div className="file-preview-icon">
                      <FontAwesomeIcon icon={faPaperclip} />
                    </div>
                  )}

                  <div className="file-preview-info">
                    <p className="file-preview-name">{fileName}</p>

                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={handleClearFile}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="two-column-row">
                {/* Submit Button */}
                <button
                  type="submit"
                  className="submit-btn-modern"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
                <button
                  type="button"
                  className="close-btn-modern"
                  onClick={handleCloseSupport}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
