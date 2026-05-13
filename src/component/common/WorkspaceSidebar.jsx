import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import axios from "axios";

import {
  WorkspaceContext,
} from "../../context/WorkspaceContext";

import {
  AuthContext,
} from "../../context/AuthContex";

import "./WorkspaceSidebar.css";

const WorkspaceSidebar = ({
  isOpen,
}) => {

  const { projectId } =
    useParams();

  const { token } =
    useContext(AuthContext);

  const api_url =
    import.meta.env.VITE_API_URL;

  const {
    treeData,
    setTreeData,

    selectedItem,
    setSelectedItem,

    expanded,
    setExpanded,
  } = useContext(
    WorkspaceContext
  );

  const [searchTerm,
    setSearchTerm] =
    useState("");

  // =========================
  // GET TREE
  // =========================

  const getProjectTree =
    async () => {

      try {

        const response =
          await axios.get(
            `${api_url}/project-tree/${projectId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        let modules = [];

        if (
          response?.data?.data
            ?.project?.modules
        ) {

          modules =
            response.data.data
              .project.modules;

        }

        else if (
          Array.isArray(
            response?.data?.data
          )
        ) {

          modules =
            response.data.data;

        }

        setTreeData(modules);

        if (
          modules.length > 0
        ) {

          setSelectedItem(
            modules[0]
          );

          setExpanded({
            [modules[0].id]:
              true,
          });

        }

      } catch (error) {

        console.log(error);

      }
    };

  useEffect(() => {
    getProjectTree();
  }, [projectId]);

  // =========================
  // TOGGLE
  // =========================

  const toggleExpand =
    (id) => {

      setExpanded((prev) => ({
        ...prev,
        [id]:
          !prev[id],
      }));
    };

  // =========================
  // FILTER
  // =========================

  const filterTree = (
    items,
    term
  ) => {

    if (!term) return items;

    return items
      .map((item) => {

        const matches =
          item.title
            .toLowerCase()
            .includes(
              term.toLowerCase()
            );

        const filteredChildren =
          item.children
            ? filterTree(
                item.children,
                term
              )
            : [];

        if (
          matches ||
          filteredChildren.length > 0
        ) {

          return {
            ...item,
            children:
              filteredChildren,
          };
        }

        return null;
      })

      .filter(Boolean);
  };

  const filteredTreeData =
    useMemo(
      () =>
        filterTree(
          treeData,
          searchTerm
        ),
      [treeData, searchTerm]
    );

  // =========================
  // TREE NODE
  // =========================

  const TreeNode = ({
    item,
    level = 0,
  }) => {

    const hasChildren =
      item.children?.length > 0;

    const isExpanded =
      expanded[item.id];

    const isSelected =
      selectedItem?.id === item.id;

    // Get icon based on type
    const getTypeIcon = () => {
      switch(item.type) {
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

    // Get type class for styling
    const getTypeClass = () => {
      switch(item.type) {
        case "module":
          return "type-module";
        case "submodule":
          return "type-submodule";
        case "task":
          return "type-task";
        case "subtask":
          return "type-subtask";
        default:
          return "";
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
        >
          {hasChildren ? (
            <button
              className={`tree-expand-btn ${isExpanded ? "expanded" : ""}`}
              onClick={() => toggleExpand(item.id)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ) : (
            <span className="tree-expand-placeholder"></span>
          )}
          
          <div
            className="tree-label"
            onClick={() => setSelectedItem(item)}
          >
            <span className={`tree-icon ${getTypeClass()}`}>
              {getTypeIcon()}
            </span>
            <div className="tree-info">
              <span className="tree-title">{item.title}</span>
              <span className="tree-type-badge">{item.type}</span>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <ul className="tree-children">
            {item.children.map((child) => (
              <TreeNode
                key={child.id}
                item={child}
                level={level + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  };

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
            {/* <span className="search-icon">🔍</span> */}
          </div>
        </div>

        <div className="workspace-tree-wrapper">
          {filteredTreeData.length > 0 ? (
            <ul className="workspace-tree">
              {filteredTreeData.map((item) => (
                <TreeNode
                  key={item.id}
                  item={item}
                />
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