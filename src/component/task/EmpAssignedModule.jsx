import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./EmpAssignedModule.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faUserPlus, 
  faTimes, 
  faCheckCircle, 
  faSpinner,
  faUsers,
  faSearch,
  faSave,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContex';

const EmpAssignedModule = () => {
  const { p_id, m_id } = useParams(); // projectId and moduleId
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  const [members, setMembers] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [alreadyAssignedEmployees, setAlreadyAssignedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingPermissions, setFetchingPermissions] = useState(false);

  // Check if this is from create module (no state passed) or edit mode (state passed)
  const isFromCreateModule = location.state?.isEditMode;

  // Fetch all members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${api_url}/all-members-for-project/employee`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        setMembers(response.data.members || []);
      } else {
        toast.error("Failed to fetch members");
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      toast.error(err.response?.data?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  // Fetch already assigned employees for this module
  const fetchAssignedEmployees = async () => {
    if (!isFromCreateModule && m_id) {
      setFetchingPermissions(true);
      try {
        const response = await axios.get(
          `${api_url}/project-module-permission/${m_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.status === 1) {
          const assigned = response.data.permissions || [];
          setAlreadyAssignedEmployees(assigned);
          
          // Convert assigned employees to the format expected by selectedEmployees
          const assignedMembers = assigned.map(perm => ({
            emp_code: perm.employee_id,
            emp_fname: perm.employee_name?.replace(/([A-Z])/g, ' $1').trim() || perm.employee_id,
            emp_lname: '',
            emid: perm.employee_id,
            isAlreadyAssigned: true,
            permission_id: perm.id
          }));
          
          setSelectedEmployees(assignedMembers);
        }
      } catch (err) {
        console.error("Error fetching assigned employees:", err);
        // Don't show error toast for this, just continue
      } finally {
        setFetchingPermissions(false);
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchMembers();
      if (!isFromCreateModule) {
        fetchAssignedEmployees();
      }
    }
  }, [token, m_id, isFromCreateModule]);

  const handleEmployeeSelect = (employee) => {
    if (!selectedEmployees.find(emp => emp.emp_code === employee.emp_code)) {
      setSelectedEmployees([...selectedEmployees, employee]);
      toast.success(`${employee.emp_fname} ${employee.emp_lname} added`);
    } else {
      toast.info(`${employee.emp_fname} ${employee.emp_lname} is already selected`);
    }
  };

  const handleRemoveEmployee = (empCode) => {
    setSelectedEmployees(selectedEmployees.filter(emp => emp.emp_code !== empCode));
    toast.info("Employee removed from selection");
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      toast.warning("Please select at least one employee to assign");
      return;
    }

    setSubmitting(true);
    
    try {
      const submitData = {
        project_id: parseInt(p_id),
        project_module_id: parseInt(m_id),
        employee_id: selectedEmployees.map(emp => emp.emp_code)
      };

      const response = await axios.post(
        `${api_url}/project-module-permission-create`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        toast.success("Employees assigned successfully!");
        // Navigate to project modules page
        navigate(`/organization/assigned-project/${p_id}`);
      } else {
        toast.error(response.data.message || "Failed to assign employees");
      }
    } catch (err) {
      console.error("Error assigning employees:", err);
      toast.error(err.response?.data?.message || "Failed to assign employees. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate(`/organization/assigned-project/${p_id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Filter available employees (not already selected)
  const getAvailableEmployees = () => {
    const selectedCodes = selectedEmployees.map(emp => emp.emp_code);
    return members.filter(member => !selectedCodes.includes(member.emp_code));
  };

  const filteredAvailableEmployees = getAvailableEmployees().filter(member => {
    const fullName = `${member.emp_fname} ${member.emp_lname}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           member.emp_code.toLowerCase().includes(searchLower);
  });

  const isLoading = loading || fetchingPermissions;

  return (
    <div className="emp-assigned-module-container">
      <div className="form-header">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back</span>
        </button>
        <h1>
          <FontAwesomeIcon icon={isFromCreateModule ? faUserPlus : faEdit} />
          {isFromCreateModule ? 'Assign Employees to Module' : 'Edit Module Assignments'}
        </h1>
      </div>

      <div className="form-wrapper">
        <div className="module-info-card">
          <div className="info-row">
            <span className="info-label">Project ID:</span>
            <span className="info-value">{p_id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Module ID:</span>
            <span className="info-value">{m_id}</span>
          </div>
          {!isFromCreateModule && alreadyAssignedEmployees.length > 0 && (
            <div className="info-row">
              <span className="info-label">Already Assigned:</span>
              <span className="info-value">{alreadyAssignedEmployees.length} employees</span>
            </div>
          )}
        </div>

        <div className="assign-section">
          <h2 className="section-title">
            <FontAwesomeIcon icon={faUsers} />
            Select Employees to Assign
          </h2>

          {/* Search Box */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search employees by name or employee code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Selected Employees Summary - Show at top for better visibility */}
          {selectedEmployees.length > 0 && (
            <div className="selected-summary">
              <h3>
                <FontAwesomeIcon icon={faCheckCircle} />
                Selected Employees ({selectedEmployees.length})
              </h3>
              <div className="selected-badges">
                {selectedEmployees.map((employee) => (
                  <div key={employee.emp_code} className="selected-badge">
                    <span>{employee.emp_fname} {employee.emp_lname}</span>
                    <span className="employee-code-badge">{employee.emp_code}</span>
                    {employee.isAlreadyAssigned && (
                      <span className="already-assigned-badge">Already Assigned</span>
                    )}
                    <button
                      type="button"
                      className="remove-badge"
                      onClick={() => handleRemoveEmployee(employee.emp_code)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Employees List */}
          <div className="employees-list">
            <h3>Available Employees ({filteredAvailableEmployees.length})</h3>
            <div className="employees-grid">
              {isLoading ? (
                <div className="loading-state">
                  <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner-small" />
                  <p>Loading employees...</p>
                </div>
              ) : filteredAvailableEmployees.length > 0 ? (
                filteredAvailableEmployees.map((member) => {
                  const isSelected = selectedEmployees.some(emp => emp.emp_code === member.emp_code);
                  return (
                    <div key={member.emp_code} className={`employee-card ${isSelected ? 'selected' : ''}`}>
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {member.emp_fname?.charAt(0) || 'U'}
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">
                            {member.emp_fname} {member.emp_lname}
                          </div>
                          <div className="employee-code">{member.emp_code}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`assign-btn ${isSelected ? 'assigned' : ''}`}
                        onClick={() => handleEmployeeSelect(member)}
                        disabled={isSelected}
                      >
                        {isSelected ? (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Selected
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUserPlus} />
                            Assign
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="no-results">
                  <p>
                    {searchTerm 
                      ? `No employees found matching "${searchTerm}"` 
                      : "All employees have been assigned to this module"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {/* Show Skip button only when NOT from create module */}
            {!isFromCreateModule && (
              <button type="button" className="skip-btn" onClick={handleSkip}>
                <FontAwesomeIcon icon={faTimes} />
                Skip for Now
              </button>
            )}
            <button 
              type="button" 
              className="submit-assign-btn" 
              onClick={handleSubmit}
              disabled={submitting || selectedEmployees.length === 0}
            >
              {submitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Assigning...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  {isFromCreateModule ? 'Assign & Continue' : 'Update Assignments'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpAssignedModule;