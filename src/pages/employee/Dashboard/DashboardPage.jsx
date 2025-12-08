import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCircleArrowRight,
  faClock,
  faPlus,
  faCloudUploadAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../../context/AuthContex";
import { EmployeeContext } from "../../../context/EmployeeContext";
import "./DashboardPage.css";
import EmployeeAttendance from "../Employee Attendance/EmployeeAttendance";
import EmCalendar from "../../../component/EmDashboard/Calender";
import Post from "../../../component/posts/Post";

const DashboardPage = () => {
  const navigate = useNavigate();
  const api_url = import.meta.env.VITE_API_URL;
  const { token } = useContext(AuthContext);
  const { postsData, getPostData } = useContext(EmployeeContext);

  // Card configuration with routes
  const smallCards = [
    // {
    //   id: 1,
    //   title: "Leaves",
    //   route: "/organization/leaves",
    //   icon: "📅",
    //   color: "#e3f2fd",
    // },
    // {
    //   id: 2,
    //   title: "Holidays",
    //   route: "/organization/holiday",
    //   icon: "🎉",
    //   color: "#f3e5f5",
    // },
    // {
    //   id: 3,
    //   title: "Work Update",
    //   route: "/organization/work-update",
    //   icon: "📊",
    //   color: "#e8f5e8",
    // },
    {
      id: 4,
      title: "Profile",
      route: "/organization/employerprofile",
      icon: "👤",
      color: "#fff3e0",
    },
    {
      id: 5,
      title: "Project",
      route: "organization/assigned-project",
      icon: "💼",
      color: "#e0f2f1",
    },
    {
      id: 6,
      title: "Post",
      route: "/organization/post",
      icon: "📝",
      color: "#fce4ec",
    },
  ];

  // Post related states
  const [showModal, setShowModal] = useState(false);
  const [formDataState, setFormDataState] = useState({
    content: "",
    post_file: null,
  });
  const [preview, setPreview] = useState(null);
  const [createPostLoading, setCreatePostLoading] = useState(false);

  // Alert message - you can customize this
  const alertMessage =
    "🎉 Great job! You have perfect attendance this week. Keep up the good work!";

  const handleCardClick = (route) => {
    navigate(route);
  };

  // Post handling functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Validate file type and size
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG/PNG images are allowed");
        return;
      }

      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setFormDataState((prev) => ({
        ...prev,
        post_file: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreatePostLoading(true);

    const formData = new FormData();
    formData.append("content", formDataState.content);
    formData.append("post_file", formDataState.post_file);

    try {
      const res = await axios.post(`${api_url}/emp-post`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200 && res.data.flag === 1) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to create post");
    } finally {
      // Reset
      setFormDataState({ content: "", post_file: null });
      setPreview(null);
      setShowModal(false);
      setCreatePostLoading(false);
      getPostData(token);
    }
  };

  // Load posts data on component mount
  useEffect(() => {
    if (token) {
      getPostData(token);
    }
  }, [token]);

  return (
    <div className="dashboard-page-container container-fluid p-4 pt-1">
      {/* Alert Row */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="alert-card alert-success">
            <div className="alert-content">
              <div className="alert-icon">✅</div>
              <div className="alert-message">{alertMessage}</div>
              <button className="alert-close-btn">×</button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance + Bottom Cards + Calendar Row */}
      <div className="row g-3 mb-3 align-items-stretch">
        {/* Left Column: Attendance + Leaves/Holidays/Work Update */}
        <div className="col-12 col-lg-6 d-flex flex-column justify-content-between">
          {/* Attendance */}
          <div className="dashboard-card flex-fill mb-3">
            <EmployeeAttendance />
          </div>

          {/* Small cards */}
          <div className="row g-3">
            {smallCards.slice(0, 3).map((card) => (
              <div key={card.id} className="col-12 col-md-4">
                <div
                  className="small-card dashboard-card h-100"
                  style={{ "--card-color": card.color }}
                  onClick={() => handleCardClick(card.route)}
                >
                  <div className="card-icon">{card.icon}</div>
                  <div className="card-title">{card.title}</div>
                  <div className="card-hover-effect"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="row g-3">
            {smallCards.slice(3, 6).map((card) => (
              <div key={card.id} className="col-12 col-md-4">
                <div
                  className="small-card dashboard-card h-100"
                  style={{ "--card-color": card.color }}
                  onClick={() => handleCardClick(card.route)}
                >
                  <div className="card-icon">{card.icon}</div>
                  <div className="card-title">{card.title}</div>
                  <div className="card-hover-effect"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Calendar */}
        <div className="col-12 col-lg-6 d-flex">
          <div className="dashboard-card flex-fill h-100">
            <EmCalendar />
          </div>
        </div>
      </div>

      {/* Upcoming Holiday / Statistics / Post Row */}
      <div className="row g-3 align-items-stretch">
        {/* Left Side - Upcoming Holiday + Statistics */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-between">
          {/* Upcoming Holiday */}
          <div className="dashboard-card flex-fill mb-3 flex-grow-1">
            <div className="card info-card flex-fill h-100">
              <div className="card-body d-flex flex-column">
                <h4>Upcoming Holidays</h4>
                <div className="holiday-details flex-grow-1">
                  <div className="holiday-calendar">
                    <div className="holiday-calendar-icon">
                      <FontAwesomeIcon
                        icon={faCalendarDays}
                        size="lg"
                        color="#fff"
                      />
                    </div>
                    <div
                      className="holiday-calendar-content"
                      style={{ textAlign: "center" }}
                    >
                      <h6>Ramzan</h6>
                      <p>Mon 20 May 2024</p>
                    </div>
                  </div>
                  <div className="holiday-btn mt-auto">
                    <Link to="/organization/holiday" className="btn">
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="dashboard-card flex-fill flex-grow-1">
            <div className="card flex-fill h-100">
              <div className="card-body d-flex flex-column">
                <div className="statistic-header">
                  <h4>Statistics</h4>
                  <div className="dropdown statistic-dropdown">
                    <a
                      className="dropdown-toggle"
                      data-bs-toggle="dropdown"
                      href="#"
                    >
                      TimePeriods
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a href="#" className="dropdown-item">
                        Week
                      </a>
                      <a href="#" className="dropdown-item">
                        Month
                      </a>
                      <a href="#" className="dropdown-item">
                        Year
                      </a>
                    </div>
                  </div>
                </div>
                <div className="clock-in-info flex-grow-1">
                  <div className="clock-in-content">
                    <p>WorkTime</p>
                    <h4>6 Hrs : 54 Min</h4>
                  </div>
                  <div className="clock-in-btn">
                    <a href="#" className="btn btn-primary">
                      <FontAwesomeIcon icon={faClock} /> &nbsp; ClockIn
                    </a>
                  </div>
                </div>
                <div className="clock-in-list">
                  <ul className="nav">
                    <li>
                      <p>Remaining</p>
                      <h6>2 Hrs 36 Min</h6>
                    </li>
                    <li>
                      <p>OverTime</p>
                      <h6>0 Hrs 00 Min</h6>
                    </li>
                    <li>
                      <p>Break</p>
                      <h6>1 Hrs 20 Min</h6>
                    </li>
                  </ul>
                </div>
                <div className="view-attendance mt-auto">
                  <Link to="/organization/attendance-status">
                    ViewAttendance
                    <FontAwesomeIcon
                      className="right-arr"
                      icon={faCircleArrowRight}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Post Section */}
        <div className="col-12 col-md-6 d-flex">
          <div className="dashboard-card h-100 flex-fill d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center post-header mb-3">
              <h3 className="m-0">Latest Posts</h3>
              <button
                className="btn btn-outline d-flex align-items-center gap-2 shadow-sm custom-add-post-btn"
                onClick={() => setShowModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Post
              </button>
            </div>
            <div
              className="overflow-auto custom-scrollbar flex-grow-1"
              style={{ maxHeight: "500px" }}
            >
              <Post posts={postsData} />
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Create New Post</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      Content
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="content"
                      value={formDataState.content}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="post_file" className="form-label d-block">
                      {preview ? (
                        <div
                          className="position-relative d-inline-block"
                          style={{
                            margin: "0 100px",
                          }}
                        >
                          <img
                            src={preview}
                            alt="Preview"
                            className="img-thumbnail rounded"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-icon btn-danger position-absolute top-0 end-0 translate-middle"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormDataState((prev) => ({
                                ...prev,
                                post_file: null,
                              }));
                              setPreview(null);
                              document.getElementById("post_file").value = "";
                            }}
                            style={{ height: "24px" }}
                          >
                            <FontAwesomeIcon icon={faTimes} size="xs" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="upload-placeholder d-flex flex-column align-items-center justify-content-center"
                          style={{ 
                            cursor: 'pointer',
                            border: '2px dashed #dee2e6',
                            borderRadius: '8px',
                            padding: '2rem'
                          }}
                          onClick={() => document.getElementById('post_file').click()}
                        >
                          <div className="upload-icon-circle mb-2">
                            <FontAwesomeIcon icon={faCloudUploadAlt} size="2x" className="text-muted" />
                          </div>
                          <span className="text-muted">
                            Click to upload image
                          </span>
                          <small className="text-muted">
                            (JPG, PNG - Max 5MB)
                          </small>
                        </div>
                      )}
                      <input
                        type="file"
                        className="d-none"
                        id="post_file"
                        name="post_file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={createPostLoading}
                    onClick={() => {
                      setShowModal(false);
                      setFormDataState({ content: "", post_file: null });
                      setPreview(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={createPostLoading}
                  >
                    {createPostLoading && (
                      <div 
                        className="spinner-border spinner-border-sm text-light" 
                        role="status"
                        style={{ width: "1rem", height: "1rem" }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;