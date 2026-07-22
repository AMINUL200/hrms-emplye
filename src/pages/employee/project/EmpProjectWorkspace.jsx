import React, { useContext, useEffect, useState } from "react";
import "./EmpProjectWorkspace.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { WorkspaceContext } from "../../../context/WorkspaceContext";
import { AuthContext } from "../../../context/AuthContex";
import axios from "axios";
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
  const [activeTab, setActiveTab] = useState("overview");
  const { projectId, workspaceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, data } = useContext(AuthContext);
  const { selectedItem, getProjectTree, syncWorkspaceRoute, treeLoading } =
    useContext(WorkspaceContext);
  const api_url = import.meta.env.VITE_API_URL;
  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;

  // =========================
  // STATE FOR WORKSPACE DETAILS
  // =========================

  const [workspaceDetails, setWorkspaceDetails] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState(null);

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

  // =========================
  // FETCH WORKSPACE DETAILS
  // =========================

  const fetchWorkspaceDetails = async () => {
    if (!workspaceId || !token || !projectId) return;

    try {
      setWorkspaceLoading(true);
      setWorkspaceError(null);

      const response = await axios.get(
        `${api_url}/module-details/${workspaceId}/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.status === 1) {
        setWorkspaceDetails(response.data.data);
      } else {
        setWorkspaceError("Failed to fetch workspace details");
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
      setWorkspaceError(error.message || "Failed to fetch workspace details");
    } finally {
      setWorkspaceLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceDetails();
  }, [projectId, workspaceId, token]);

  useEffect(() => {
    const tab = searchParams.get("activeTab");

    if (tab === "discussion") {
      setActiveTab("discussion");

      searchParams.delete("activeTab");
      setSearchParams(searchParams, { replace: true });
    }
  }, [workspaceId]);

  // =========================
  // NAVIGATION HANDLERS
  // =========================

  const onBack = () => {
    navigate(`/organization/assigned-project/${projectId}`);
  };

  // =========================
  // LOADING STATE
  // =========================

  if (treeLoading || workspaceLoading) {
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
      <WorkspaceTopBar
        onBack={onBack}
        permissionInfo={workspaceDetails?.current_user_permissions}
        selectedItemType={workspaceDetails?.details?.type}
        projectId={workspaceDetails?.details?.project_id}
        selectedItemId={workspaceDetails?.details?.id}
      />

      <WorkspaceHeader
        title={selectedItem?.title || "Workspace"}
        status={selectedItem?.status || "Open"}
        description={selectedItem?.description || "No description available"}
        startDate={selectedItem?.start_date || "N/A"}
        endDate={selectedItem?.end_date || "N/A"}
      />

      <WorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        permissionInfo={workspaceDetails?.current_user_permissions}
        selectedItemType={workspaceDetails?.details?.type}
      />

      {activeTab === "overview" && (
        <div className="epw-main-row">
          <div className="epw-col epw-col--left">
            <ProjectOverviewCard
              overViewInfo={workspaceDetails?.details}
              employeeCount={workspaceDetails?.employee_count}
            />
            <AttachedFilesPanel overViewInfo={workspaceDetails?.details} />
          </div>
          <div className="epw-col epw-col--right">
            <TeamMembersPanel
              teamInfo={workspaceDetails?.employees}
              onTabChange={setActiveTab}
            />
            <TasksSummaryPanel />
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <WorkspaceTeam teamInfo={workspaceDetails?.employees} />
      )}

      {activeTab === "submissions" && (
        <WorkspaceSubmission
          workspaceId={workspaceId}
          selectedItem={selectedItem}
          onSuccess={fetchWorkspaceDetails}
        />
      )}

      {activeTab === "work-history" && (
        <WorkspaceWorkHistory workHistory={workspaceDetails?.submissions} />
      )}

      {activeTab === "discussion" && (
        <WorkspaceDiscussion
          api_url={api_url}
          token={token}
          projectId={projectId}
          workItemId={workspaceId}
          STORAGE_URL={STORAGE_URL}
          currentUserId={data?.employee_id}
          employeeName={data?.employee_name}
          employeeId={data?.employee_id}
        />
      )}
    </div>
  );
};

export default EmpProjectWorkspace;
