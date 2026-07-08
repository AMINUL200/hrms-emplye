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

// ==================== AUTH PAGES ====================
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import SubadminLogin from "./pages/Auth/SubadminLogin";
import GuestLoginPage from "./pages/Auth/GuestLoginPage";

// ==================== EMPLOYEE PAGES ====================
// Dashboard
import Dashboard from "./pages/employee/Dashboard/Dashboard";
import DashboardPage from "./pages/employee/Dashboard/DashboardPage";
import EmpDashboard from "./pages/emp_dashboard/EmpDashboard";

// Profile
import ProfilePage from "./pages/employee/ProfilePage/ProfilePage";
import ProfileRouter from "./pages/employee/ProfilePage/ProfileRouter";

// Leaves
import Leaves from "./pages/employee/Leaves/Leaves";
import LeaveApplication from "./pages/employee/Leaves/LeaveApplication";
import LeaveList from "./pages/employee/Leaves/LeaveList";
import EmpLeaveDashboard from "./pages/employee/Leaves/EmpLeaveDashboard";

// Holiday
import Holiday from "./pages/employee/Holiday/Holiday";
import HolidayList from "./pages/employee/HolidayList/HolidayList";
import HolidayApply from "./pages/employee/HolidayList/HolidayApply";

// Work Update
import WorkUpdate from "./pages/employee/WorkUpdate/WorkUpdate";
import AddWorkUpdate from "./pages/employee/WorkUpdate/AddWorkUpdate";

// Attendance
import AttendanceStatus from "./pages/employee/Attendance/AttendanceStatus";
import EmployeeAttendance from "./pages/employee/Employee Attendance/EmployeeAttendance";
import AttendanceReport from "./pages/employee/Attendance/AttendanceReport";
import EMPAttendanceDashboard from "./pages/employee/Attendance/EMPAttendanceDashboard";

// Projects
import AssignedProject from "./pages/employee/project/AssignedProject";
import ViewProject from "./pages/employee/view project/ViewProject";
import ViewProjectPage from "./pages/employee/view project/ViewProjectPage";
import EmpCreateProject from "./pages/employee/project/EmpCreateProject";
import EmpAssignTasks from "./pages/employee/project/EmpAssignTasks";
import EmpAdminViewTask from "./pages/employee/project/EmpAdminViewTask";
import WorkspacePage from "./pages/employee/project/WorkspacePage";
import AssignedModule from "./pages/employee/project/AssignedModule";

// Tasks
import RecentTask from "./component/task/RecentTask";
import EmpAssignedTask from "./component/task/EmpAssignedTask";
import EmpAssignedModule from "./component/task/EmpAssignedModule";
import ModuleDetailsPage from "./component/task/ModuleDetailsPage";
import CreateModule from "./component/task/CreateModule";
import AssignWorkItem from "./component/task/AssignWorkItem";

// Employee Roll
import EmpRollMaster from "./pages/employee/emp_roll/EmpRollMaster";
import EmpProjectPermissionMaster from "./pages/employee/emp_roll/EmpProjectPermissionMaster";
import EmpPermissionList from "./pages/employee/emp_roll/EmpPermissionList";

// Other
import PostPage from "./pages/post/PostPage";
import Notifications from "./pages/Notifications";
import MessageCenter from "./pages/employee/message_center/MessageCenter";

// ==================== LAYOUTS ====================
import WorkspaceLayout from "./layout/WorkspaceLayout";

// ==================== UTILS ====================
import { generateToken } from "./utils/generateToken";

// ==================== STYLES ====================
import "./App.css";
import EmpProjectDetails from "./pages/employee/project/EmpProjectDetails";
import EmpProfilePage from "./pages/employee/ProfilePage/EmpProfilePage";
import EmpProjectList from "./pages/employee/project/EmpProjectList";

