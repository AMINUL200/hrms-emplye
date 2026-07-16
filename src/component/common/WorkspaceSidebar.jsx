import React, { useContext, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { WorkspaceContext } from "../../context/WorkspaceContext";
import "./WorkspaceSidebar.css";

const WorkspaceSidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const {
    treeData,
    selectedItem,
    expanded,
    toggleExpand,
    selectItem,
    treeLoading,
  } = useContext(WorkspaceContext);

  const [searchTerm, setSearchTerm] = useState("");

  // =========================
  // FILTER TREE
  // =========================

  const filterTree = (items, term) => {
    if (!term) return items;

    return items
      .map((item) => {
        const matches = item.title?.toLowerCase().includes(term.toLowerCase()) || false;
        const filteredChildren = item.children
          ? filterTree(item.children, term)
          : [];

        if (matches || filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredTreeData = useMemo(
    () => filterTree(treeData, searchTerm),
    [treeData, searchTerm]
  );

  // =========================
  // RENDER TREE NODE (Recursive)
  // =========================

  const TreeNode = ({ item, level = 0 }) => {
    const hasChildren = item.children?.length > 0;
    const isExpanded = expanded[item.id] || false;
    const isSelected = selectedItem?.id === item.id;

    const handleClick = () => {
      selectItem(item, navigate);
    };

    const handleToggle = (e) => {
      e.stopPropagation();
      toggleExpand(item.id);
    };

    // Get icon based on type
    const getTypeIcon = () => {
      switch (item.type) {
        case "module":
          return "📁";
        case "submodule":
          return "📂";
        case "task":
          return "✓";
        case "subtask":
          return "•";
        default:
          return "📄";
      }
    };

    return (
      <li className="workspace-tree-node">
        <div
          className={`
            workspace-tree-item
            ${isSelected ? "active" : ""}
            ${hasChildren ? "has-children" : ""}
          `}
          style={{
            paddingLeft: `${level * 20 + 12}px`,
          }}
          onClick={handleClick}
        >
          {hasChildren ? (
            <button
              className={`tree-expand-btn ${isExpanded ? "expanded" : ""}`}
              onClick={handleToggle}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ) : (
            <span className="tree-expand-placeholder"></span>
          )}

          <span className="tree-icon">{getTypeIcon()}</span>
          <span className="tree-title">{item.title}</span>
          
          {item.type && (
            <span className="tree-type-badge">{item.type}</span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <ul className="tree-children">
            {item.children.map((child) => (
              <TreeNode key={child.id} item={child} level={level + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  // =========================
  // LOADING STATE
  // =========================

  if (treeLoading) {
    return (
      <aside className={`workspace-sidebar ${isOpen ? "visible" : "not-visible"}`}>
        <div className="workspace-sidebar-inner">
          <div className="workspace-loading">
            <div className="workspace-loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </aside>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <aside
      className={`
        workspace-sidebar
        ${isOpen ? "visible" : "not-visible"}
      `}
    >
      <div className="workspace-sidebar-inner">
        <div className="workspace-sidebar-header">
          <div className="workspace-header-title">
            <span className="workspace-title-icon">📊</span>
            <h3>Project Structure</h3>
          </div>

          <div className="workspace-search-wrapper">
            <input
              type="text"
              placeholder="Search modules, tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="workspace-search-input"
            />
          </div>
        </div>

        <div className="workspace-tree-wrapper">
          {filteredTreeData.length > 0 ? (
            <ul className="workspace-tree">
              {filteredTreeData.map((item) => (
                <TreeNode key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <div className="workspace-empty-state">
              <span className="empty-icon">📭</span>
              <p>No modules found</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default WorkspaceSidebar;