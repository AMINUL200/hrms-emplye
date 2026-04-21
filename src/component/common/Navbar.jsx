import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContex";
import { Link, useNavigate } from "react-router-dom";
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
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import BirthdayDropdown from "./BirthdayDropdown";
import NotificationDropdown from "./NotificationDropdown";
import axios from "axios";
import useNoticeListener from "../../hooks/useNoticeListener";
import { toast } from "react-toastify";
import RingtoneSelector from "./RingtoneSelector";
import { onMessage } from "firebase/messaging";
import { messaging } from "../../firebase";
import NotificationSettings from "./NotificationSettings";

// Add this CSS import for modal styles
import "./NavbarModal.css";

const Navbar = ({ toggleSidebar, isOpen }) => {
  const { logoutUser, data, token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const storage_url = import.meta.env.VITE_STORAGE_URL;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

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
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        e.target.value = "";
        return;
      }

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
          "Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX, TXT",
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

    if (!supportForm.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!supportForm.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supportForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!supportForm.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("name", supportForm.name);
      formData.append("email", supportForm.email);
      formData.append("message", supportForm.message);
      if (supportForm.image) {
        formData.append("image", supportForm.image);
      }

      const response = await axios.post(`${api_url}/raise-ticket`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === 200) {
        toast.success("Support ticket submitted successfully!");
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
      toast.error("An error occurred. Please try again.");
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
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${api_url}/emp-notification/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          t: Date.now(),
        },
      });

      console.log("Fetched notifications:", res.data);

      if (res?.data) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };
  useEffect(() => {
    fetchNotifications();
    playNotificationSound();
  }, []);

  const playNotificationSound = () => {
    let selectedTone = localStorage.getItem("selectedRingtone");

    // fallback to default if not set
    if (!selectedTone) {
      selectedTone =
        "/sounds/Doraemon Notification Ringtone Download - MobCup.Com.Co.mp3";
    }

    const audio = new Audio(selectedTone);
    audio.play().catch((err) => {
      console.warn("Audio play blocked:", err);
    });
  };

  useNoticeListener(data?.emid, data?.employee_id, (newNotification) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === newNotification.id);
      if (exists) return prev;
      return [newNotification, ...prev];
    });
    console.log("Ringtone should play for notification:", newNotification);
    playNotificationSound();
    toast.info("📢 " + newNotification.title);
  });

  const updateStatus = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 1 } : n)),
    );
  };

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      toast.info(
        payload.notification.title + " - " + payload.notification.body,
      );
    });
    return () => {
      unsubscribe();
    };
  }, []);

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

  const getFullName = () => {
    if (!data) return "Loading...";
    if (data.name) {
      return data.name;
    }
    const { emp_fname, emp_mname, emp_lname } = data;
    return [emp_fname, emp_mname, emp_lname].filter(Boolean).join(" ");
  };

  const getProfileImage = () => {
    if (data?.emp_image) {
      return `${storage_url}/${data.emp_image}`;
    }
    return "/images/profile.png";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".notification-dropdown")) {
      }
      if (!event.target.closest(".birthday-dropdown")) {
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div className="header">
        <div className="header-left">
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

          <div className={`toggle_btn sidebar-closed`} onClick={toggleSidebar}>
            <span className="bar-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        </div>

        <div className="hed-right">
          <div className="search-info">
            <button
              className="notification-btn"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              <FontAwesomeIcon icon={faGear} />
            </button>

            <button
              className="notification-btn"
              onClick={() => setShowSupport(true)}
              title="Customer Support"
            >
              <FontAwesomeIcon icon={faHeadset} />
            </button>

            <NotificationDropdown
              notifications={notifications}
              onStatusUpdate={updateStatus}
              refreshNotifications={fetchNotifications}
            />

            {/* <BirthdayDropdown birthdays={birthdays} /> */}
          </div>

          <div className="header-profile">
            <div className="dropdown mobile-user-menu">
              <a
                href="#"
                className="nav-link dropdown-toggle d-flex align-items-center"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="user-img-wrapper me-2">
                  <img
                    src={getProfileImage()}
                    alt="User Image"
                    className="user-img"
                  />
                </div>

                <div className="user-name">
                  <span>{getFullName()}</span>
                </div>

                <div className="icon">
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </div>
              </a>

              <div className="dropdown-menu dropdown-menu-right">
                <Link
                  className="dropdown-item"
                  to="/organization/employerprofile"
                >
                  Profile
                </Link>

                <a className="dropdown-item" onClick={logoutUser}>
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal with Notification Settings */}
      {showSettings && (
        <div
          className="custom-modal-overlay settings-modal-overlay"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="custom-modal settings-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-gradient settings-header">
              <div className="header-content">
                <h2>Settings</h2>
                <p>Customize your notification preferences</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowSettings(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-content-body settings-content">
              <NotificationSettings />
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupport && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowSupport(false)}
        >
          <div
            className="custom-modal support-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-gradient">
              <h2>Customer Support</h2>
              <p>Submit your issue and our team will contact you soon.</p>
              <button className="modal-close-btn" onClick={handleCloseSupport}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form
              className="support-form-modern"
              onSubmit={handleSupportSubmit}
            >
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

              {fileName && (
                <div className="file-preview-box">
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
