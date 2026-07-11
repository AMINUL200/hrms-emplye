import React, { useContext, useEffect, useState } from "react";
import "./EmpLeaveDashboard.css";
import LeaveStatsCards from "../../../component/leave/LeaveStatsCards";
import LeaveApplicationForm from "../../../component/leave/LeaveApplicationForm";
import LeaveListTable from "../../../component/leave/LeaveListTable";
import LeaveBalanceSummary from "../../../component/leave/LeaveBalanceSummary";
import { AuthContext } from "../../../context/AuthContex";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipboardList } from "lucide-react";

const EmpLeaveDashboard = () => {
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    summary: {
      total_leave: 0,
      pending_leave: 0,
      approved_leave: 0,
      rejected_leave: 0,
      remaining_balance: 0,
    },
    leave_balance: [],
    total_available: 0,
    recent_leave_list: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api_url}/leve-dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        
        },
      });

      if (res.data.status === 200 && res.data.flag === 1) {
        setDashboardData({
          summary: res.data.data.summary || {
            total_leave: 0,
            pending_leave: 0,
            approved_leave: 0,
            rejected_leave: 0,
            remaining_balance: 0,
          },
          leave_balance: res.data.data.leave_balance || [],
          total_available: res.data.data.total_available || 0,
          recent_leave_list: res.data.data.recent_leave_list || [],
        });
      } else {
        toast.error(res.data.message || "Failed to load dashboard data");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data (can be passed to children if needed)
  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

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
          <p className="mt-3 text-muted">Loading Leave data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="emp-leave-dashboard">
      {/* Page header */}
      <div className="eld-page-header">
        <h1>Leave Management</h1>
        <div className="eld-breadcrumb">
          <a href="#!">Dashboard</a>
          <span>&gt;</span>
          <span className="eld-breadcrumb-current">Leave Management</span>
        </div>
      </div>

      {/* Top stats cards */}
      <LeaveStatsCards leaveSummary={dashboardData.summary} />

      {/* Application form + Leave list */}
      <div className="eld-main-row">
        <div className="eld-col eld-col--form">
          <LeaveApplicationForm />
        </div>
        <div className="eld-col eld-col--list">
          <LeaveListTable leaveList={dashboardData.recent_leave_list} />
        </div>
      </div>

      {/* Leave balance summary */}
      <LeaveBalanceSummary leaveBalance={dashboardData.leave_balance} totalLeave={dashboardData.total_available} />
    </div>
  );
};

export default EmpLeaveDashboard;
