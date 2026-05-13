import {
  createContext,
  useState,
} from "react";

export const WorkspaceContext =
  createContext();

const WorkspaceProvider = ({
  children,
}) => {

  const [treeData, setTreeData] =
    useState([]);

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [expanded, setExpanded] =
    useState({});

  return (
    <WorkspaceContext.Provider
      value={{
        treeData,
        setTreeData,

        selectedItem,
        setSelectedItem,

        expanded,
        setExpanded,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;