const App = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          {/* ============================================
              ROOT REDIRECT
              ============================================ */}
          <Route
            path="/"
            element={
              <Navigate
                to={
                  isAuthenticated ? "/organization/employee-dashboard" : "/login"
                }
                replace
              />
            }
          />

          {/* ============================================
              AUTH ROUTES (No Protection)
              ============================================ */}
          {/* Login Route */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to="/organization/employee-dashboard" replace />
              )
            }
          />

          {/* Register Route */}
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <RegisterPage />
              ) : (
                <Navigate to="/organization/employee-dashboard" replace />
              )
            }
          />

          {/* Guest Login Route */}
          <Route
            path="/guest-login"
            element={
              !isAuthenticated ? (
                <GuestLoginPage />
              ) : (
                <Navigate to="/organization/employee-dashboard" replace />
              )
            }
          />

          {/* Subadmin Login Route */}
          <Route
            path="/subadmin"
            element={
              !isAuthenticated ? (
                <SubadminLogin />
              ) : (
                <Navigate to="/organization/employee-dashboard" replace />
              )
            }
          />

          {/* ============================================
              PROTECTED ORGANIZATION ROUTES
              All routes under /organization are protected
              ============================================ */}
          <Route
            path="/organization"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* -------- DASHBOARD ROUTES -------- */}
            {/* Employer Dashboard */}
            <Route path="employerdashboard" element={<DashboardPage />} />
            
            {/* Employee Dashboard */}
            <Route path="employee-dashboard" element={<EmpDashboard />} />
            
            {/* Old Dashboard (Commented) */}
            {/* <Route path="employerdashboard" element={<Dashboard />} /> */}

            {/* -------- PROFILE ROUTES -------- */}
            {/* Employer Profile */}
            <Route path="employerprofile" element={<ProfileRouter />} />
            <Route path="employee-profile" element={<EmpProfilePage />} />
            
            {/* Employee Profile (Commented) */}
            {/* <Route path="profile" element={<ProfilePage />} /> */}

            {/* -------- NOTIFICATION ROUTES -------- */}
            <Route path="notification" element={<Notifications />} />

            {/* -------- ATTENDANCE ROUTES -------- */}
            {/* Employee Attendance */}
            <Route path="employee-attendance" element={<EmployeeAttendance />} />
            
            {/* Attendance Status */}
            <Route path="attendance-status" element={<AttendanceStatus />} />
            
            {/* Attendance Report */}
            <Route path="attendance-report" element={<AttendanceReport />} />
            
            {/* Attendance Dashboard */}
            <Route path="attendance" element={<EMPAttendanceDashboard />} />

            {/* -------- LEAVES ROUTES -------- */}
            {/* Leaves Main */}
            <Route path="leaves" element={<Leaves />} />
            
            {/* Apply Leave */}
            <Route path="apply-leaves" element={<LeaveApplication />} />
            
            {/* Leave List */}
            <Route path="leaves-list" element={<LeaveList />} />
            
            {/* Leave Dashboard */}
            <Route path="leaves-dashboard" element={<EmpLeaveDashboard />} />

            {/* -------- HOLIDAY ROUTES -------- */}
            {/* Holiday Main */}
            <Route path="holiday" element={<Holiday />} />
            
            {/* Holiday List */}
            <Route path="holiday-list" element={<HolidayList />} />
            
            {/* Holiday Apply */}
            <Route path="holiday-apply" element={<HolidayApply />} />

            {/* -------- WORK UPDATE ROUTES -------- */}
            {/* Work Update List */}
            <Route path="work-update" element={<WorkUpdate />} />
            
            {/* Add Work Update */}
            <Route path="add-work-update" element={<AddWorkUpdate />} />

            {/* -------- POST ROUTES -------- */}
            <Route path="post" element={<PostPage />} />

            {/* -------- PROJECT ROUTES -------- */}
            {/* Assigned Projects */}
            <Route path="assigned-project" element={<AssignedProject />} />
            <Route path="view-project" element={<EmpProjectList />} />
            <Route path="assigned-project/:projectId" element={<EmpProjectDetails />} />
            
            {/* Create Project */}
            <Route path="create-project" element={<EmpCreateProject />} />
            
            {/* Assigned Tasks */}
            <Route path="assigned-task/:projectId" element={<EmpAssignTasks />} />
            
            {/* Admin View Task (Commented) */}
            {/* <Route path="assigned-view-task/:projectId" element={<EmpAdminViewTask />} /> */}
            
            {/* Workspace (Commented - moved to separate route) */}
            {/* <Route path="workspace/:projectId" element={<WorkspacePage />} /> */}

            {/* -------- MODULE ROUTES -------- */}
            {/* Add Module */}
            <Route path="emp-add-module/:p_id" element={<CreateModule />} />
            
            {/* Assign Work Item */}
            <Route path="emp-assign-work-item/:p_id" element={<AssignWorkItem />} />
            
            {/* Assigned Module */}
            <Route path="emp-assigned-module/:p_id/:m_id" element={<EmpAssignedModule />} />
            
            {/* Assigned Module (Old - Commented) */}
            {/* <Route path="assigned-project/:projectId" element={<AssignedModule />} /> */}
            
            {/* Module Details (Commented) */}
            {/* <Route path="assigned-project/:projectId/module/:moduleId/tasks" element={<ModuleDetailsPage />} /> */}

            {/* -------- TASK ROUTES -------- */}
            {/* Recent Task */}
            <Route path="assigned-task/:id" element={<RecentTask />} />
            
            {/* Employee Assigned Task (Commented) */}
            {/* <Route path="emp-assigned-task/:id" element={<EmpAssignedTask />} /> */}

            {/* -------- VIEW PROJECT ROUTES -------- */}
            {/* View Project (Commented) */}
            {/* <Route path="assigned-project/:id" element={<ViewProjectPage />} /> */}

            {/* -------- MESSAGE CENTER -------- */}
            <Route path="message-center" element={<MessageCenter />} />

            {/* -------- EMPLOYEE ROLL ROUTES -------- */}
            {/* Master Roll */}
            <Route path="master-roll" element={<EmpRollMaster />} />
            
            {/* Project Permission */}
            <Route path="project-permission" element={<EmpProjectPermissionMaster />} />
            
            {/* Permission List */}
            <Route path="permission-list" element={<EmpPermissionList />} />
          </Route>

          {/* ============================================
              WORKSPACE ROUTES (Protected)
              ============================================ */}
          <Route
            path="/organization"
            element={
              <ProtectedRoute>
                <WorkspaceLayout />
              </ProtectedRoute>
            }
          >
            {/* Workspace Page */}
            <Route path="workspace/:projectId" element={<WorkspacePage />} />
          </Route>

          {/* ============================================
              CATCH-ALL REDIRECT
              ============================================ */}
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