import React, {
  useEffect,
  useState,
} from "react";

import Navbar from "../component/common/Navbar";

import WorkspaceSidebar from
"../component/common/WorkspaceSidebar";

import { Outlet } from "react-router-dom";

import WorkspaceProvider from
"../context/WorkspaceContext";

const WorkspaceLayout = () => {

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [isMediumScreen,
    setIsMediumScreen] =
    useState(false);

  const [isSmallScreen,
    setIsSmallScreen] =
    useState(false);

  useEffect(() => {

    const checkScreenSize = () => {

      const width =
        window.innerWidth;

      setIsMediumScreen(
        width >= 768
      );

      setIsSmallScreen(
        width < 768
      );

      if (width < 768) {
        setSidebarOpen(false);

      } else if (
        width >= 768 &&
        width < 1024
      ) {

        setSidebarOpen(false);

      } else {

        setSidebarOpen(true);

      }
    };

    checkScreenSize();

    window.addEventListener(
      "resize",
      checkScreenSize
    );

    return () =>
      window.removeEventListener(
        "resize",
        checkScreenSize
      );

  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (

    <WorkspaceProvider>

      <div className="app">

        <Navbar
          toggleSidebar={
            toggleSidebar
          }
          isOpen={sidebarOpen}
          isMediumScreen={
            isMediumScreen
          }
          isSmallScreen={
            isSmallScreen
          }
        />

        <WorkspaceSidebar
          isOpen={sidebarOpen}
          toggleSidebar={
            toggleSidebar
          }
          isMediumScreen={
            isMediumScreen
          }
          isSmallScreen={
            isSmallScreen
          }
        />

        <div
          className={`
            workspace-main-content
            ${
              sidebarOpen &&
              !isSmallScreen
                ? "sidebar-open"
                : "sidebar-collapsed"
            }
          `}
        >

          <Outlet />

        </div>

      </div>

    </WorkspaceProvider>
  );
};

export default WorkspaceLayout;