import React, { useState, useEffect, useContext } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import "./CreateModule.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faUser,
  faLayerGroup,
  faCalendarAlt,
  faSortNumericDown,
  faInfoCircle,
  faEdit,
  faPlus,
  faSpinner,
  faTasks,
  faList,
  faSitemap,
  faChevronDown,
  faChevronRight,
  faFolder,
  faFile,
  faCodeBranch,
  faUserPlus,
  faCheckCircle,
  faTimes,
  faSearch,
  faUsers,
  faUserCheck,
  faBuilding,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContex";

const CreateModule = () => {
  const { p_id } = useParams(); // projectId
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project;
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  // Check if it's add mode (add=true) or edit mode (add=false)
  const isAddMode = searchParams.get("add") === "true";
  const updateId = searchParams.get("updateid"); // For update mode
  const parentId = searchParams.get("parent_id"); // For submodule/task/subtask
  const itemType = searchParams.get("type"); // module, submodule, task, subtask

  // Form state
  const [formData, setFormData] = useState({
    project_id: project?.project_id || p_id || "",
    parent_id: parentId || "",
    type: itemType || "module",
    title: "",
    description: "",
    order_by: "",
    start_date: "",
    end_date: "",
    status: "open",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [projectTree, setProjectTree] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [showParentSelector, setShowParentSelector] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
  // Employee assignment states
  const [members, setMembers] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [currentlyAssignedEmployees, setCurrentlyAssignedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [createdWorkItemId, setCreatedWorkItemId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Separate assignment states (for existing work items)
  const [workItemsList, setWorkItemsList] = useState([]);
  const [showWorkItemSelector, setShowWorkItemSelector] = useState(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState("");
  const [expandedWorkItems, setExpandedWorkItems] = useState(new Set());
  const [assignLoading, setAssignLoading] = useState(false);
  const [separateAssignEmployees, setSeparateAssignEmployees] = useState([]);
  const [separateSearchTerm, setSeparateSearchTerm] = useState("");
  const [showSeparateEmployeeSelector, setShowSeparateEmployeeSelector] = useState(false);

  const typeOptions = [
    { value: "module", label: "Module", icon: faLayerGroup, color: "#4299e1" },
    {
      value: "submodule",
      label: "Submodule",
      icon: faSitemap,
      color: "#9b59b6",
    },
    { value: "task", label: "Task", icon: faTasks, color: "#ecc94b" },
    { value: "subtask", label: "Subtask", icon: faList, color: "#48bb78" },
  ];

  const statusOptions = [
    { value: "open", label: "Open", color: "#4299e1" },
    { value: "in_progress", label: "In Progress", color: "#ecc94b" },
    { value: "completed", label: "Completed", color: "#48bb78" },
    { value: "closed", label: "Closed", color: "#718096" },
  ];

  // Fetch all members for employee assignment
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

  // Fetch work items list for separate assignment
 const fetchWorkItemsList =
  async () => {

    try {

      const response =
        await axios.get(
          `${api_url}/project-tree/${p_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      console.log(
        "WORK ITEM TREE:",
        response.data
      );

      let workItems = [];

      // TYPE 1
      if (
        response?.data?.data?.project
          ?.modules
      ) {

        workItems =
          response.data.data.project
            .modules;

      }

      // TYPE 2
      else if (
        Array.isArray(
          response?.data?.data
        )
      ) {

        workItems =
          response.data.data;

      }

      setWorkItemsList(workItems);

    } catch (err) {

      console.error(
        "Error fetching work items:",
        err
      );

    }
};

  // Fetch currently assigned employees for a work item (for separate assignment)
  const fetchAssignedEmployeesForWorkItem = async (workItemId) => {
    try {
      const response = await axios.get(
        `${api_url}/work-item-assigned-employees/${workItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 1) {
        const assigned = response.data.employees || [];
        setCurrentlyAssignedEmployees(assigned);
        setSeparateAssignEmployees(assigned);
        if (assigned.length > 0) {
          toast.info(`Found ${assigned.length} already assigned employee(s)`);
        }
      }
    } catch (err) {
      console.error("Error fetching assigned employees:", err);
      setCurrentlyAssignedEmployees([]);
      setSeparateAssignEmployees([]);
    }
  };

  // Fetch work item data for edit mode
  const fetchWorkItemData = async () => {
    if (!isAddMode && updateId) {
      setFetchingData(true);
      setIsEditMode(true);
      try {
        const response = await axios.get(`${api_url}/work-item/${updateId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.status === 1) {
          const workItem = response.data.data;
          setFormData({
            project_id: workItem.project_id || p_id,
            parent_id: workItem.parent_id || "",
            type: workItem.type || "module",
            title: workItem.title || "",
            description: workItem.description || "",
            order_by: workItem.order_by || "",
            start_date: workItem.start_date ? workItem.start_date.split('T')[0] : "",
            end_date: workItem.end_date ? workItem.end_date.split('T')[0] : "",
            status: workItem.status || "open",
          });
        } else {
          toast.error("Failed to fetch work item details");
        }
      } catch (err) {
        console.error("Error fetching work item:", err);
        toast.error(err.response?.data?.message || "Failed to load work item data");
      } finally {
        setFetchingData(false);
      }
    }
  };

  // Fetch project tree for parent selection
  const fetchProjectTree = async () => {

  if (
    isAddMode &&
    formData.type !== "module"
  ) {

    setFetchingData(true);

    try {

      const response =
        await axios.get(
          `${api_url}/project-tree/${p_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      console.log(
        "PROJECT TREE:",
        response.data
      );

      let treeItems = [];

      // =========================
      // TYPE 1
      // =========================

      if (
        response?.data?.data?.project
          ?.modules
      ) {

        treeItems =
          response.data.data.project
            .modules;

      }

      // =========================
      // TYPE 2
      // =========================

      else if (
        Array.isArray(
          response?.data?.data
        )
      ) {

        treeItems =
          response.data.data;

      }

      setProjectTree(treeItems);

    } catch (err) {

      console.error(
        "Error fetching project tree:",
        err
      );

    } finally {

      setFetchingData(false);

    }
  }
};

  useEffect(() => {
    if (token) {
      fetchMembers();
      fetchWorkItemsList(); // Fetch work items for separate assignment
      
      if (!isAddMode && updateId) {
        // Edit mode - fetch existing work item
        fetchWorkItemData();
      } else if (isAddMode && formData.type !== "module") {
        // Add mode with parent requirement
        fetchProjectTree();
      }
    }
  }, [token, isAddMode, formData.type, p_id, updateId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setProjectTree([]);
    setSelectedParent(null);
    setFormData(prev => ({
      ...prev,
      type: type,
      parent_id: ''
    }));
  };

  // Employee selection handlers for main form
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

  // Separate assignment - employee selection handlers
  const handleSeparateEmployeeSelect = (employee) => {
    if (!separateAssignEmployees.find(emp => emp.emp_code === employee.emp_code)) {
      setSeparateAssignEmployees([...separateAssignEmployees, employee]);
      toast.success(`${employee.emp_fname} ${employee.emp_lname} added`);
    } else {
      toast.info(`${employee.emp_fname} ${employee.emp_lname} is already selected`);
    }
  };

  const handleSeparateRemoveEmployee = (empCode) => {
    setSeparateAssignEmployees(separateAssignEmployees.filter(emp => emp.emp_code !== empCode));
    toast.info("Employee removed from selection");
  };

  // Handle work item selection for separate assignment
  const handleWorkItemSelect = async (workItem) => {
    setSelectedWorkItem(workItem);
    setSelectedWorkItemId(workItem.id);
    setShowWorkItemSelector(false);
    await fetchAssignedEmployeesForWorkItem(workItem.id);
  };

  // Separate assignment submit handler
  const handleSeparateAssignment = async () => {
    if (!selectedWorkItemId) {
      toast.error("Please select a work item");
      return;
    }

    if (separateAssignEmployees.length === 0) {
      toast.error("Please select at least one employee to assign");
      return;
    }

    setAssignLoading(true);
    try {
      const assignData = {
        work_item_id: selectedWorkItemId,
        employee_ids: separateAssignEmployees.map(emp => emp.emp_code)
      };
      
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

      if (response.data.status === 1) {
        toast.success(`${separateAssignEmployees.length} employee(s) assigned successfully!`);
        // Reset separate assignment form
        setSelectedWorkItem(null);
        setSelectedWorkItemId("");
        setSeparateAssignEmployees([]);
        setCurrentlyAssignedEmployees([]);
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

  // Assign employees to newly created work item
  const assignEmployees = async (workItemId) => {
    if (selectedEmployees.length === 0) return;

    try {
      const assignData = {
        work_item_id: workItemId,
        employee_ids: selectedEmployees.map(emp => emp.emp_code)
      };
      
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

      if (response.data.status === 1) {
        toast.success(`${selectedEmployees.length} employee(s) assigned successfully!`);
        return true;
      } else {
        toast.warning("Employee assignment failed");
        return false;
      }
    } catch (err) {
      console.error("Error assigning employees:", err);
      toast.error("Failed to assign employees");
      return false;
    }
  };

  // Update work item (for edit mode)
  const updateWorkItem = async () => {
    const updateData = {
      title: formData.title,
      description: formData.description,
      order_by: parseInt(formData.order_by) || 0,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: formData.status,
    };

    if (formData.type !== "module" && formData.parent_id) {
      updateData.parent_id = parseInt(formData.parent_id);
    }

    const response = await axios.post(
      `${api_url}/work-item-update/${updateId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title) {
      toast.error(
        `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} title is required`,
      );
      return;
    }

    if (!formData.project_id) {
      toast.error("Project ID is required");
      return;
    }

    if (formData.type !== "module" && !formData.parent_id) {
      toast.error(`Parent ID is required for ${formData.type}`);
      return;
    }

    setLoading(true);

    try {
      let response;
      let workItemId;

      if (isEditMode && updateId) {
        // Update existing work item
        response = await updateWorkItem();
        workItemId = updateId;
        
        if (response.data.status === 1) {
          toast.success("Work item updated successfully!");
        } else {
          throw new Error(response.data.message || "Update failed");
        }
      } else {
        // Create new work item
        const submitData = {
          project_id: parseInt(formData.project_id),
          type: formData.type,
          title: formData.title,
        };

        if (formData.type !== "module") {
          submitData.parent_id = parseInt(formData.parent_id);
        }

        if (formData.description) submitData.description = formData.description;
        if (formData.order_by) submitData.order_by = parseInt(formData.order_by);
        if (formData.start_date) submitData.start_date = formData.start_date;
        if (formData.end_date) submitData.end_date = formData.end_date;
        if (formData.status) submitData.status = formData.status;

        response = await axios.post(`${api_url}/work-items`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.status === 1) {
          workItemId = response.data.data.id;
          setCreatedWorkItemId(workItemId);
          toast.success(`${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} created successfully!`);
        } else {
          throw new Error(response.data.message || "Creation failed");
        }
      }

      // Assign employees if any selected
      if (selectedEmployees.length > 0) {
        await assignEmployees(workItemId);
      }

      // Navigate back to project page
      navigate(`/organization/assigned-project/${p_id}`, {
        state: { project: project }
      });

    } catch (err) {
      console.error("Error saving work item:", err);
      toast.error(err.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const filteredEmployees = members.filter(member => {
    const fullName = `${member.emp_fname} ${member.emp_lname}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           member.emp_code.toLowerCase().includes(searchLower);
  });

  const filteredSeparateEmployees = members.filter(member => {
    const fullName = `${member.emp_fname} ${member.emp_lname}`.toLowerCase();
    const searchLower = separateSearchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           member.emp_code.toLowerCase().includes(searchLower);
  });

  const currentTypeInfo = typeOptions.find(
    (opt) => opt.value === formData.type,
  );

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
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

  const renderTree = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`tree-node ${selectedParent?.id === item.id ? "selected" : ""}`}
          onClick={() => {
            setSelectedParent(item);
            setFormData((prev) => ({ ...prev, parent_id: item.id }));
            setShowParentSelector(false);
          }}
        >
          <div className="tree-node-content">
            {item.children && item.children.length > 0 && (
              <button
                className="tree-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(item.id);
                }}
              >
                <FontAwesomeIcon
                  icon={
                    expandedNodes.has(item.id) ? faChevronDown : faChevronRight
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
          expandedNodes.has(item.id) && (
            <div className="tree-children">
              {renderTree(item.children, level + 1)}
            </div>
          )}
      </div>
    ));
  };

  if (fetchingData) {
    return (
      <div className="emp-assigned-module-container">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
          <p>Loading work item data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-assigned-module-container">
      <div className="form-header">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back</span>
        </button>
        <h1>
          <FontAwesomeIcon icon={isEditMode ? faEdit : currentTypeInfo?.icon || faPlus} />
          {isEditMode ? `Edit ${currentTypeInfo?.label}` : `Create New ${currentTypeInfo?.label || "Work Item"}`}
        </h1>
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="module-assign-form">
          {/* Work Item Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={currentTypeInfo?.icon || faLayerGroup} />
              {currentTypeInfo?.label} Details
            </h2>

            <div className="form-grid">
              {/* Type Selection - Disabled in edit mode */}
              <div className="form-group">
                <label htmlFor="type">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Type <span className="required">*</span>
                </label>
                <div className="type-selector">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`type-btn ${formData.type === option.value ? "active" : ""}`}
                      onClick={() => !isEditMode && handleTypeChange(option.value)}
                      disabled={isEditMode}
                      style={{
                        opacity: isEditMode && formData.type !== option.value ? 0.5 : 1,
                        cursor: isEditMode ? 'not-allowed' : 'pointer',
                        borderColor:
                          formData.type === option.value
                            ? option.color
                            : "#e2e8f0",
                        background:
                          formData.type === option.value
                            ? `${option.color}10`
                            : "white",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={option.icon}
                        style={{ color: option.color }}
                      />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Parent Selection (for non-module items) */}
              {formData.type !== "module" && (
                <div className="form-group full-width">
                  <label htmlFor="parent_id">
                    <FontAwesomeIcon icon={faSitemap} />
                    Parent{" "}
                    {formData.type === "submodule"
                      ? "Module"
                      : formData.type === "task"
                        ? "Parent Item"
                        : "Task"}{" "}
                    <span className="required">*</span>
                  </label>
                  <div className="parent-selector">
                    <input
                      type="text"
                      value={
                        selectedParent
                          ? `${selectedParent.title} (ID: ${selectedParent.id})`
                          : formData.parent_id
                      }
                      onClick={() => !isEditMode && setShowParentSelector(!showParentSelector)}
                      placeholder={`Select parent ${formData.type === "submodule" ? "module" : formData.type === "task" ? "parent item" : "task"}`}
                      readOnly
                      className="parent-input"
                      disabled={isEditMode}
                    />
                    {!isEditMode && showParentSelector && (
                      <div className="parent-dropdown">
                        <div className="parent-dropdown-header">
                          <h4>Select Parent Item</h4>
                          <button
                            type="button"
                            onClick={() => setShowParentSelector(false)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="parent-tree">
                          {fetchingData ? (
                            <div className="loading-state">
                              <FontAwesomeIcon icon={faSpinner} spin />
                              <p>Loading...</p>
                            </div>
                          ) : projectTree.length > 0 ? (
                            renderTree(projectTree)
                          ) : (
                            <div className="no-data">No items available</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <small className="form-hint">
                    Select the parent item under which this {formData.type} will
                    be created
                  </small>
                </div>
              )}

              {/* Title */}
              <div className="form-group full-width">
                <label htmlFor="title">
                  <FontAwesomeIcon icon={faUser} />
                  {currentTypeInfo?.label} Title{" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder={`Enter ${currentTypeInfo?.label?.toLowerCase() || "work item"} title`}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter description (optional)"
                />
              </div>

              {/* Order By */}
              <div className="form-group">
                <label htmlFor="order_by">
                  <FontAwesomeIcon icon={faSortNumericDown} />
                  Order By
                </label>
                <input
                  type="number"
                  id="order_by"
                  name="order_by"
                  value={formData.order_by}
                  onChange={handleChange}
                  placeholder="Display order"
                  min="0"
                />
                <small className="form-hint">
                  Determines the display order
                </small>
              </div>

              {/* Status */}
              <div className="form-group">
                <label htmlFor="status">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="form-group">
                <label htmlFor="start_date">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>

              {/* End Date */}
              <div className="form-group">
                <label htmlFor="end_date">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  End Date
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Employee Assignment Section for New/Edit Work Item */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faUserPlus} />
              {isEditMode ? "Manage Employee Assignments" : "Assign Employees to This Work Item (Optional)"}
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
                  <h4>Available Employees</h4>
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
                  {members.length > 5 && (
                    <button
                      type="button"
                      className="view-all-btn"
                      onClick={() => setShowEmployeeSelector(true)}
                    >
                      View all {members.length} employees
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions for Create/Update */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleBack}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  {isEditMode ? `Update ${currentTypeInfo?.label}` : `Create ${currentTypeInfo?.label}`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Separate Employee Assignment Section (Bottom) */}
      <div className="separate-assignment-wrapper">
        <div className="separate-assignment-header">
          <h2>
            <FontAwesomeIcon icon={faUserFriends} />
            Assign Employees to Existing Work Item
          </h2>
          <p>Select any module, submodule, task, or subtask to assign employees independently</p>
        </div>

        <div className="separate-assignment-content">
          {/* Work Item Selection */}
          <div className="form-section">
            <h3 className="section-title-small">
              <FontAwesomeIcon icon={faSitemap} />
              Select Work Item
            </h3>

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
                      {workItemsList.length > 0 ? (
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

          {/* Separate Assignment - Employee Selection */}
          <div className="form-section">
            <h3 className="section-title-small">
              <FontAwesomeIcon icon={faUserPlus} />
              Select Employees to Assign
            </h3>

            <div className="employee-assignment-area">
              {/* Selected Employees Summary for Separate Assignment */}
              {separateAssignEmployees.length > 0 && (
                <div className="selected-employees-summary">
                  <h3>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Selected Employees ({separateAssignEmployees.length})
                  </h3>
                  <div className="selected-badges">
                    {separateAssignEmployees.map((employee) => (
                      <div key={employee.emp_code} className="selected-badge">
                        <span>{employee.emp_fname} {employee.emp_lname}</span>
                        <span className="employee-code-badge">{employee.emp_code}</span>
                        {currentlyAssignedEmployees.some(emp => emp.emp_code === employee.emp_code) && (
                          <span className="already-assigned-badge">Already Assigned</span>
                        )}
                        <button
                          type="button"
                          className="remove-badge"
                          onClick={() => handleSeparateRemoveEmployee(employee.emp_code)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search and Add Employees for Separate Assignment */}
              <div className="add-employee-section">
                <div className="search-box-small">
                  <FontAwesomeIcon icon={faSearch} className="search-icon-small" />
                  <input
                    type="text"
                    placeholder="Search employees by name or code..."
                    value={separateSearchTerm}
                    onChange={(e) => setSeparateSearchTerm(e.target.value)}
                    className="search-input-small"
                  />
                </div>
                
                <div className="available-employees-list">
                  <h4>Available Employees</h4>
                  <div className="employees-mini-grid">
                    {filteredSeparateEmployees.slice(0, 5).map((employee) => {
                      const isSelected = separateAssignEmployees.some(emp => emp.emp_code === employee.emp_code);
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
                            onClick={() => handleSeparateEmployeeSelect(employee)}
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
                  {members.length > 5 && (
                    <button
                      type="button"
                      className="view-all-btn"
                      onClick={() => setShowSeparateEmployeeSelector(true)}
                    >
                      View all {members.length} employees
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Separate Assignment Action Buttons */}
          <div className="separate-assign-actions">
            <button 
              type="button" 
              className="separate-assign-btn"
              onClick={handleSeparateAssignment}
              disabled={assignLoading || !selectedWorkItemId || separateAssignEmployees.length === 0}
            >
              {assignLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Assigning...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUserCheck} />
                  Assign Employees to Selected Work Item
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full Employee Selection Modal for Main Form */}
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
              {filteredEmployees.map((employee) => {
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
              })}
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

      {/* Full Employee Selection Modal for Separate Assignment */}
      {showSeparateEmployeeSelector && (
        <div className="modal-overlay" onClick={() => setShowSeparateEmployeeSelector(false)}>
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <div className="employee-modal-header">
              <h3>
                <FontAwesomeIcon icon={faUserPlus} />
                Select Employees to Assign
              </h3>
              <button onClick={() => setShowSeparateEmployeeSelector(false)}>✕</button>
            </div>
            <div className="employee-modal-search">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search employees..."
                value={separateSearchTerm}
                onChange={(e) => setSeparateSearchTerm(e.target.value)}
              />
            </div>
            <div className="employee-modal-list">
              {filteredSeparateEmployees.map((employee) => {
                const isSelected = separateAssignEmployees.some(emp => emp.emp_code === employee.emp_code);
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
                          handleSeparateRemoveEmployee(employee.emp_code);
                        } else {
                          handleSeparateEmployeeSelect(employee);
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
              })}
            </div>
            <div className="employee-modal-footer">
              <button onClick={() => setShowSeparateEmployeeSelector(false)}>Close</button>
              <button 
                className="confirm-btn"
                onClick={() => setShowSeparateEmployeeSelector(false)}
              >
                Done ({separateAssignEmployees.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateModule;