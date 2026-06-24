import React, { useState, useContext, useEffect } from "react";
import "./EmpCreateProject.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCalendarAlt,
  faInfoCircle,
  faTag,
  faFlag,
  faSave,
  faArrowLeft,
  faCheckCircle,
  faExclamationTriangle,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../../context/AuthContex";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import CustomTextEditor from "../../../component/common/CustomTextEditor";

const EmpCreateProject = () => {
  const { token, data: userData } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're in edit mode
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("update");
  const isEditMode = !!projectId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    identifier: "",
    status: "open",
    project_start_date: "",
    project_end_date: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [touched, setTouched] = useState({});

  // Status options
  const statusOptions = [
    { value: "open", label: "Open", color: "#ff902f" },
    { value: "in-progress", label: "In Progress", color: "#0284c7" },
    { value: "on-hold", label: "On Hold", color: "#dc2626" },
    { value: "completed", label: "Completed", color: "#16a34a" },
  ];

  // Fetch project data if in edit mode
  useEffect(() => {
    if (isEditMode && projectId) {
      fetchProjectData();
    }
  }, [isEditMode, projectId]);

  const fetchProjectData = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(`${api_url}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Project data fetched:", response.data);

      if (response.data.status === 1 && response.data.data) {
        const project = response.data.data;
        setFormData({
          title: project.title || "",
          description: project.description || "",
          identifier: project.identifier || "",
          status: project.status || "open",
          project_start_date: project.project_start_date || "",
          project_end_date: project.project_end_date || "",
        });
      } else {
        toast.error(response.data.message || "Failed to fetch project data");
        navigate("/organization/assigned-projects");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while fetching project data",
      );
      navigate("/organization/assigned-projects");
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name, formData[name]);
  };

  // Validate a single field
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "title":
        if (!value.trim()) {
          error = "Project title is required";
        } else if (value.trim().length < 3) {
          error = "Title must be at least 3 characters";
        } else if (value.trim().length > 100) {
          error = "Title must not exceed 100 characters";
        }
        break;

      case "identifier":
        if (!value.trim()) {
          error = "Project identifier is required";
        } 
        break;

      case "description":
        if (value && value.length > 500) {
          error = "Description must not exceed 500 characters";
        }
        break;

      case "project_start_date":
        if (!value) {
          error = "Start date is required";
        }
        break;

      case "project_end_date":
        if (!value) {
          error = "End date is required";
        } else if (
          formData.project_start_date &&
          value < formData.project_start_date
        ) {
          error = "End date cannot be before start date";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const fieldsToValidate = [
      "title",
      "identifier",
      "project_start_date",
      "project_end_date",
    ];
    let isValid = true;

    fieldsToValidate.forEach((field) => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      title: true,
      identifier: true,
      project_start_date: true,
      project_end_date: true,
    };
    setTouched(allTouched);

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (isEditMode) {
        // Update existing project
        response = await axios.post(
          `${api_url}/projects/update/${projectId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("Project update response:", response.data);

        if (response.data.status === 1) {
          toast.success("Project updated successfully!");
          navigate("/organization/assigned-project");
        } else {
          toast.error(response.data.message || "Failed to update project");
        }
      } else {
        // Create new project
        response = await axios.post(`${api_url}/projects`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Project creation response:", response.data);

        if (response.data.success === 1 || response.data.status === 1) {
          toast.success("Project created successfully!");
          navigate("/organization/assigned-project");
        } else {
          toast.error(response.data.message || "Failed to create project");
        }
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error(
        error.response?.data?.message ||
          `An error occurred while ${isEditMode ? "updating" : "creating"} the project. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/organization/assigned-projects");
  };

  // Get minimum end date (start date + 1 day)
  const getMinEndDate = () => {
    if (formData.project_start_date) {
      const minDate = new Date(formData.project_start_date);
      minDate.setDate(minDate.getDate() + 1);
      return minDate.toISOString().split("T")[0];
    }
    return "";
  };

  // Get today's date for min start date
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Show loading state while fetching data for edit
  if (fetchLoading) {
    return (
      <div className="emp-create-project-container">
        <div className="create-project-wrapper">
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading project data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-create-project-container">
      <div className="create-project-wrapper">
        {/* Header */}
        <div className="form-header">
          <button className="back-button" onClick={handleCancel}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Projects</span>
          </button>
          <div className="header-title">
            <h1>
              {isEditMode ? (
                <>
                  <FontAwesomeIcon icon={faEdit} className="header-icon" />
                  Edit Project
                </>
              ) : (
                "Create New Project"
              )}
            </h1>
            <p>
              {isEditMode
                ? "Update the project details below"
                : "Fill in the details to create a new project"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-left">
              {/* Title Field */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  <FontAwesomeIcon icon={faTag} />
                  <span>
                    Project Title <span className="required">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter project title"
                  className={`form-input ${touched.title && errors.title ? "error" : ""}`}
                  disabled={loading}
                />
                {touched.title && errors.title && (
                  <div className="error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{errors.title}</span>
                  </div>
                )}
                <div className="input-hint">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>Use a clear, descriptive title (3-100 characters)</span>
                </div>
              </div>

              {/* Identifier Field */}
              <div className="form-group">
                <label htmlFor="identifier" className="form-label">
                  <FontAwesomeIcon icon={faFlag} />
                  <span>
                    Project Identifier <span className="required">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., PROJ001"
                  className={`form-input ${touched.identifier && errors.identifier ? "error" : ""}`}
                  disabled={loading || isEditMode}
                  style={{ textTransform: "uppercase" }}
                />
                {touched.identifier && errors.identifier && (
                  <div className="error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{errors.identifier}</span>
                  </div>
                )}
                <div className="input-hint">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>
                    Unique identifier (3-10 uppercase letters/numbers)
                    {isEditMode && " - Cannot be changed in edit mode"}
                  </span>
                </div>
              </div>

              {/* Status Field */}
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  <FontAwesomeIcon icon={faFlag} />
                  <span>Project Status</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                  disabled={loading}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="input-hint">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>Current status of the project</span>
                </div>
              </div>

              {/* Dates */}
              <div className="date-group">
                <div className="form-group">
                  <label htmlFor="project_start_date" className="form-label">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>
                      Start Date <span className="required">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    id="project_start_date"
                    name="project_start_date"
                    value={formData.project_start_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    // min={getTodayDate()}
                    className={`form-input ${touched.project_start_date && errors.project_start_date ? "error" : ""}`}
                    disabled={loading}
                  />
                  {touched.project_start_date && errors.project_start_date && (
                    <div className="error-message">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>{errors.project_start_date}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="project_end_date" className="form-label">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>
                      End Date <span className="required">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    id="project_end_date"
                    name="project_end_date"
                    value={formData.project_end_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={getMinEndDate()}
                    className={`form-input ${touched.project_end_date && errors.project_end_date ? "error" : ""}`}
                    disabled={loading}
                  />
                  {touched.project_end_date && errors.project_end_date && (
                    <div className="error-message">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>{errors.project_end_date}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-right">
              {/* Description Field */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  <span>Project Description</span>
                </label>

                <CustomTextEditor
                  value={formData.description}
                  placeholder="Describe the project objectives, scope, key deliverables and requirements..."
                  height={300}
                  disabled={loading}
                  onChange={(content) => {
                    setFormData((prev) => ({
                      ...prev,
                      description: content,
                    }));

                    if (errors.description) {
                      setErrors((prev) => ({
                        ...prev,
                        description: "",
                      }));
                    }
                  }}
                />

                {touched.description && errors.description && (
                  <div className="error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{errors.description}</span>
                  </div>
                )}

                <div className="input-hint">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>
                    Add formatted project details, requirements, scope and
                    deliverables.
                  </span>
                </div>
              </div>

              {/* Preview Card */}
              <div className="preview-card">
                <h3>Preview</h3>
                <div className="preview-content">
                  <div className="preview-title">
                    {formData.title || "Project Title"}
                  </div>
                  <div className="preview-identifier">
                    {formData.identifier || "IDENTIFIER"}
                  </div>
                  <div className="preview-description" dangerouslySetInnerHTML={{__html:formData.description }}>
                    {/* {formData.description || "No description provided"} */}
                  </div>
                  <div className="preview-dates">
                    <span>
                      {formData.project_start_date
                        ? new Date(
                            formData.project_start_date,
                          ).toLocaleDateString()
                        : "Start Date"}
                    </span>
                    <span> → </span>
                    <span>
                      {formData.project_end_date
                        ? new Date(
                            formData.project_end_date,
                          ).toLocaleDateString()
                        : "End Date"}
                    </span>
                  </div>
                  <div className="preview-status">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor:
                          statusOptions.find((s) => s.value === formData.status)
                            ?.color + "20",
                        color: statusOptions.find(
                          (s) => s.value === formData.status,
                        )?.color,
                      }}
                    >
                      {statusOptions.find((s) => s.value === formData.status)
                        ?.label || "Open"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} />
              <span>Cancel</span>
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>
                    {isEditMode ? "Updating Project..." : "Creating Project..."}
                  </span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={isEditMode ? faEdit : faSave} />
                  <span>
                    {isEditMode ? "Update Project" : "Create Project"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmpCreateProject;
