import React, { useState } from "react";
import "./ProjectListGrid.css";
import ProjectCard from "./ProjectCard.jsx";
import ProjectFilterBar from "./ProjectFilterBar.jsx";

const ProjectListGrid = ({ projects = [] }) => {
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    search: "",
    status: "All Status",
    priority: "All Priority",
    sortBy: "Newest First",
  });

  const { search, status, priority, sortBy } = filters;

  // Transform API data to match ProjectCard expected format
  const transformProjects = (projects) => {
    return projects.map((item) => {
      const project = item.project || item;
      return {
        id: project.id,
        name: project.title || project.name || "Untitled Project",
        client: project.client || "N/A",
        status: project.status || "open",
        priority: project.priority || "Medium",
        progress: parseInt(project.progress) || 0,
        dueDate: project.dueDate || project.project_end_date || "N/A",
        startDate: project.startDate || project.project_start_date || "N/A",
        description: project.description || "",
        team: project.team || [],
        roles: item.roles || [],
        completed_tasks: project.completed_tasks || 0,
        pending_tasks: project.pending_tasks || 0,
        total_tasks: project.total_tasks || 0,
      };
    });
  };

  const transformedProjects = transformProjects(projects);

  // Filter projects
  let list = transformedProjects.filter((p) => {
    // Search filter
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    const matchesStatus = status === "All Status" || p.status.toLowerCase() === status.toLowerCase();
    
    // Priority filter
    const matchesPriority = priority === "All Priority" || p.priority.toLowerCase() === priority.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort projects
  if (sortBy === "Progress: High to Low") {
    list = [...list].sort((a, b) => b.progress - a.progress);
  } else if (sortBy === "Progress: Low to High") {
    list = [...list].sort((a, b) => a.progress - b.progress);
  } else if (sortBy === "Oldest First") {
    list = [...list].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  } else if (sortBy === "Newest First") {
    list = [...list].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  } else if (sortBy === "A-Z") {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "Z-A") {
    list = [...list].sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortBy === "Due Date: Soonest") {
    list = [...list].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sortBy === "Due Date: Latest") {
    list = [...list].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }

  // Get unique statuses from projects for filter dropdown
  const getStatusOptions = () => {
    const statuses = transformedProjects.map(p => p.status);
    return ["All Status", ...new Set(statuses)];
  };

  // Get unique priorities from projects for filter dropdown
  const getPriorityOptions = () => {
    const priorities = transformedProjects.map(p => p.priority);
    return ["All Priority", ...new Set(priorities)];
  };

  return (
    <>
      <ProjectFilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterChange={setFilters}
        statusOptions={getStatusOptions()}
        priorityOptions={getPriorityOptions()}
      />

      <div
        className={`plg-wrap ${viewMode === "list" ? "plg-wrap--list" : "plg-wrap--grid"}`}
      >
        {list.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {list.length === 0 && (
          <div className="plg-empty">
            <div className="plg-empty-icon">📋</div>
            <h3>No Projects Found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectListGrid;