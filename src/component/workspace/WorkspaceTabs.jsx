import React, { useState, useMemo } from "react";
import "./WorkspaceTabs.css";
import {
  LayoutGrid,
  Users,
  ListChecks,
  Milestone,
  FileText,
  MessageSquare,
  Download,
} from "lucide-react";

const WorkspaceTabs = ({
  activeTab,
  onTabChange,
  permissionInfo = [],
  selectedItemType = null,
}) => {
  const [internalActive, setInternalActive] = useState("overview");
  const current = activeTab ?? internalActive;

  // ========================================
  // CHECK PERMISSIONS
  // ========================================

  const hasPermission = (permissionName) => {
    return permissionInfo.some((p) => p.permission_name === permissionName);
  };

  // ========================================
  // TABS CONFIGURATION WITH PERMISSIONS
  // ========================================

  const tabsConfig = useMemo(() => {
    const canCreateSubmission = hasPermission("create_submission");
    const canViewSubmission = hasPermission("view_submission");
    const canViewSubmissionAll = hasPermission("view_submission");

    // Combined view submission permission
    const canViewAnySubmission = canViewSubmission || canViewSubmissionAll;

    return [
      {
        key: "overview",
        label: "Overview",
        icon: LayoutGrid,
        enabled: true,
        requiredPermission: null,
      },
      {
        key: "team",
        label: "Team Members",
        icon: Users,
        enabled: true,
        requiredPermission: null,
      },
      {
        key: "submissions",
        label: "Submit Work",
        icon: Download,
        enabled: canCreateSubmission,
        requiredPermission: "create_submission",
        disabledReason: "You don't have permission to submit work",
      },
      {
        key: "work-history",
        label: "Work History",
        icon: Milestone,
        enabled: canViewAnySubmission,
        requiredPermission: "view_submission",
        disabledReason: "You don't have permission to view work history",
      },
      {
        key: "discussion",
        label: "Discussion",
        icon: MessageSquare,
        enabled: true,
        requiredPermission: null,
      },
    ];
  }, [permissionInfo]);

  // ========================================
  // FILTER TABS BASED ON ITEM TYPE
  // ========================================

  const filteredTabs = useMemo(() => {
    // For task and subtask, show all tabs
    if (selectedItemType === "task" || selectedItemType === "subtask") {
      return tabsConfig;
    }

    // For module and submodule (or any other type), show only overview, team, and discussion
    return tabsConfig.filter(
      (tab) =>
        tab.key === "overview" ||
        tab.key === "team" ||
        tab.key === "discussion",
    );
  }, [tabsConfig, selectedItemType]);

  // ========================================
  // HANDLE TAB CLICK
  // ========================================

  const handleClick = (tab) => {
    if (!tab.enabled) {
      // Optionally show toast or tooltip
      console.warn(tab.disabledReason || `${tab.label} is not available`);
      return;
    }

    if (onTabChange) {
      onTabChange(tab.key);
    } else {
      setInternalActive(tab.key);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="wtab-wrap">
      {filteredTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = current === tab.key;
        const isDisabled = !tab.enabled;

        return (
          <button
            type="button"
            key={tab.key}
            className={`
              wtab-tab 
              ${isActive ? "wtab-tab--active" : ""}
              ${isDisabled ? "wtab-tab--disabled" : ""}
            `}
            onClick={() => handleClick(tab)}
            disabled={isDisabled}
            title={isDisabled ? tab.disabledReason : ""}
          >
            <Icon size={15} />
            {tab.label}
            {isDisabled && <span className="wtab-lock-icon">🔒</span>}
          </button>
        );
      })}
    </div>
  );
};

export default WorkspaceTabs;
