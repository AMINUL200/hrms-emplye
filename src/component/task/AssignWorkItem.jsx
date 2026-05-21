import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AssignWorkItem.css';
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
  faSitemap,
  faLayerGroup,
  faTasks,
  faList,
  faChevronDown,
  faChevronRight,
  faInfoCircle,
  faUserCheck,
  faUserTag
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContex';

const AssignWorkItem = () => {
  const { p_id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  const [workItemsList, setWorkItemsList] = useState([]);
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState("");
  const [expandedWorkItems, setExpandedWorkItems] = useState(new Set());
  const [showWorkItemSelector, setShowWorkItemSelector] = useState(false);
  
  const [members, setMembers] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [currentlyAssignedEmployees, setCurrentlyAssignedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Role states
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Fetch roles list
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await axios.get(
        `${api_url}/project-role`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 1) {
        setRoles(response.data.roles || []);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error("Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  // Fetch work items list
  const fetchWorkItemsList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${api_url}/project-tree/${p_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let workItems = [];
      if (response?.data?.data?.project?.modules) {
        workItems = response.data.data.project.modules;
      } else if (Array.isArray(response?.data?.data)) {
        workItems = response.data.data;
      }
      setWorkItemsList(workItems);
    } catch (err) {
      console.error("Error fetching work items:", err);
      toast.error("Failed to load work items");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all members
  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        `${api_url}/all-members-for-project/employee`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 1) {
        setMembers(response.data.members || []);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  // Fetch assigned employees for work item (filtered by role if selected)
  const fetchAssignedEmployeesForWorkItem = async (workItemId) => {
    try {
      let url = `${api_url}/work-item-assigned-employees/${workItemId}`;
      // If role is selected, add role_id as query parameter
      if (selectedRoleId) {
        url += `?role_id=${selectedRoleId}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === 1) {
        const assigned = response.data.employees || [];
        setCurrentlyAssignedEmployees(assigned);
        setSelectedEmployees(assigned);
        if (assigned.length > 0) {
          toast.info(`Found ${assigned.length} already assigned employee(s)`);
        } else {
          toast.info(`No employees assigned to this work item${selectedRoleId ? ' with selected role' : ''}`);
        }
      }
    } catch (err) {
      console.error("Error fetching assigned employees:", err);
      setCurrentlyAssignedEmployees([]);
      setSelectedEmployees([]);
    }
  };

  // Fetch employees filtered by role
  const fetchEmployeesByRole = async (roleId) => {
    if (!roleId) return;
    
    try {
      const response = await axios.get(
        `${api_url}/employees-by-role/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 1) {
        setMembers(response.data.employees || []);
      }
    } catch (err) {
      console.error("Error fetching employees by role:", err);
      // Fallback to all members
      fetchMembers();
    }
  };

  useEffect(() => {
    if (token && p_id) {
      fetchRoles();
      fetchWorkItemsList();
      fetchMembers();
    }
  }, [token, p_id]);

  // When role changes, refresh members list and reassign employees if work item is selected
  useEffect(() => {
    if (selectedRoleId) {
      fetchEmployeesByRole(selectedRoleId);
      const role = roles.find(r => r.id === parseInt(selectedRoleId));
      setSelectedRoleName(role ? role.name : "");
      
      // If a work item is already selected, refresh its assigned employees with the new role filter
      if (selectedWorkItemId) {
        fetchAssignedEmployeesForWorkItem(selectedWorkItemId);
      }
    } else {
      // If no role selected, fetch all members
      fetchMembers();
      setSelectedRoleName("");
      // Refresh assigned employees without role filter
      if (selectedWorkItemId) {
        fetchAssignedEmployeesForWorkItem(selectedWorkItemId);
      }
    }
  }, [selectedRoleId]);

  const handleWorkItemSelect = async (workItem) => {
    setSelectedWorkItem(workItem);
    setSelectedWorkItemId(workItem.id);
    setShowWorkItemSelector(false);
    await fetchAssignedEmployeesForWorkItem(workItem.id);
  };

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
    if (!selectedWorkItemId) {
      toast.error("Please select a work item");
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee to assign");
      return;
    }

    setAssignLoading(true);
    try {
      const assignData = {
        work_item_id: selectedWorkItemId,
        employee_ids: selectedEmployees.map(emp => emp.emp_code)
      };
      
      // Add role_id to the request body if a role is selected
      if (selectedRoleId) {
        assignData.role_id = parseInt(selectedRoleId);
      }

      console.log("Assigning with data:", assignData);
      
      const response = await axios.post(
        `${api_url}/assign-work-item`,
        assignData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Assignment response:", response.data);
      if (response.data.status === 1) {
        toast.success(`${selectedEmployees.length} employee(s) assigned successfully!`);
        // Reset form
        setSelectedWorkItem(null);
        setSelectedWorkItemId("");
        setSelectedEmployees([]);
        setCurrentlyAssignedEmployees([]);
        setSelectedRoleId(""); // Reset role selection as well
        setSelectedRoleName("");
        // Refresh work items list
        fetchWorkItemsList();
      } else {
        toast.warning("Employee assignment failed");
      }
    } catch (err) {
      console.error("Error assigning employees:", err);
      toast.error("Failed to assign employees");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleRoleChange = (e) => {
    const roleId = e.target.value;
    setSelectedRoleId(roleId);
    // Reset selected employees when role changes
    setSelectedEmployees([]);
    setCurrentlyAssignedEmployees([]);
  };

  const toggleWorkItemNode = (nodeId) => {
    const newExpanded = new Set(expandedWorkItems);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedWorkItems(newExpanded);
  };

  const renderWorkItemsTree = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`tree-node ${selectedWorkItem?.id === item.id ? "selected" : ""}`}
          onClick={() => handleWorkItemSelect(item)}
        >
          <div className="tree-node-content">
            {item.children && item.children.length > 0 && (
              <button
                className="tree-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWorkItemNode(item.id);
                }}
              >
                <FontAwesomeIcon
                  icon={
                    expandedWorkItems.has(item.id) ? faChevronDown : faChevronRight
                  }
                />
              </button>
            )}
            <FontAwesomeIcon
              icon={
                item.type === "module"
                  ? faLayerGroup
                  : item.type === "submodule"
                    ? faSitemap
                    : item.type === "task"
                      ? faTasks
                      : faList
              }
              className={`tree-icon type-${item.type}`}
            />
            <span className="tree-title">{item.title}</span>
            <span className="tree-type">{item.type}</span>
            <span className="tree-id">ID: {item.id}</span>
          </div>
        </div>
        {item.children &&
          item.children.length > 0 &&
          expandedWorkItems.has(item.id) && (
            <div className="tree-children">
              {renderWorkItemsTree(item.children, level + 1)}
            </div>
          )}
      </div>
    ));
  };

  const filteredEmployees = members.filter(member => {
    const fullName = `${member.emp_fname} ${member.emp_lname}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           member.emp_code.toLowerCase().includes(searchLower);
  });

  return (
    <div className="assign-workitem-container">
      <div className="form-header">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back</span>
        </button>
        <h1>
          <FontAwesomeIcon icon={faUserCheck} />
          Assign Employees to Work Item
        </h1>
      </div>

      <div className="form-wrapper">
        <div className="assign-workitem-content">
          {/* Role Selection Section */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faUserTag} />
              Filter by Role (Optional)
            </h2>
            
            <div className="form-group">
              <label htmlFor="role_select">
                <FontAwesomeIcon icon={faUserTag} />
                Select Role
              </label>
              <select
                id="role_select"
                className="role-select"
                value={selectedRoleId}
                onChange={handleRoleChange}
                disabled={loadingRoles}
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {selectedRoleName && (
                <small className="form-hint">
                  Showing employees with role: <strong>{selectedRoleName}</strong>
                </small>
              )}
            </div>
          </div>

          {/* Work Item Selection Section */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faSitemap} />
              Select Work Item
            </h2>

            <div className="form-group full-width">
              <div className="parent-selector">
                <input
                  type="text"
                  value={
                    selectedWorkItem
                      ? `${selectedWorkItem.title} (ID: ${selectedWorkItem.id}) - ${selectedWorkItem.type}`
                      : selectedWorkItemId
                  }
                  onClick={() => setShowWorkItemSelector(!showWorkItemSelector)}
                  placeholder="Select a work item (Module, Submodule, Task, or Subtask)"
                  readOnly
                  className="parent-input"
                />
                {showWorkItemSelector && (
                  <div className="parent-dropdown">
                    <div className="parent-dropdown-header">
                      <h4>Select Work Item</h4>
                      <button
                        type="button"
                        onClick={() => setShowWorkItemSelector(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="parent-tree">
                      {loading ? (
                        <div className="loading-state">
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <p>Loading...</p>
                        </div>
                      ) : workItemsList.length > 0 ? (
                        renderWorkItemsTree(workItemsList)
                      ) : (
                        <div className="no-data">No work items available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <small className="form-hint">
                Select the module, submodule, task, or subtask to assign employees to
              </small>
            </div>
          </div>

          {/* Currently Assigned Info */}
          {currentlyAssignedEmployees.length > 0 && (
            <div className="info-banner">
              <FontAwesomeIcon icon={faUsers} />
              <span>This work item currently has {currentlyAssignedEmployees.length} assigned employee(s)</span>
            </div>
          )}

          {/* Employee Selection Section */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faUserPlus} />
              Select Employees to Assign
            </h2>

            <div className="employee-assignment-area">
              {/* Selected Employees Summary */}
              {selectedEmployees.length > 0 && (
                <div className="selected-employees-summary">
                  <h3>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Selected Employees ({selectedEmployees.length})
                  </h3>
                  <div className="selected-badges">
                    {selectedEmployees.map((employee) => (
                      <div key={employee.emp_code} className="selected-badge">
                        <span>{employee.emp_fname} {employee.emp_lname}</span>
                        <span className="employee-code-badge">{employee.emp_code}</span>
                        {currentlyAssignedEmployees.some(emp => emp.emp_code === employee.emp_code) && (
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

              {/* Search and Add Employees */}
              <div className="add-employee-section">
                <div className="search-box-small">
                  <FontAwesomeIcon icon={faSearch} className="search-icon-small" />
                  <input
                    type="text"
                    placeholder="Search employees by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-small"
                  />
                </div>
                
                <div className="available-employees-list">
                  <h4>Available Employees ({filteredEmployees.length})</h4>
                  <div className="employees-mini-grid">
                    {filteredEmployees.slice(0, 5).map((employee) => {
                      const isSelected = selectedEmployees.some(emp => emp.emp_code === employee.emp_code);
                      return (
                        <div key={employee.emp_code} className="employee-mini-card">
                          <div className="employee-mini-info">
                            <div className="employee-mini-avatar">
                              {employee.emp_fname?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="employee-mini-name">
                                {employee.emp_fname} {employee.emp_lname}
                              </div>
                              <div className="employee-mini-code">{employee.emp_code}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`assign-mini-btn ${isSelected ? 'assigned' : ''}`}
                            onClick={() => handleEmployeeSelect(employee)}
                            disabled={isSelected}
                          >
                            {isSelected ? (
                              <FontAwesomeIcon icon={faCheckCircle} />
                            ) : (
                              <FontAwesomeIcon icon={faUserPlus} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {filteredEmployees.length > 5 && (
                    <button
                      type="button"
                      className="view-all-btn"
                      onClick={() => setShowEmployeeSelector(true)}
                    >
                      View all {filteredEmployees.length} employees
                    </button>
                  )}
                  {filteredEmployees.length === 0 && (
                    <div className="no-results">
                      <p>No employees found{selectedRoleId ? ' with selected role' : ''}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleBack}>
              Cancel
            </button>
            <button 
              type="button" 
              className="submit-btn" 
              onClick={handleSubmit}
              disabled={assignLoading || !selectedWorkItemId || selectedEmployees.length === 0}
            >
              {assignLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Assigning...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  Assign Employees
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full Employee Selection Modal */}
      {showEmployeeSelector && (
        <div className="modal-overlay" onClick={() => setShowEmployeeSelector(false)}>
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <div className="employee-modal-header">
              <h3>
                <FontAwesomeIcon icon={faUserPlus} />
                Select Employees to Assign
              </h3>
              <button onClick={() => setShowEmployeeSelector(false)}>✕</button>
            </div>
            <div className="employee-modal-search">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="employee-modal-list">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => {
                  const isSelected = selectedEmployees.some(emp => emp.emp_code === employee.emp_code);
                  return (
                    <div key={employee.emp_code} className="employee-modal-item">
                      <div className="employee-modal-info">
                        <div className="employee-modal-avatar">
                          {employee.emp_fname?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="employee-modal-name">
                            {employee.emp_fname} {employee.emp_lname}
                          </div>
                          <div className="employee-modal-code">{employee.emp_code}</div>
                        </div>
                      </div>
                      <button
                        className={`employee-modal-select ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveEmployee(employee.emp_code);
                          } else {
                            handleEmployeeSelect(employee);
                          }
                        }}
                      >
                        {isSelected ? (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Selected
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUserPlus} />
                            Select
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="no-results-modal">
                  <p>No employees found{selectedRoleId ? ' with selected role' : ''}</p>
                </div>
              )}
            </div>
            <div className="employee-modal-footer">
              <button onClick={() => setShowEmployeeSelector(false)}>Close</button>
              <button 
                className="confirm-btn"
                onClick={() => setShowEmployeeSelector(false)}
              >
                Done ({selectedEmployees.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignWorkItem;