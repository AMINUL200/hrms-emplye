import React, { useState } from "react";
import "./ProjectFilterBar.css";
import { Search, ChevronDown, List, LayoutGrid, SlidersHorizontal } from "lucide-react";

const ProjectFilterBar = ({ viewMode, onViewModeChange, onFilterChange }) => {
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

  return (
    <div className="pfb-card">
      <div className="pfb-search-box">
        <Search size={15} />
        <input
          type="text"
          placeholder="Search projects by name, client, or owner..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="pfb-select-wrap">
        <SlidersHorizontal size={13} className="pfb-select-prefix-icon" />
        <select value={status} onChange={handleStatus}>
          <option>All Status</option>
          <option>Active</option>
          <option>Completed</option>
          <option>On Hold</option>
          <option>Overdue</option>
        </select>
        <ChevronDown size={14} className="pfb-select-caret" />
      </div>

      <div className="pfb-select-wrap">
        <select value={priority} onChange={handlePriority}>
          <option>All Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <ChevronDown size={14} className="pfb-select-caret" />
      </div>

      <div className="pfb-select-wrap">
        <select value={sortBy} onChange={handleSort}>
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Progress: High to Low</option>
          <option>Due Date</option>
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