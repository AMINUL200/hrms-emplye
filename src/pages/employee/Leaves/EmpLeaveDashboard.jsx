import React from 'react'
import "./EmpLeaveDashboard.css"
import LeaveStatsCards from '../../../component/leave/LeaveStatsCards';
import LeaveApplicationForm from '../../../component/leave/LeaveApplicationForm';
import LeaveListTable from '../../../component/leave/LeaveListTable';
import LeaveBalanceSummary from '../../../component/leave/LeaveBalanceSummary';

const EmpLeaveDashboard = () => {
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
      <LeaveStatsCards />

      {/* Application form + Leave list */}
      <div className="eld-main-row">
        <div className="eld-col eld-col--form">
          <LeaveApplicationForm />
        </div>
        <div className="eld-col eld-col--list">
          <LeaveListTable />
        </div>
      </div>

      {/* Leave balance summary */}
      <LeaveBalanceSummary />
    </div>
  )
}

export default EmpLeaveDashboard;