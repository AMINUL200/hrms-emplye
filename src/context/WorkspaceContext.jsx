import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import axios from "axios";
import { AuthContext } from "./AuthContex";

export const WorkspaceContext = createContext();

const WorkspaceProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  // =========================
  // STATES
  // =========================

  const [treeData, setTreeData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState(null);
  
  // Track current route values (synced from parent)
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);

  // Ref to prevent double selection on initial load
  const initialSelectionDone = useRef(false);

  // =========================
  // HELPER: FIND ITEM BY ID (Recursive)
  // =========================

  const findItemById = useCallback((items, id) => {
    if (!items || !Array.isArray(items)) return null;
    
    const targetId = parseInt(id);
    
    for (const item of items) {
      if (item.id === targetId) {
        return item;
      }
      if (item.children && Array.isArray(item.children)) {
        const found = findItemById(item.children, targetId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // =========================
  // HELPER: FIND PARENT IDS (Recursive)
  // =========================

  const findParentIds = useCallback((items, targetId, path = []) => {
    if (!items || !Array.isArray(items)) return null;
    
    const targetIdNum = parseInt(targetId);
    
    for (const item of items) {
      if (item.id === targetIdNum) {
        return path;
      }
      if (item.children && Array.isArray(item.children)) {
        const result = findParentIds(item.children, targetIdNum, [
          ...path,
          item.id,
        ]);
        if (result) return result;
      }
    }
    return null;
  }, []);

  // =========================
  // HELPER: GET EXPANDED STATE
  // =========================

  const getExpandedState = useCallback((items, targetId) => {
    const parents = findParentIds(items, targetId);
    const expand = {};
    
    if (parents) {
      parents.forEach((id) => {
        expand[id] = true;
      });
    }
    
    // Also expand the target node itself if it has children
    const target = findItemById(items, targetId);
    if (target && target.children && target.children.length > 0) {
      expand[targetId] = true;
    }
    
    return expand;
  }, [findItemById, findParentIds]);

  // =========================
  // API: GET PROJECT TREE
  // =========================

  const getProjectTree = useCallback(
    async (projectId) => {
      if (!projectId || !token) {
        setTreeData([]);
        setSelectedItem(null);
        setExpanded({});
        return [];
      }

      try {
        setTreeLoading(true);
        setTreeError(null);

        const response = await axios.get(
          `${api_url}/project-tree/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let modules = [];

        if (response?.data?.data?.project?.modules) {
          modules = response.data.data.project.modules;
        } else if (Array.isArray(response?.data?.data)) {
          modules = response.data.data;
        } else if (Array.isArray(response?.data)) {
          modules = response.data;
        }

        setTreeData(modules);
        return modules;
      } catch (error) {
        console.error("Error fetching project tree:", error);
        setTreeError(error);
        setTreeData([]);
        return [];
      } finally {
        setTreeLoading(false);
      }
    },
    [api_url, token]
  );

  // =========================
  // SYNC: ROUTE VALUES -> CONTEXT
  // =========================

  const syncWorkspaceRoute = useCallback((projectId, workspaceId) => {
    setCurrentProjectId(projectId);
    setCurrentWorkspaceId(workspaceId);
  }, []);

  // =========================
  // EFFECT: SELECT ITEM BASED ON WORKSPACE ID
  // =========================

  useEffect(() => {
    // Don't run if tree is empty or loading
    if (!treeData || treeData.length === 0 || treeLoading) {
      return;
    }

    // If we have a workspaceId in the URL, select that item
    if (currentWorkspaceId) {
      const item = findItemById(treeData, currentWorkspaceId);
      
      if (item) {
        setSelectedItem(item);
        
        // Get expanded state for this item
        const expand = getExpandedState(treeData, currentWorkspaceId);
        setExpanded(expand);
        initialSelectionDone.current = true;
        return;
      }
    }

    // No workspaceId or item not found -> select first module
    const firstItem = treeData[0];
    if (firstItem) {
      setSelectedItem(firstItem);
      setExpanded({
        [firstItem.id]: true,
      });
    } else {
      setSelectedItem(null);
      setExpanded({});
    }
    
    initialSelectionDone.current = true;
  }, [currentWorkspaceId, treeData, treeLoading, findItemById, getExpandedState]);

  // =========================
  // SELECT ITEM & NAVIGATE
  // =========================

  const selectItem = useCallback(
    (item, navigate) => {
      if (!item || !currentProjectId) return;
      
      setSelectedItem(item);
      
      // Expand parent paths
      const expand = getExpandedState(treeData, item.id);
      setExpanded(expand);
      
      // Navigate to workspace
      if (navigate) {
        navigate(`/organization/assigned-project/${currentProjectId}/workspace/${item.id}`);
      }
    },
    [treeData, getExpandedState, currentProjectId]
  );

  // =========================
  // TOGGLE EXPAND
  // =========================

  const toggleExpand = useCallback((itemId) => {
    setExpanded((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  // =========================
  // CONTEXT VALUE
  // =========================

  const value = useMemo(
    () => ({
      // Tree data
      treeData,
      setTreeData,
      
      // Selected item
      selectedItem,
      setSelectedItem,
      
      // Expanded nodes
      expanded,
      setExpanded,
      toggleExpand,
      
      // API methods
      getProjectTree,
      
      // Selection & navigation
      selectItem,
      
      // Route sync
      syncWorkspaceRoute,
      currentProjectId,
      currentWorkspaceId,
      
      // Loading / Error
      treeLoading,
      treeError,
      
      // Helpers
      findItemById,
      findParentIds,
      getExpandedState,
    }),
    [
      treeData,
      selectedItem,
      expanded,
      treeLoading,
      treeError,
      getProjectTree,
      selectItem,
      toggleExpand,
      syncWorkspaceRoute,
      currentProjectId,
      currentWorkspaceId,
      findItemById,
      findParentIds,
      getExpandedState,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;