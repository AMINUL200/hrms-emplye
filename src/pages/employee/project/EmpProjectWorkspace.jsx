import React, { useState } from 'react'
import "./EmpProjectWorkspace.css";

import WorkspaceTopBar from "../../../component/workspace/WorkspaceTopBar";
import WorkspaceHeader from "../../../component/workspace/WorkspaceHeader";
import WorkspaceTabs from "../../../component/workspace/WorkspaceTabs";
import ProjectOverviewCard from "../../../component/workspace/ProjectOverviewCard";
import AttachedFilesPanel from "../../../component/workspace/AttachedFilesPanel";
import TeamMembersPanel from "../../../component/workspace/TeamMembersPanel";
import TasksSummaryPanel from "../../../component/workspace/TasksSummaryPanel";
import WorkspaceTeam from '../../../component/workspace/WorkspaceTeam';
import WorkspaceSubmission from '../../../component/workspace/WorkspaceSubmission';
import WorkspaceWorkHistory from '../../../component/workspace/WorkspaceWorkHistory';
import WorkspaceDiscussion from '../../../component/workspace/WorkspaceDiscussion';

const EmpProjectWorkspace = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="epw-page">
      <WorkspaceTopBar />

      <WorkspaceHeader
        title="SWC UK Website Design"
        status="Open"
        description="Design and develop a modern, responsive website for SWC UK to enhance their online presence and user experience."
        startDate="24 Jun 2026"
        endDate="30 Sep 2026"
      />

      <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="epw-main-row">
          {/* Left column */}
          <div className="epw-col epw-col--left">
            <ProjectOverviewCard />
            <AttachedFilesPanel />
          </div>

          {/* Right column */}
          <div className="epw-col epw-col--right">
            <TeamMembersPanel />
            <TasksSummaryPanel />
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <WorkspaceTeam/>
      )}

      {activeTab === "submissions" && (
       <WorkspaceSubmission/>
      )}

      {activeTab === "work-history" && (
        <WorkspaceWorkHistory/>
      )}

      {/* {activeTab === "documents" && (
        <div className="epw-tab-placeholder">Documents content</div>
      )} */}

      {activeTab === "discussion" && (
       <WorkspaceDiscussion/>
      )}
    </div>
  )
}

export default EmpProjectWorkspace;