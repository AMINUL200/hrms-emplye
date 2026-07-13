import React, { useState } from "react";
import "./ProjectFilterBar.css";
import { Search, ChevronDown, List, LayoutGrid, SlidersHorizontal } from "lucide-react";

const ProjectFilterBar = ({ 
  viewMode, 
  onViewModeChange, 
  onFilterChange,
  statusOptions = ["All Status", "open", "in_progress", "completed"],
  priorityOptions = ["All Priority", "High", "Medium", "Low"]
}) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [priority, setPriority] = useState("All Priority");
  const [sortBy, setSortBy] = useState("Newest First");

  const emitChange = (next) => {
    onFilterChange?.({ search, status, priority, sortBy, ...next });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    emitChange({ search: e.target.value });
  };

  const handleStatus = (e) => {
    setStatus(e.target.value);
    emitChange({ status: e.target.value });
  };

  const handlePriority = (e) => {
    setPriority(e.target.value);
    emitChange({ priority: e.target.value });
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
    emitChange({ sortBy: e.target.value });
  };

  // Format status label for display
  const formatStatusLabel = (status) => {
    if (status === "All Status") return "All Status";
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  // Format priority label for display
  const formatPriorityLabel = (priority) => {
    if (priority === "All Priority") return "All Priority";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="pfb-card">
      <div className="pfb-search-box">
        <Search size={15} />
        <input
          type="text"
          placeholder="Search projects by name, client, or description..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="pfb-select-wrap">
        <SlidersHorizontal size={13} className="pfb-select-prefix-icon" />
        <select value={status} onChange={handleStatus}>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {formatStatusLabel(option)}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pfb-select-caret" />
      </div>

      <div className="pfb-select-wrap">
        <select value={priority} onChange={handlePriority}>
          {priorityOptions.map((option) => (
            <option key={option} value={option}>
              {formatPriorityLabel(option)}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pfb-select-caret" />
      </div>

      <div className="pfb-select-wrap">
        <select value={sortBy} onChange={handleSort}>
          <option value="Newest First">Newest First</option>
          <option value="Oldest First">Oldest First</option>
          <option value="A-Z">A-Z</option>
          <option value="Z-A">Z-A</option>
          <option value="Progress: High to Low">Progress: High to Low</option>
          <option value="Progress: Low to High">Progress: Low to High</option>
          <option value="Due Date: Soonest">Due Date: Soonest</option>
          <option value="Due Date: Latest">Due Date: Latest</option>
        </select>
        <ChevronDown size={14} className="pfb-select-caret" />
      </div>

      <div className="pfb-view-toggle">
        <button
          type="button"
          className={viewMode === "grid" ? "pfb-view-btn--active" : ""}
          onClick={() => onViewModeChange?.("grid")}
          aria-label="Grid view"
        >
          <LayoutGrid size={15} />
        </button>
        <button
          type="button"
          className={viewMode === "list" ? "pfb-view-btn--active" : ""}
          onClick={() => onViewModeChange?.("list")}
          aria-label="List view"
        >
          <List size={15} />
        </button>
      </div>
    </div>
  );
};

export default ProjectFilterBar;