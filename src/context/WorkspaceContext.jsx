import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import axios from "axios";
import { AuthContext } from "./AuthContex";

export const WorkspaceContext =
  createContext();

const WorkspaceProvider = ({
  children,
}) => {
  const { token } =
    useContext(AuthContext);

  const api_url =
    import.meta.env.VITE_API_URL;

  // =========================
  // STATES
  // =========================

  const [treeData, setTreeData] =
    useState([]);

  const [
    selectedItem,
    setSelectedItem,
  ] = useState(null);

  const [expanded, setExpanded] =
    useState({});

  const [
    treeLoading,
    setTreeLoading,
  ] = useState(false);

  const [
    treeError,
    setTreeError,
  ] = useState(null);

  // =========================
  // GET PROJECT TREE
  // =========================

  const getProjectTree =
    useCallback(
      async (projectId) => {
        if (!projectId || !token) {
          return [];
        }

        try {
          setTreeLoading(true);
          setTreeError(null);

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

          // API structure:
          // data.project.modules
          if (
            response?.data?.data
              ?.project?.modules
          ) {
            modules =
              response.data.data
                .project.modules;
          }

          // Alternative API structure:
          // data = []
          else if (
            Array.isArray(
              response?.data?.data
            )
          ) {
            modules =
              response.data.data;
          }

          // =========================
          // SAVE TREE DATA
          // =========================

          setTreeData(modules);

          // =========================
          // SELECT FIRST MODULE
          // =========================

          if (modules.length > 0) {
            setSelectedItem(
              modules[0]
            );

            setExpanded({
              [modules[0].id]:
                true,
            });
          } else {
            setSelectedItem(null);
            setExpanded({});
          }

          return modules;
        } catch (error) {
          console.error(
            "Error fetching project tree:",
            error
          );

          setTreeError(error);

          return [];
        } finally {
          setTreeLoading(false);
        }
      },
      [api_url, token]
    );

  // =========================
  // CONTEXT
  // =========================

  return (
    <WorkspaceContext.Provider
      value={{
        // Tree
        treeData,
        setTreeData,

        // Selected Item
        selectedItem,
        setSelectedItem,

        // Expanded Nodes
        expanded,
        setExpanded,

        // API
        getProjectTree,

        // Loading / Error
        treeLoading,
        treeError,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;