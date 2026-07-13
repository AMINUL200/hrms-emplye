import React, { useContext, useEffect, useState } from "react";
import "./EmpProjectList.css";
import ProjectListHeader from "../../../component/project-list/ProjectListHeader";
import ProjectListStats from "../../../component/project-list/ProjectListStats";
import ProjectStatusPieChart from "../../../component/project-list/ProjectStatusPieChart";
import ProjectProgressChart from "../../../component/project-list/ProjectProgressChart";
import ProjectFilterBar from "../../../component/project-list/ProjectFilterBar";
import ProjectListGrid from "../../../component/project-list/ProjectListGrid";
import { AuthContext } from "../../../context/AuthContex";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipboardList } from "lucide-react";

const EmpProjectList = () => {
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});

 

  const fetchProjects = async () => {
    const res = await axios.get(`${api_url}/permission-wise-project`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.data.status === 1) {
      setProjects(res.data.data || []);
    } else {
      toast.error(res.data.message || "Failed to fetch projects");
    }
  };

  const fetchDashboardStats = async () => {
    const res = await axios.get(`${api_url}/emp-project-dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.data.status === 1) {
      setDashboardStats(res.data.data);
      console.log(res.data.data);
    } else {
      throw new Error(res.data.message || "Failed to load dashboard");
    }
  };

  const loadPageData = async () => {
    try {
      setLoading(true);

      await Promise.all([fetchProjects(), fetchDashboardStats()]);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects from API
  useEffect(() => {
    loadPageData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="att-overview-card">
        <div className="att-overview-heading">
          <ClipboardList size={18} className="att-heading-icon" />
          <h2>Project List</h2>
        </div>
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading Project data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="epl-page">
      <ProjectListHeader />

      <ProjectListStats dashboardStats={dashboardStats} />

      <div className="epl-charts-row">
        <ProjectStatusPieChart />
        <ProjectProgressChart />
      </div>

      {/* <ProjectFilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterChange={setFilters}
      /> */}

     <ProjectListGrid projects={projects} />
    </div>
  );
};

export default EmpProjectList;
