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
    startDate: "2026-01-15",
    description: "Complete redesign and development of the corporate website with modern UI/UX principles, responsive design, and CMS integration. The project includes custom animations, performance optimization, and SEO best practices.",
    team: [
      { initials: "JD", color: "#8B5CF6" },
      { initials: "JS", color: "#6366F1" },
      { initials: "MJ", color: "#0F172A" },
      { initials: "SW", color: "#10B981" },
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
    startDate: "2026-03-01",
    description: "Mobile app redesign focusing on user experience improvements, faster navigation, and modern design language. Includes new features for client communication.",
    team: [
      { initials: "AT", color: "#F59E0B" },
      { initials: "PN", color: "#EF4444" },
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
    startDate: "2026-01-10",
    description: "Complete brand overhaul including logo redesign, color palette updates, typography guidelines, and brand collateral creation. Successful rebrand across all platforms.",
    team: [
      { initials: "JS", color: "#6366F1" },
      { initials: "SW", color: "#10B981" },
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
    startDate: "2026-04-01",
    description: "Building a comprehensive HR portal for employee management, attendance tracking, leave requests, payroll integration, and performance reviews with advanced analytics.",
    team: [
      { initials: "JD", color: "#8B5CF6" },
      { initials: "MJ", color: "#0F172A" },
      { initials: "AT", color: "#F59E0B" },
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
    startDate: "2026-05-15",
    description: "Landing page for the upcoming marketing campaign with interactive elements, lead capture forms, and analytics tracking. Currently on hold pending marketing strategy finalization.",
    team: [{ initials: "PN", color: "#EF4444" }],
  },
  {
    id: 6,
    name: "Payment Gateway Integration",
    client: "SWC Global",
    status: "Overdue",
    priority: "High",
    progress: 52,
    dueDate: "25 Jun 2026",
    startDate: "2026-02-15",
    description: "Integration of multiple payment gateways including Stripe, PayPal, and Razorpay with secure transaction processing, webhook handling, and real-time payment status updates.",
    team: [
      { initials: "MJ", color: "#0F172A" },
      { initials: "JD", color: "#8B5CF6" },
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