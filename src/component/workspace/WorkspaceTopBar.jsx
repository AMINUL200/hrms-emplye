import React from "react";
import { useNavigate } from "react-router-dom";
import "./WorkspaceTopBar.css";
import { ArrowLeft, Pencil, Users, Plus, Layers } from "lucide-react";

const WorkspaceTopBar = ({ 
  onBack, 
  permissionInfo = [], 
  selectedItemType = null,
  selectedItemId = null,
  projectId = null,
}) => {
  const navigate = useNavigate();

  // ========================================
  // CHECK PERMISSIONS
  // ========================================

  const hasPermission = (permissionName) => {
    return permissionInfo.some((p) => p.permission_name === permissionName);
  };

  // ========================================
  // GET ACTION CONFIG
  // ========================================

  const getActionConfig = () => {
    switch (selectedItemType) {
      case "module":
        return {
          assign: {
            label: "Assign Module",
            permission: "assign_module",
            icon: Users,
            navigateTo: `/organization/emp-assign-work-item/${projectId}?workitem_id=${selectedItemId}&type=module`,
          },
          create: {
            label: "Create Submodule",
            permission: "create_submodule",
            icon: Plus,
            navigateTo: `/organization/emp-add-module/${projectId}?workitem_id=${selectedItemId}&type=submodule`,
          },
        };

      case "submodule":
        return {
          assign: {
            label: "Assign Submodule",
            permission: "assign_submodule",
            icon: Users,
            navigateTo: `/organization/emp-assign-work-item/${projectId}?workitem_id=${selectedItemId}&type=submodule`,
          },
          create: {
            label: "Create Task",
            permission: "create_task",
            icon: Plus,
            navigateTo: `/organization/emp-add-module/${projectId}?workitem_id=${selectedItemId}&type=task`,
          },
        };

      case "task":
        return {
          assign: {
            label: "Assign Task",
            permission: "assign_task",
            icon: Users,
            navigateTo: `/organization/emp-assign-work-item/${projectId}?workitem_id=${selectedItemId}&type=task`,
          },
          create: {
            label: "Create Subtask",
            permission: "create_subtask",
            icon: Plus,
            navigateTo: `/organization/emp-add-module/${projectId}?workitem_id=${selectedItemId}&type=subtask`,
          },
        };

      case "subtask":
        return {
          assign: {
            label: "Assign Subtask",
            permission: "assign_subtask",
            icon: Users,
            navigateTo: `/organization/emp-assign-work-item/${projectId}?workitem_id=${selectedItemId}&type=subtask`,
          },
          create: null, // No create for subtask
        };

      default:
        return { assign: null, create: null };
    }
  };

  // ========================================
  // HANDLE NAVIGATION
  // ========================================

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
    }
  };

  // ========================================
  // GET ACTION CONFIG AND CHECK PERMISSIONS
  // ========================================

  const actionConfig = getActionConfig();

  const canAssign = actionConfig.assign && hasPermission(actionConfig.assign.permission);
  const canCreate = actionConfig.create && hasPermission(actionConfig.create.permission);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="wtb-wrap">
      {/* Left side - Back Button */}
      <button type="button" className="wtb-back-btn" onClick={onBack}>
        <ArrowLeft size={15} />
        Back to Projects
      </button>

      {/* Right side - Action Buttons */}
      <div className="wtb-actions">
        {/* Assign Button - Primary (Violet) */}
        {canAssign && (
          <button
            type="button"
            className="wtb-btn wtb-btn--primary"
            onClick={() => handleNavigate(actionConfig.assign.navigateTo)}
          >
            <Users size={15} />
            {actionConfig.assign.label}
          </button>
        )}

        {/* Create Button - Outline (Violet border) */}
        {canCreate && (
          <button
            type="button"
            className="wtb-btn wtb-btn--outline"
            onClick={() => handleNavigate(actionConfig.create.navigateTo)}
          >
            <Plus size={15} />
            {actionConfig.create.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkspaceTopBar;