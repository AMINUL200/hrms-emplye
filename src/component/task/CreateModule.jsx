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

  // Auto-select work item from URL (for quick creation)
  const autoSelectWorkItemId = searchParams.get("workitem_id");
  const autoSelectType = searchParams.get("type");

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
    priority: null,
  });

  const priorityOptions = [
    {
      value: "high",
      label: "High 🔴",
    },
    {
      value: "medium",
      label: "Medium 🟡",
    },
    {
      value: "low",
      label: "Low 🟢",
    },
  ];

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [projectTree, setProjectTree] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [showParentSelector, setShowParentSelector] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [autoSelectAttempted, setAutoSelectAttempted] = useState(false);

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

  // Helper: Recursively find item by ID in the project tree
  const findItemById = (items, id) => {
    if (!items || !id) return null;

    for (const item of items) {
      if (item.id === parseInt(id)) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper: Recursively collect all parent IDs to expand the tree
  const collectParentIds = (items, targetId, parents = []) => {
    if (!items || !targetId) return [];

    for (const item of items) {
      if (item.id === parseInt(targetId)) {
        return parents;
      }
      if (item.children && item.children.length > 0) {
        const newParents = [...parents, item.id];
        const found = collectParentIds(item.children, targetId, newParents);
        if (found.length > 0) {
          return found;
        }
      }
    }
    return [];
  };

  // Helper: Expand all parent nodes of a selected item
  const expandParentNodes = (tree, itemId) => {
    const parentIds = collectParentIds(tree, itemId);
    const newExpanded = new Set(expandedNodes);
    parentIds.forEach((id) => newExpanded.add(id));
    setExpandedNodes(newExpanded);
  };

  // Auto-select parent from URL parameters
  const autoSelectParent = async (treeData, workItemId, itemTypeParam) => {
    if (!workItemId || !itemTypeParam || autoSelectAttempted) return false;

    console.log("Auto-selecting parent:", { workItemId, itemTypeParam });

    // Determine what type of parent we need based on the type we're creating
    let requiredParentType = null;
    if (itemTypeParam === "submodule") {
      requiredParentType = "module";
    } else if (itemTypeParam === "task") {
      requiredParentType = "submodule";
    } else if (itemTypeParam === "subtask") {
      requiredParentType = "task";
    }

    if (!requiredParentType) return false;

    // Find the selected work item in the tree
    const selectedItem = findItemById(treeData, workItemId);

    if (!selectedItem) {
      console.warn(`Work item with ID ${workItemId} not found in tree`);
      return false;
    }

    // Check if the selected item matches the required parent type
    if (selectedItem.type !== requiredParentType) {
      console.warn(
        `Selected item type ${selectedItem.type} does not match required parent type ${requiredParentType}`,
      );
      toast.warning(
        `Selected ${selectedItem.type} cannot be parent for ${itemTypeParam}. Please select appropriate parent.`,
      );
      return false;
    }

    // Auto-select the parent
    setSelectedParent(selectedItem);
    setFormData((prev) => ({
      ...prev,

      parent_id: selectedItem.id,

      type: itemTypeParam,
    }));

    setSelectedParent(selectedItem);

    setShowParentSelector(false);

    // Expand parent nodes
    expandParentNodes(treeData, selectedItem.id);

    toast.success(
      `Parent auto-selected: ${selectedItem.title} (${selectedItem.type})`,
    );
    setAutoSelectAttempted(true);
    return true;
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
            start_date: workItem.start_date
              ? workItem.start_date.split("T")[0]
              : "",
            end_date: workItem.end_date ? workItem.end_date.split("T")[0] : "",
            status: workItem.status || "open",
            priority: workItem.priority || null,
          });

          // If parent_id exists, fetch parent details to display selected parent
          if (workItem.parent_id && workItem.type !== "module") {
            await fetchParentDetails(workItem.parent_id);
          }
        } else {
          toast.error("Failed to fetch work item details");
        }
      } catch (err) {
        console.error("Error fetching work item:", err);
        toast.error(
          err.response?.data?.message || "Failed to load work item data",
        );
      } finally {
        setFetchingData(false);
      }
    }
  };

  // Fetch parent details for edit mode
  const fetchParentDetails = async (parentId) => {
    try {
      const response = await axios.get(`${api_url}/work-item/${parentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data.status === 1) {
        setSelectedParent(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching parent:", err);
    }
  };

  // Fetch project tree for parent selection - FIXED for the actual API response structure
  const fetchProjectTree = async () => {
    // Only fetch if we need parent selection (non-module items)
    // if (formData.type === "module") {
    //   return;
    // }

    setFetchingData(true);
    try {
      const response = await axios.get(`${api_url}/project-tree/${p_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("PROJECT TREE RESPONSE:", response.data);

      let treeItems = [];

      // Parse the actual API response structure: data.project.modules
      if (response?.data?.data?.project?.modules) {
        treeItems = response.data.data.project.modules;
      }
      // Fallback for other possible structures
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        treeItems = response.data.data;
      } else if (response?.data?.modules) {
        treeItems = response.data.modules;
      } else if (Array.isArray(response?.data)) {
        treeItems = response.data;
      }

      setProjectTree(treeItems);

      // After tree is loaded, attempt auto-selection if in add mode and URL params exist
      if (
        isAddMode &&
        autoSelectWorkItemId &&
        autoSelectType &&
        !autoSelectAttempted &&
        treeItems.length > 0
      ) {
        await autoSelectParent(treeItems, autoSelectWorkItemId, autoSelectType);
      }

      if (treeItems.length === 0 && formData.type !== "module") {
        toast.info("No modules available. Please create a module first.");
      }
    } catch (err) {
      console.error("Error fetching project tree:", err);
      toast.error("Failed to load parent items");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (!isAddMode && updateId) {
        // Edit mode - fetch existing work item
        fetchWorkItemData();
      }
      // Fetch project tree for parent selection
      fetchProjectTree();
    }
  }, [token, isAddMode, p_id, updateId]);

  // Refetch tree when type changes to module (no need for parent)
  useEffect(() => {
    // AUTO URL MODE
    if (autoSelectWorkItemId && autoSelectType) {
      fetchProjectTree();

      return;
    }

    // NORMAL MODE
    if (formData.type !== "module") {
      fetchProjectTree();
    } else {
      setSelectedParent(null);

      setFormData((prev) => ({
        ...prev,
        parent_id: "",
        priority: "",
      }));
    }
  }, [formData.type]);

  useEffect(() => {
    if (selectedParent && formData.parent_id) {
      console.log("AUTO SELECT SUCCESS", selectedParent);
    }
  }, [selectedParent, formData.parent_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setSelectedParent(null);
    setFormData((prev) => ({
      ...prev,
      type: type,
      parent_id: "",
    }));
    // Reset auto-select attempt when type changes manually
    setAutoSelectAttempted(false);
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

      if (isEditMode && updateId) {
        // Update existing work item
        const updateData = {
          title: formData.title,
          description: formData.description,
          order_by: parseInt(formData.order_by) || 0,
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: formData.status,
          priority: formData.priority,
        };

        if (formData.type !== "module" && formData.parent_id) {
          updateData.parent_id = parseInt(formData.parent_id);
        }

        response = await axios.post(
          `${api_url}/work-item-update/${updateId}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

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
        if (formData.order_by)
          submitData.order_by = parseInt(formData.order_by);
        if (formData.start_date) submitData.start_date = formData.start_date;
        if (formData.end_date) submitData.end_date = formData.end_date;
        if (formData.status) submitData.status = formData.status;
        if (formData.priority) submitData.priority = formData.priority;

        // debug log before submission
        console.log("Submitting work item data:", submitData);

        response = await axios.post(`${api_url}/work-items`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.status === 1) {
          toast.success(
            `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} created successfully!`,
          );
          navigate(`/organization/emp-assign-work-item/${p_id}`);
          return; // Exit early to avoid navigating again
        } else {
          throw new Error(response.data.message || "Creation failed");
        }
      }
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

  const renderTree = (items, level = 0) => {
    if (!items || items.length === 0) {
      return (
        <div className="no-data">
          No modules available. Please create a module first.
        </div>
      );
    }

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

  // Get display text for selected parent
  const getSelectedParentDisplayText = () => {
    if (selectedParent) {
      return `${selectedParent.title} • ${selectedParent.type} • ID: ${selectedParent.id}`;
    }
    if (formData.parent_id) {
      return `Parent ID: ${formData.parent_id}`;
    }
    return "";
  };

  if (fetchingData && !projectTree.length && isEditMode) {
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
          <FontAwesomeIcon
            icon={isEditMode ? faEdit : currentTypeInfo?.icon || faPlus}
          />
          {isEditMode
            ? `Edit ${currentTypeInfo?.label}`
            : `Create New ${currentTypeInfo?.label || "Work Item"}`}
        </h1>
        {autoSelectWorkItemId && isAddMode && selectedParent && (
          <div className="auto-select-badge">
            <FontAwesomeIcon icon={faCheckCircle} />
            Parent auto-selected
          </div>
        )}
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
                      onClick={() =>
                        !isEditMode && handleTypeChange(option.value)
                      }
                      disabled={isEditMode}
                      style={{
                        opacity:
                          isEditMode && formData.type !== option.value
                            ? 0.5
                            : 1,
                        cursor: isEditMode ? "not-allowed" : "pointer",
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
                          ? `${selectedParent.title} • ${selectedParent.type} • ID: ${selectedParent.id}`
                          : ""
                      }
                      onClick={() =>
                        !isEditMode &&
                        setShowParentSelector(!showParentSelector)
                      }
                      placeholder={
                        fetchingData
                          ? "Loading parent..."
                          : `Select parent ${
                              formData.type === "submodule"
                                ? "module"
                                : formData.type === "task"
                                  ? "submodule"
                                  : "task"
                            }`
                      }
                      readOnly
                      className={`parent-input ${selectedParent ? "has-value" : ""}`}
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
                            <div className="no-data">
                              <p>No modules available.</p>
                              <small>
                                Please create a module first before adding
                                submodules, tasks, or subtasks.
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <small className="form-hint">
                    Select the parent item under which this {formData.type} will
                    be created
                    {autoSelectWorkItemId &&
                      selectedParent &&
                      " ✓ Parent has been auto-selected"}
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

              {/* Priority */}
              <div className="form-group">
                <label htmlFor="priority">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Priority
                </label>

                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="">Select Priority</option>

                  {priorityOptions.map((option) => (
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

          {/* Form Actions */}
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
                  {isEditMode
                    ? `Update ${currentTypeInfo?.label}`
                    : `Create ${currentTypeInfo?.label}`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModule;
