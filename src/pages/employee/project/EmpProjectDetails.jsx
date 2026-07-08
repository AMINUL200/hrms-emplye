import React, { useState } from "react";
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

const EmpProjectDetails = () => {
  const { projectId } = useParams();

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="epd-page">
      <div className="epd-main-row">

        {/* Left */}
        <div className="epd-col epd-col--left">

          <ProjectHeader
            projectName="Website Development"
            status="Active"
          />

          <ProjectTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <ProjectStatsCards />

        

          {/* Tab Content */}
          {activeTab === "overview" && (
           <ProjectOverview/>
          )}

          {activeTab === "modules" && (
            <ProjectModulesList />
          )}

          {activeTab === "tasks" && (
            <ProjectTasks />
          )}

          {activeTab === "discussions" && (
            <ProjectDiscussion />
          )}

          {activeTab === "team" && (
            <ProjectTeam />
          )}

          {activeTab === "files" && (
            <ProjectFiles />
          )}

          {activeTab === "timeline" && (
            <ProjectTimeline />
          )}

          {activeTab === "reports" && (
            <ProjectReports />
          )}

        </div>

        {/* Right */}
        <div className="epd-col epd-col--right">
          <ProjectDetailsPanel />
          <RecentActivities />
          <ProjectProgressDonut />
        </div>

      </div>
    </div>
  );
};

export default EmpProjectDetails;