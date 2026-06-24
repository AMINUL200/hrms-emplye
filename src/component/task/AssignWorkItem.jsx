import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "./AssignWorkItem.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  faUserTag,
  faUserFriends,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContex";

const AssignWorkItem = () => {
  const { p_id } = useParams();
  const [searchParams] = useSearchParams();

  const workItemIdFromUrl = searchParams.get("workitem_id");

  const typeFromUrl = searchParams.get("type");
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
  const [currentlyAssignedEmployees, setCurrentlyAssignedEmployees] = useState(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Member type selection (Employee or Guest)
  const [memberType, setMemberType] = useState("employee"); // "employee" or "guest"

  // Role states
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(false);

  const findWorkItemById = (items, targetId) => {
    for (const item of items) {
      if (item.id === Number(targetId)) {
        return item;
      }

      if (item.children?.length) {
        const found = findWorkItemById(item.children, targetId);

        if (found) return found;
      }
    }

    return null;
  };
  const autoExpandParents = (items, targetId, parents = []) => {
    for (const item of items) {
      const newParents = [...parents, item.id];

      if (item.id === Number(targetId)) {
        setExpandedWorkItems(new Set(newParents));

        return true;
      }

      if (item.children?.length) {
        const found = autoExpandParents(item.children, targetId, newParents);

        if (found) return true;
      }
    }

    return false;
  };
  // Fetch roles list
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await axios.get(`${api_url}/project-role`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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
      const response = await axios.get(`${api_url}/project-tree/${p_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

  // Fetch members based on type (employee or guest)
  const fetchMembers = async (type) => {
    try {
      let endpoint = "";
      if (type === "employee") {
        endpoint = `${api_url}/all-members-for-project/employee`;
      } else {
        endpoint = `${api_url}/all-members-for-project/guest`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === 1) {
        const membersData = response.data.members || [];

        // Transform guest data to match employee structure for consistent handling
        if (type === "guest") {
          const transformedGuests = membersData.map((guest) => ({
            emp_code: guest.guest_id,
            emp_fname: guest.name.split(" ")[0] || guest.name,
            emp_lname: guest.name.split(" ").slice(1).join(" ") || "",
            name: guest.name,
            email: guest.email,
            emid: guest.emid,
            company_name: guest.company_name,
            designation: guest.designation,
            isGuest: true,
          }));
          setMembers(transformedGuests);
        } else {
          setMembers(membersData.map((emp) => ({ ...emp, isGuest: false })));
        }
      }
    } catch (err) {
      console.error(`Error fetching ${type}s:`, err);
      toast.error(`Failed to load ${type}s`);
      setMembers([]);
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
          toast.info(
            `No employees assigned to this work item${selectedRoleId ? " with selected role" : ""}`,
          );
        }
      }
    } catch (err) {
      console.error("Error fetching assigned employees:", err);
      setCurrentlyAssignedEmployees([]);
      setSelectedEmployees([]);
    }
  };

  // Fetch employees filtered by role (only for employee type)
  const fetchEmployeesByRole = async (roleId) => {
    if (!roleId) return;

    // Roles only apply to employees, not guests
    if (memberType === "guest") {
      toast.info("Role filtering is only available for employees");
      return;
    }

    try {
      const response = await axios.get(
        `${api_url}/employees-by-role/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.status === 1) {
        setMembers(response.data.employees || []);
      }
    } catch (err) {
      console.error("Error fetching employees by role:", err);
      // Fallback to all members
      fetchMembers(memberType);
    }
  };

  useEffect(() => {
    if (token && p_id) {
      fetchRoles();
      fetchWorkItemsList();
      fetchMembers(memberType);
    }
  }, [token, p_id]);

  // When member type changes, refresh members list
  useEffect(() => {
    if (memberType === "guest") {
      // Clear role selection when switching to guests (roles don't apply to guests)
      setSelectedRoleId("");
      setSelectedRoleName("");
    }
    fetchMembers(memberType);
    // Reset selected employees when switching types
    setSelectedEmployees([]);
    setCurrentlyAssignedEmployees([]);
  }, [memberType]);

  // When role changes, refresh members list and reassign employees if work item is selected
  useEffect(() => {
    if (selectedRoleId && memberType === "employee") {
      fetchEmployeesByRole(selectedRoleId);
      const role = roles.find((r) => r.id === parseInt(selectedRoleId));
      setSelectedRoleName(role ? role.name : "");

      // If a work item is already selected, refresh its assigned employees with the new role filter
      if (selectedWorkItemId) {
        fetchAssignedEmployeesForWorkItem(selectedWorkItemId);
      }
    } else if (!selectedRoleId) {
      // If no role selected, fetch all members based on current type
      fetchMembers(memberType);
      setSelectedRoleName("");
      // Refresh assigned employees without role filter
      if (selectedWorkItemId) {
        fetchAssignedEmployeesForWorkItem(selectedWorkItemId);
      }
    }
  }, [selectedRoleId]);

  useEffect(() => {
    if (workItemsList.length > 0 && workItemIdFromUrl) {
      const foundItem = findWorkItemById(workItemsList, workItemIdFromUrl);

      if (foundItem) {
        setSelectedWorkItem(foundItem);

        setSelectedWorkItemId(foundItem.id);

        fetchAssignedEmployeesForWorkItem(foundItem.id);

        // AUTO EXPAND PARENT TREE
        autoExpandParents(workItemsList, foundItem.id);
      }
    }
  }, [workItemsList]);
  const handleWorkItemSelect = async (workItem) => {
    setSelectedWorkItem(workItem);
    setSelectedWorkItemId(workItem.id);
    setShowWorkItemSelector(false);
    await fetchAssignedEmployeesForWorkItem(workItem.id);
  };

  const handleEmployeeSelect = (employee) => {
    const identifier = employee.isGuest ? employee.emp_code : employee.emp_code;
    if (
      !selectedEmployees.find(
        (emp) => (emp.isGuest ? emp.emp_code : emp.emp_code) === identifier,
      )
    ) {
      setSelectedEmployees([...selectedEmployees, employee]);
      const displayName = employee.isGuest
        ? employee.name
        : `${employee.emp_fname} ${employee.emp_lname}`;
      toast.success(`${displayName} added`);
    } else {
      const displayName = employee.isGuest
        ? employee.name
        : `${employee.emp_fname} ${employee.emp_lname}`;
      toast.info(`${displayName} is already selected`);
    }
  };

  const handleRemoveEmployee = (identifier, isGuest) => {
    setSelectedEmployees(
      selectedEmployees.filter(
        (emp) => (emp.isGuest ? emp.emp_code : emp.emp_code) !== identifier,
      ),
    );
    toast.info(`${isGuest ? "Guest" : "Employee"} removed from selection`);
  };

  const handleSubmit = async () => {
    if (!selectedWorkItemId) {
      toast.error("Please select a work item");
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee/guest to assign");
      return;
    }

    setAssignLoading(true);
    try {
      const assignData = {
        work_item_id: selectedWorkItemId,
        // Send appropriate identifiers based on member type
        employee_ids: selectedEmployees.map((emp) =>
          emp.isGuest ? emp.emp_code : emp.emp_code,
        ),
        member_type: memberType, // Add member type to the request
      };

      // Add role_id to the request body if a role is selected (only for employees)
      if (selectedRoleId && memberType === "employee") {
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
        },
      );
      console.log("Assignment response:", response);
      if (response.data.status === 1) {
        toast.success(
          `${selectedEmployees.length} ${memberType}(s) assigned successfully!`,
        );
        // Reset form
        setSelectedWorkItem(null);
        setSelectedWorkItemId("");
        setSelectedEmployees([]);
        setCurrentlyAssignedEmployees([]);
        setSelectedRoleId(""); // Reset role selection as well
        setSelectedRoleName("");
        // Refresh work items list
        fetchWorkItemsList();
        navigate(`/organization/workspace/${p_id}`)
      } else {
        toast.warning(`${response.data.message || "Assignment failed"}`);
      }
    } catch (err) {
      console.error("Error assigning:", err);
      toast.error(`Failed to assign ${memberType}s`);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(`/organization/workspace/${p_id}`);
  };

  const handleRoleChange = (e) => {
    const roleId = e.target.value;
    setSelectedRoleId(roleId);
    // Reset selected employees when role changes
    setSelectedEmployees([]);
    setCurrentlyAssignedEmployees([]);
  };

  const handleMemberTypeChange = (e) => {
    setMemberType(e.target.value);
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
                    expandedWorkItems.has(item.id)
                      ? faChevronDown
                      : faChevronRight
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

  const getDisplayName = (member) => {
    if (member.isGuest) {
      return member.name || `${member.emp_fname} ${member.emp_lname}`;
    }
    return `${member.emp_fname} ${member.emp_lname}`;
  };

  const getDisplayCode = (member) => {
    if (member.isGuest) {
      return member.email || member.emp_code;
    }
    return member.emp_code;
  };

  const getDisplayRole = (member) => {
    if (member.isGuest) {
      return member.designation || "Guest";
    }
    return "Employee";
  };

  const filteredMembers = members.filter((member) => {
    const fullName = getDisplayName(member).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      getDisplayCode(member).toLowerCase().includes(searchLower)
    );
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
          Assign {memberType === "employee" ? "Employees" : "Guests"} to Work
          Item
        </h1>
      </div>

      <div className="form-wrapper">
        <div className="assign-workitem-content">
          {/* Member Type Selection Section */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faUserFriends} />
              Select Member Type
            </h2>

            <div className="form-group">
              <label htmlFor="member_type_select">
                <FontAwesomeIcon
                  icon={memberType === "employee" ? faUser : faUserFriends}
                />
                Member Type
              </label>
              <select
                id="member_type_select"
                className="role-select"
                value={memberType}
                onChange={handleMemberTypeChange}
              >
                <option value="employee">
                  <FontAwesomeIcon icon={faUser} /> Employees
                </option>
                <option value="guest">
                  <FontAwesomeIcon icon={faUserFriends} /> Guests
                </option>
              </select>
              <small className="form-hint">
                {memberType === "employee"
                  ? "Assign internal employees to work items"
                  : "Assign external guests/contractors to work items"}
              </small>
            </div>
          </div>

          {/* Role Selection Section - Only show for Employees */}
          {memberType === "employee" && (
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
                    Showing employees with role:{" "}
                    <strong>{selectedRoleName}</strong>
                  </small>
                )}
              </div>
            </div>
          )}

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
                Select the module, submodule, task, or subtask to assign{" "}
                {memberType}s to
              </small>
            </div>
          </div>

          {/* Currently Assigned Info */}
          {currentlyAssignedEmployees.length > 0 && (
            <div className="info-banner">
              <FontAwesomeIcon icon={faUsers} />
              <span>
                This work item currently has {currentlyAssignedEmployees.length}{" "}
                assigned {memberType}(s)
              </span>
            </div>
          )}

          {/* Member Selection Section */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faUserPlus} />
              Select {memberType === "employee" ? "Employees" : "Guests"} to
              Assign
            </h2>

            <div className="employee-assignment-area">
              {/* Selected Members Summary */}
              {selectedEmployees.length > 0 && (
                <div className="selected-employees-summary">
                  <h3>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Selected{" "}
                    {memberType === "employee" ? "Employees" : "Guests"} (
                    {selectedEmployees.length})
                  </h3>
                  <div className="selected-badges">
                    {selectedEmployees.map((employee) => (
                      <div
                        key={
                          employee.isGuest
                            ? employee.emp_code
                            : employee.emp_code
                        }
                        className="selected-badge"
                      >
                        <span>{getDisplayName(employee)}</span>
                        <span className="employee-code-badge">
                          {getDisplayCode(employee)}
                        </span>
                        {employee.isGuest && (
                          <span className="guest-badge">Guest</span>
                        )}
                        {currentlyAssignedEmployees.some(
                          (emp) =>
                            (emp.isGuest ? emp.emp_code : emp.emp_code) ===
                            (employee.isGuest
                              ? employee.emp_code
                              : employee.emp_code),
                        ) && (
                          <span className="already-assigned-badge">
                            Already Assigned
                          </span>
                        )}
                        <button
                          type="button"
                          className="remove-badge"
                          onClick={() =>
                            handleRemoveEmployee(
                              employee.isGuest
                                ? employee.emp_code
                                : employee.emp_code,
                              employee.isGuest,
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search and Add Members */}
              <div className="add-employee-section">
                <div className="search-box-small">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="search-icon-small"
                  />
                  <input
                    type="text"
                    placeholder={`Search ${memberType === "employee" ? "employees" : "guests"} by name or ${memberType === "employee" ? "code" : "email"}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-small"
                  />
                </div>

                <div className="available-employees-list">
                  <h4>
                    Available{" "}
                    {memberType === "employee" ? "Employees" : "Guests"} (
                    {filteredMembers.length})
                  </h4>
                  <div className="employees-mini-grid">
                    {filteredMembers.slice(0, 5).map((member) => {
                      const identifier = member.isGuest
                        ? member.emp_code
                        : member.emp_code;
                      const isSelected = selectedEmployees.some(
                        (emp) =>
                          (emp.isGuest ? emp.emp_code : emp.emp_code) ===
                          identifier,
                      );
                      return (
                        <div key={identifier} className="employee-mini-card">
                          <div className="employee-mini-info">
                            <div className="employee-mini-avatar">
                              {getDisplayName(member).charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="employee-mini-name">
                                {getDisplayName(member)}
                                {member.isGuest && (
                                  <span className="guest-indicator">
                                    {" "}
                                    (Guest)
                                  </span>
                                )}
                              </div>
                              <div className="employee-mini-code">
                                {getDisplayCode(member)}
                              </div>
                              {member.isGuest && member.company_name && (
                                <div className="employee-mini-company">
                                  {member.company_name}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`assign-mini-btn ${isSelected ? "assigned" : ""}`}
                            onClick={() => handleEmployeeSelect(member)}
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
                  {filteredMembers.length > 5 && (
                    <button
                      type="button"
                      className="view-all-btn"
                      onClick={() => setShowEmployeeSelector(true)}
                    >
                      View all {filteredMembers.length}{" "}
                      {memberType === "employee" ? "employees" : "guests"}
                    </button>
                  )}
                  {filteredMembers.length === 0 && (
                    <div className="no-results">
                      <p>
                        No {memberType === "employee" ? "employees" : "guests"}{" "}
                        found
                        {selectedRoleId && memberType === "employee"
                          ? " with selected role"
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="submit-btn"
              onClick={handleSubmit}
              disabled={
                assignLoading ||
                !selectedWorkItemId ||
                selectedEmployees.length === 0
              }
            >
              {assignLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Assigning...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  Assign {memberType === "employee" ? "Employees" : "Guests"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full Member Selection Modal */}
      {showEmployeeSelector && (
        <div
          className="modal-overlay"
          onClick={() => setShowEmployeeSelector(false)}
        >
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <div className="employee-modal-header">
              <h3>
                <FontAwesomeIcon icon={faUserPlus} />
                Select {memberType === "employee" ? "Employees" : "Guests"} to
                Assign
              </h3>
              <button onClick={() => setShowEmployeeSelector(false)}>✕</button>
            </div>
            <div className="employee-modal-search">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder={`Search ${memberType === "employee" ? "employees" : "guests"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="employee-modal-list">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const identifier = member.isGuest
                    ? member.emp_code
                    : member.emp_code;
                  const isSelected = selectedEmployees.some(
                    (emp) =>
                      (emp.isGuest ? emp.emp_code : emp.emp_code) ===
                      identifier,
                  );
                  return (
                    <div key={identifier} className="employee-modal-item">
                      <div className="employee-modal-info">
                        <div className="employee-modal-avatar">
                          {getDisplayName(member).charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="employee-modal-name">
                            {getDisplayName(member)}
                            {member.isGuest && (
                              <span className="guest-badge-modal">
                                {" "}
                                (Guest)
                              </span>
                            )}
                          </div>
                          <div className="employee-modal-code">
                            {getDisplayCode(member)}
                          </div>
                          {member.isGuest && member.company_name && (
                            <div className="employee-modal-company">
                              {member.company_name}
                            </div>
                          )}
                          {!member.isGuest && member.emp_code && (
                            <div className="employee-modal-role">
                              Role: {getDisplayRole(member)}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className={`employee-modal-select ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveEmployee(identifier, member.isGuest);
                          } else {
                            handleEmployeeSelect(member);
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
                  <p>
                    No {memberType === "employee" ? "employees" : "guests"}{" "}
                    found
                    {selectedRoleId && memberType === "employee"
                      ? " with selected role"
                      : ""}
                  </p>
                </div>
              )}
            </div>
            <div className="employee-modal-footer">
              <button onClick={() => setShowEmployeeSelector(false)}>
                Close
              </button>
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
