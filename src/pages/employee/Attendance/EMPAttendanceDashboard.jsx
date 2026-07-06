import React from "react";
import "./EMPAttendanceDashboard.css";
import AttendanceOverview from "../../../component/attendanc/AttendanceOverview";
import AttendanceRecordTable from "../../../component/attendanc/AttendanceRecordTable";

const EMPAttendanceDashboard = () => {
  return (
    <div className="emp-attendance-dashboard">
      <AttendanceOverview variant="attendance"/>
      <AttendanceRecordTable />
    </div>
  );
};

export default EMPAttendanceDashboard;