import React, { useContext, useEffect, useMemo, useState } from "react";
import "./EmpDashboard.css";
import GreetingHeader from "./GreetingHeader";
import QuickStats from "./QuickStats";
import MyPerformance from "./MyPerformance.jsx";
import QuickActions from "./QuickActions.jsx";
import ProjectDetails from "./ProjectDetails.jsx";
import MiniCalendar from "./MiniCalendar.jsx";
import TodaysTasks from "./TodaysTasks.jsx";
import AttendanceOverview from "../../component/attendanc/AttendanceOverview";
import { AuthContext } from "../../context/AuthContex.jsx";
import { ClipboardList } from "lucide-react";
import axios from "axios";

const EmpDashboard = () => {
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    attendance: null,
    projectDetails: [],
    calendar: {},
    leaveBalance: [],
    totalLeave: 0,
  });

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api_url}/employee-dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          t: Date.now(), // prevent caching
        },
      });

      console.log("Dashboard Response:", response.data);

      if (response.data.flag === 1 && response.data.data) {
        const data = response.data.data;

        setDashboardData({
          attendance: data.attendance || null,
          projectDetails: data.project_details || [],
          calendar: data.calendar || {},
          leaveBalance: data.leave_balance || [],
          totalLeave: response.data.total_leave || 0,
        });
      } else {
        toast.error(response.data.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const taskSummary = useMemo(() => {
    return dashboardData.projectDetails.reduce(
      (acc, project) => {
        acc.completed += project.completed_tasks || 0;
        acc.pending += project.pending_tasks || 0;
        acc.total += project.total_tasks || 0;
        return acc;
      },
      {
        completed: 0,
        pending: 0,
        total: 0,
      },
    );
  }, [dashboardData.projectDetails]);
  const totalLeaveBalance = useMemo(() => {
    return dashboardData.leaveBalance.reduce(
      (total, leave) => total + (Number(leave.leave_in_hand) || 0),
      0,
    );
  }, [dashboardData.leaveBalance]);

  if (loading) {
    return (
      <div className="att-overview-card">
        <div className="att-overview-heading">
          <ClipboardList size={18} className="att-heading-icon" />
          <h2>Today&apos;s Attendance Overview</h2>
        </div>
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading attendance data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="emp-dashboard">
      <GreetingHeader />

      <div className="ed-main-row">
        {/* Left column */}
        <div className="ed-col ed-col--left">
          <AttendanceOverview variant="dashboard" />
          <QuickStats
            taskSummary={taskSummary}
            totalLeave={totalLeaveBalance}
            attendance={dashboardData.attendance}
          />
          <MyPerformance />
        </div>

        {/* Right column */}
        <div className="ed-col ed-col--right">
          <ProjectDetails projectInfo={dashboardData.projectDetails} />
          {/* left side calendar, right side tasks */}
          <div className="ed-right-split">
            <MiniCalendar calendarInfo={dashboardData.calendar} />
            <TodaysTasks />
          </div>
        </div>

        {/* bottom row - spans full width */}
        <div className="ed-actions-row">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default EmpDashboard;
