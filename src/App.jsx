import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import { AuthContext } from "./context/AuthContex";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./component/ProtectedRoute/ProtectedRoute";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import SubadminLogin from "./pages/Auth/SubadminLogin";
import Dashboard from "./pages/employee/Dashboard/Dashboard";
import ProfilePage from "./pages/employee/ProfilePage/ProfilePage";
import Leaves from "./pages/employee/Leaves/Leaves";
import Holiday from "./pages/employee/Holiday/Holiday";
import WorkUpdate from "./pages/employee/WorkUpdate/WorkUpdate";
import AddWorkUpdate from "./pages/employee/WorkUpdate/AddWorkUpdate";
import AttendanceStatus from "./pages/employee/Attendance/AttendanceStatus";
import HolidayList from "./pages/employee/HolidayList/HolidayList";
import HolidayApply from "./pages/employee/HolidayList/HolidayApply";
import PostPage from "./pages/post/PostPage";
import EmployeeAttendance from "./pages/employee/Employee Attendance/EmployeeAttendance";
import AssignedProject from "./pages/employee/project/AssignedProject";
import ViewProject from "./pages/employee/view project/ViewProject";

import "./App.css";
import LeaveApplication from "./pages/employee/Leaves/LeaveApplication";
import LeaveList from "./pages/employee/Leaves/LeaveList";
import ViewProjectPage from "./pages/employee/view project/ViewProjectPage";
import DashboardPage from "./pages/employee/Dashboard/DashboardPage";
import Notifications from "./pages/Notifications";
import AttendanceReport from "./pages/employee/Attendance/AttendanceReport";
import MessageCenter from "./pages/employee/message_center/MessageCenter";
import GuestLoginPage from "./pages/Auth/GuestLoginPage";
import ProfileRouter from "./pages/employee/ProfilePage/ProfileRouter";
import RecentTask from "./component/task/RecentTask";
import EmpAssignedTask from "./component/task/EmpAssignedTask";
import AssignedModule from "./pages/employee/project/AssignedModule";
import EmpAssignedModule from "./component/task/EmpAssignedModule";
import ModuleDetailsPage from "./component/task/ModuleDetailsPage";
import { generateToken } from "./utils/generateToken";
import EmpRollMaster from "./pages/employee/emp_roll/EmpRollMaster";
import EmpProjectPermissionMaster from "./pages/employee/emp_roll/EmpProjectPermissionMaster";
import EmpPermissionList from "./pages/employee/emp_roll/EmpPermissionList";
import CreateModule from "./component/task/CreateModule";
import EmpAssignTasks from "./pages/employee/project/EmpAssignTasks";
import EmpAdminViewTask from "./pages/employee/project/EmpAdminViewTask";
import WorkspacePage from "./pages/employee/project/WorkspacePage";
import WorkspaceLayout from "./layout/WorkspaceLayout";

const App = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          {/* Root redirect */}
          <Route
            path="/"
            element={
              <Navigate
                to={
                  isAuthenticated ? "/organization/employerdashboard" : "/login"
                }
                replace
              />
            }
          />

          {/* Auth routes */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to="/organization/employerdashboard" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <RegisterPage />
              ) : (
                <Navigate to="/organization/employerdashboard" replace />
              )
            }
          />
          <Route
            path="/guest-login"
            element={
              !isAuthenticated ? (
                <GuestLoginPage />
              ) : (
                <Navigate to="/organization/employerdashboard" replace />
              )
            }
          />
          <Route
            path="/subadmin"
            element={
              !isAuthenticated ? (
                <SubadminLogin />
              ) : (
                <Navigate to="/organization/employerdashboard" replace />
              )
            }
          />

          {/* Protected organization routes */}
          <Route path="/organization" element={<MainLayout />}>
            {/* <Route path="employerdashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
            <Route
              path="employerdashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="notification"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="employerprofile"
              element={
                <ProtectedRoute>
                  <ProfileRouter />
                </ProtectedRoute>
              }
            />

            <Route
              path="employee-attendance"
              element={
                <ProtectedRoute>
                  <EmployeeAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="attendance-status"
              element={
                <ProtectedRoute>
                  <AttendanceStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="attendance-report"
              element={
                <ProtectedRoute>
                  <AttendanceReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="leaves"
              element={
                <ProtectedRoute>
                  <Leaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="apply-leaves"
              element={
                <ProtectedRoute>
                  <LeaveApplication />
                </ProtectedRoute>
              }
            />
            <Route
              path="leaves-list"
              element={
                <ProtectedRoute>
                  <LeaveList />
                </ProtectedRoute>
              }
            />

            <Route
              path="holiday"
              element={
                <ProtectedRoute>
                  <Holiday />
                </ProtectedRoute>
              }
            />
            <Route
              path="work-update"
              element={
                <ProtectedRoute>
                  <WorkUpdate />
                </ProtectedRoute>
              }
            />
            <Route
              path="add-work-update"
              element={
                <ProtectedRoute>
                  <AddWorkUpdate />
                </ProtectedRoute>
              }
            />
            <Route
              path="holiday-list"
              element={
                <ProtectedRoute>
                  <HolidayList />
                </ProtectedRoute>
              }
            />
            <Route
              path="holiday-apply"
              element={
                <ProtectedRoute>
                  <HolidayApply />
                </ProtectedRoute>
              }
            />
            <Route
              path="post"
              element={
                <ProtectedRoute>
                  <PostPage />
                </ProtectedRoute>
              }
            />

            {/* Assigned Projects Route  */}
            <Route
              path="assigned-project"
              element={
                <ProtectedRoute>
                  <AssignedProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="assigned-project/:projectId"
              element={
                <ProtectedRoute>
                  <AssignedModule />
                </ProtectedRoute>
              }
            />

            <Route
              path="assigned-task/:projectId"
              element={
                <ProtectedRoute>
                  <EmpAssignTasks />
                </ProtectedRoute>
              }
            />
            {/* <Route path="assigned-view-task/:projectId" element={<ProtectedRoute><EmpAdminViewTask /></ProtectedRoute>} /> */}
            {/* <Route path="assigned-view-task/:projectId" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} /> */}

            <Route
              path="assigned-project/:projectId/module/:moduleId/tasks"
              element={
                <ProtectedRoute>
                  <ModuleDetailsPage />
                </ProtectedRoute>
              }
            />
            {/* <Route path="assigned-project/:id" element={<ProtectedRoute><ViewProjectPage /></ProtectedRoute>} /> */}
            <Route
              path="message-center"
              element={
                <ProtectedRoute>
                  <MessageCenter />
                </ProtectedRoute>
              }
            />
            <Route
              path="assigned-task/:id"
              element={
                <ProtectedRoute>
                  <RecentTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="emp-assigned-task/:id"
              element={
                <ProtectedRoute>
                  <EmpAssignedTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="emp-add-module/:p_id"
              element={
                <ProtectedRoute>
                  {/* <EmpAssignedModule /> */}
                  <CreateModule />
                </ProtectedRoute>
              }
            />
            <Route
              path="emp-assigned-module/:p_id/:m_id"
              element={
                <ProtectedRoute>
                  <EmpAssignedModule />
                  {/* <CreateModule/> */}
                </ProtectedRoute>
              }
            />
            <Route
              path="master-roll"
              element={
                <ProtectedRoute>
                  <EmpRollMaster />
                </ProtectedRoute>
              }
            />
            <Route
              path="project-permission"
              element={
                <ProtectedRoute>
                  <EmpProjectPermissionMaster />
                </ProtectedRoute>
              }
            />
            <Route
              path="permission-list"
              element={
                <ProtectedRoute>
                  <EmpPermissionList />
                </ProtectedRoute>
              }
            />
          </Route>

              {/* Workspace Route */}
          <Route path="/organization" element={<WorkspaceLayout />}>
            <Route
              path="workspace/:projectId"
              element={
                <ProtectedRoute>
                  <WorkspacePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  isAuthenticated ? "/organization/employerdashboard" : "/login"
                }
                replace
              />
            }
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
