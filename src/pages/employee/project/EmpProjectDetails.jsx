import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./EmpProjectDetails.css";
import { useParams } from "react-router-dom";

import ProjectHeader from "../../../component/project-details/ProjectHeader";
import ProjectTabs from "../../../component/project-details/ProjectTabs";
import ProjectStatsCards from "../../../component/project-details/ProjectStatsCards";
import ProjectModulesList from "../../../component/project-details/ProjectModulesList";
import ProjectDetailsPanel from "../../../component/project-details/ProjectDetailsPanel";
import RecentActivities from "../../../component/project-details/RecentActivities";
import ProjectProgressDonut from "../../../component/project-details/ProjectProgressDonut";

// New Components
import ProjectOverview from "../../../component/project-details/ProjectOverview";
import ProjectTasks from "../../../component/project-details/ProjectTasks";
import ProjectDiscussion from "../../../component/project-details/ProjectDiscussion";
import ProjectFiles from "../../../component/project-details/ProjectFiles";
import ProjectTimeline from "../../../component/project-details/ProjectTimeline";
import ProjectReports from "../../../component/project-details/ProjectReports";
import ProjectTeam from "../../../component/project-details/ProjectTeam";
import { WorkspaceContext } from "../../../context/WorkspaceContext";
import { ClipboardList } from "lucide-react";
import { AuthContext } from "../../../context/AuthContex";
import axios from "axios";

const getAllTasks = (items = []) => {
  let tasks = [];

  items.forEach((item) => {
    if (item.type === "task") {
      tasks.push(item);
    }

    if (Array.isArray(item.children) && item.children.length > 0) {
      tasks = [...tasks, ...getAllTasks(item.children)];
    }
  });

  return tasks;
};

const EmpProjectDetails = () => {
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const { treeData, getProjectTree, treeLoading } =
    useContext(WorkspaceContext);
  const { projectId } = useParams();
  const [projectDetails, setProjectDetails] = useState(null);
  const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  const getProjectDetails = useCallback(
    async (projectId) => {
      try {
        setProjectDetailsLoading(true);

        const response = await axios.get(
          `${api_url}/emp-project-overview/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              noCache: true,
            },
          },
        );

        if (response.data.status === 1) {
          setProjectDetails(response.data.data);
          console.log("Project Details:", response.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setProjectDetailsLoading(false);
      }
    },
    [api_url, token],
  );

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      try {
        await Promise.all([
          getProjectTree(projectId),
          getProjectDetails(projectId),
        ]);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [projectId, getProjectTree, getProjectDetails]);
  // console.log("Tree Data in EmpProjectDetails:", treeData);

  // Only recalculates when treeData changes
 

  if (treeLoading || projectDetailsLoading) {
    return (
      <div className="att-overview-card">
        <div className="att-overview-heading">
          <ClipboardList size={18} className="att-heading-icon" />
          <h2>Project Details</h2>
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
    <div className="epd-page">
      <div className="epd-main-row">
        {/* Left */}
        <div className="epd-col epd-col--left">
          <ProjectHeader  projectDetails={projectDetails?.project}  />

          <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <ProjectStatsCards />

          {/* Tab Content */}
          {activeTab === "overview" && <ProjectOverview projectDetails={projectDetails?.project} projectProgress={projectDetails?.project_progress} tasks={projectDetails?.tasks} />}

          {activeTab === "modules" && (
            <ProjectModulesList modulesInfo={treeData} />
          )}

          {activeTab === "tasks" && <ProjectTasks tasksData={projectDetails?.tasks} />}

          {activeTab === "discussions" && <ProjectDiscussion />}

          {activeTab === "team" && <ProjectTeam />}

          {activeTab === "files" && <ProjectFiles />}

          {activeTab === "timeline" && <ProjectTimeline />}

          {activeTab === "reports" && <ProjectReports />}
        </div>

        {/* Right */}
        <div className="epd-col epd-col--right">
          <ProjectDetailsPanel projectDetails={projectDetails?.project} />
          <RecentActivities />
          <ProjectProgressDonut projectProgress={projectDetails?.project_progress} />
        </div>
      </div>
    </div>
  );
};

export default EmpProjectDetails;
