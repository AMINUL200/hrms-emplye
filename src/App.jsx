import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import { AuthContext } from './context/AuthContex';
import MainLayout from './layout/MainLayout';
import ProtectedRoute from './component/ProtectedRoute/ProtectedRoute';

import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import SubadminLogin from './pages/Auth/SubadminLogin';
import Dashboard from './pages/employee/Dashboard/Dashboard';
import ProfilePage from './pages/employee/ProfilePage/ProfilePage';
import Leaves from './pages/employee/Leaves/Leaves';
import Holiday from './pages/employee/Holiday/Holiday';
import WorkUpdate from './pages/employee/WorkUpdate/WorkUpdate';
import AddWorkUpdate from './pages/employee/WorkUpdate/AddWorkUpdate';
import AttendanceStatus from './pages/employee/Attendance/AttendanceStatus';
import HolidayList from './pages/employee/HolidayList/HolidayList';
import HolidayApply from './pages/employee/HolidayList/HolidayApply';
import PostPage from './pages/post/PostPage';
import EmployeeAttendance from './pages/employee/Employee Attendance/EmployeeAttendance';
import AssignedProject from './pages/employee/project/AssignedProject';
import ViewProject from './pages/employee/view project/ViewProject';

import './App.css'
import LeaveApplication from './pages/employee/Leaves/LeaveApplication';
import LeaveList from './pages/employee/Leaves/LeaveList';
import ViewProjectPage from './pages/employee/view project/ViewProjectPage';
import DashboardPage from './pages/employee/Dashboard/DashboardPage';

const App = () => {

  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      <ToastContainer />
      <Router >
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/organization/employerdashboard" : "/login"} replace />} />

          {/* Auth routes */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/organization/employerdashboard" replace />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/organization/employerdashboard" replace />} />
          <Route path="/subadmin" element={!isAuthenticated ? <SubadminLogin /> : <Navigate to="/organization/employerdashboard" replace />} />

          {/* Protected organization routes */}
          <Route path="/organization" element={<MainLayout />}>
            {/* <Route path="employerdashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
            <Route path="employerdashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="employerprofile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="employee-attendance" element={<ProtectedRoute><EmployeeAttendance /></ProtectedRoute>} />
            <Route path="attendance-status" element={<ProtectedRoute><AttendanceStatus /></ProtectedRoute>} />
            
            <Route path="leaves" element={<ProtectedRoute><Leaves /></ProtectedRoute>} />
            <Route path="apply-leaves" element={<ProtectedRoute><LeaveApplication /></ProtectedRoute>} />
            <Route path="leaves-list" element={<ProtectedRoute><LeaveList /></ProtectedRoute>} />


            <Route path="holiday" element={<ProtectedRoute><Holiday /></ProtectedRoute>} />
            <Route path="work-update" element={<ProtectedRoute><WorkUpdate /></ProtectedRoute>} />
            <Route path="add-work-update" element={<ProtectedRoute><AddWorkUpdate /></ProtectedRoute>} />
            <Route path="holiday-list" element={<ProtectedRoute><HolidayList /></ProtectedRoute>} />
            <Route path="holiday-apply" element={<ProtectedRoute><HolidayApply /></ProtectedRoute>} />
            <Route path="post" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
            <Route path="assigned-project" element={<ProtectedRoute><AssignedProject /></ProtectedRoute>} />
            <Route path="assigned-project/:id" element={<ProtectedRoute><ViewProjectPage /></ProtectedRoute>} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/organization/employerdashboard" : "/login"} replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
