import React from "react";
import "./ProjectListGrid.css";
import ProjectCard from "./ProjectCard.jsx";

export const PROJECTS = [
  {
    id: 1,
    name: "Website Development",
    client: "SWC Global",
    status: "Active",
    priority: "High",
    progress: 43,
    dueDate: "21 Feb 2027",
    team: [
      { initials: "JD", color: "#7c3aed" },
      { initials: "JS", color: "#2563eb" },
      { initials: "MJ", color: "#0f172a" },
      { initials: "SW", color: "#16a34a" },
    ],
  },
  {
    id: 2,
    name: "Mobile App Redesign",
    client: "Hubers Law",
    status: "Active",
    priority: "Medium",
    progress: 65,
    dueDate: "10 Sep 2026",
    team: [
      { initials: "AT", color: "#ea580c" },
      { initials: "PN", color: "#db2777" },
    ],
  },
  {
    id: 3,
    name: "Brand Identity Refresh",
    client: "Hubers Law",
    status: "Completed",
    priority: "Low",
    progress: 100,
    dueDate: "30 Apr 2026",
    team: [
      { initials: "JS", color: "#2563eb" },
      { initials: "SW", color: "#16a34a" },
    ],
  },
  {
    id: 4,
    name: "Internal HR Portal",
    client: "SponicHR",
    status: "Active",
    priority: "High",
    progress: 28,
    dueDate: "15 Nov 2026",
    team: [
      { initials: "JD", color: "#7c3aed" },
      { initials: "MJ", color: "#0f172a" },
      { initials: "AT", color: "#ea580c" },
    ],
  },
  {
    id: 5,
    name: "Marketing Campaign Site",
    client: "SWC Global",
    status: "On Hold",
    priority: "Medium",
    progress: 15,
    dueDate: "02 Dec 2026",
    team: [{ initials: "PN", color: "#db2777" }],
  },
  {
    id: 6,
    name: "Payment Gateway Integration",
    client: "SWC Global",
    status: "Overdue",
    priority: "High",
    progress: 52,
    dueDate: "25 Jun 2026",
    team: [
      { initials: "MJ", color: "#0f172a" },
      { initials: "JD", color: "#7c3aed" },
    ],
  },
];

const ProjectListGrid = ({ filters = {}, viewMode = "grid" }) => {
  const { search = "", status = "All Status", priority = "All Priority", sortBy = "Newest First" } = filters;

  let list = PROJECTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "All Status" || p.status === status;
    const matchesPriority = priority === "All Priority" || p.priority === priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (sortBy === "Progress: High to Low") {
    list = [...list].sort((a, b) => b.progress - a.progress);
  } else if (sortBy === "Oldest First") {
    list = [...list].reverse();
  }

  return (
    <div className={`plg-wrap ${viewMode === "list" ? "plg-wrap--list" : "plg-wrap--grid"}`}>
      {list.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      {list.length === 0 && (
        <div className="plg-empty">No projects match your filters.</div>
      )}
    </div>
  );
};

export default ProjectListGrid;