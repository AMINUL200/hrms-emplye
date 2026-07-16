import React, { useContext, useEffect } from "react";
import "./EmpProjectWorkspace.css";
import { useNavigate, useParams } from "react-router-dom";
import { WorkspaceContext } from "../../../context/WorkspaceContext";
import WorkspaceTopBar from "../../../component/workspace/WorkspaceTopBar";
import WorkspaceHeader from "../../../component/workspace/WorkspaceHeader";
import WorkspaceTabs from "../../../component/workspace/WorkspaceTabs";
import ProjectOverviewCard from "../../../component/workspace/ProjectOverviewCard";
import AttachedFilesPanel from "../../../component/workspace/AttachedFilesPanel";
import TeamMembersPanel from "../../../component/workspace/TeamMembersPanel";
import TasksSummaryPanel from "../../../component/workspace/TasksSummaryPanel";
import WorkspaceTeam from "../../../component/workspace/WorkspaceTeam";
import WorkspaceSubmission from "../../../component/workspace/WorkspaceSubmission";
import WorkspaceWorkHistory from "../../../component/workspace/WorkspaceWorkHistory";
import WorkspaceDiscussion from "../../../component/workspace/WorkspaceDiscussion";
import { ClipboardList } from "lucide-react";

const EmpProjectWorkspace = () => {
  const [activeTab, setActiveTab] = React.useState("overview");
  const { projectId, workspaceId } = useParams();
  const { selectedItem, getProjectTree, syncWorkspaceRoute, treeLoading } =
    useContext(WorkspaceContext);
  const navigate = useNavigate();
  // =========================
  // SYNC ROUTE VALUES TO CONTEXT
  // =========================

  useEffect(() => {
    if (projectId) {
      syncWorkspaceRoute(projectId, workspaceId || null);
    }
  }, [projectId, workspaceId, syncWorkspaceRoute]);

  // =========================
  // FETCH PROJECT TREE
  // =========================

  useEffect(() => {
    if (projectId) {
      getProjectTree(projectId);
    }
  }, [projectId, getProjectTree]);

  const onBack = () => {
    navigate(`/organization/assigned-project/${projectId}`);
  };

  // =========================
  // LOADING STATE
  // =========================

  if (treeLoading) {
    return (
      <div className="att-overview-card">
        <div className="att-overview-heading">
          <ClipboardList size={18} className="att-heading-icon" />
          <h2>Work Details</h2>
        </div>
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading Work data...</p>
        </div>
      </div>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className="epw-page">
      <WorkspaceTopBar onBack={onBack} />

      <WorkspaceHeader
        title={selectedItem?.title || "Workspace"}
        status={selectedItem?.status || "Open"}
        description={selectedItem?.description || "No description available"}
        startDate={selectedItem?.start_date || "N/A"}
        endDate={selectedItem?.end_date || "N/A"}
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

      {activeTab === "team" && <WorkspaceTeam />}
      {activeTab === "submissions" && <WorkspaceSubmission />}
      {activeTab === "work-history" && <WorkspaceWorkHistory />}
      {activeTab === "discussion" && <WorkspaceDiscussion />}
    </div>
  );
};

export default EmpProjectWorkspace;
