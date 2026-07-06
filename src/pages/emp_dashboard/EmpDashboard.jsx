import React from "react";
import "./EmpDashboard.css";
import GreetingHeader from "./GreetingHeader";
import QuickStats from "./QuickStats";
import MyPerformance from "./MyPerformance.jsx";
import QuickActions from "./QuickActions.jsx";
import ProjectDetails from "./ProjectDetails.jsx";
import MiniCalendar from "./MiniCalendar.jsx";
import TodaysTasks from "./TodaysTasks.jsx";
import AttendanceOverview from "../../component/attendanc/AttendanceOverview";

const EmpDashboard = () => {
  return (
    <div className="emp-dashboard">
      <GreetingHeader />

      <div className="ed-main-row">
        {/* Left column */}
        <div className="ed-col ed-col--left">
          <AttendanceOverview variant="dashboard"/>
          <QuickStats />
          <MyPerformance />
        </div>

        {/* Right column */}
        <div className="ed-col ed-col--right">
          <ProjectDetails />
          {/* left side calendar, right side tasks */}
          <div className="ed-right-split">
            <MiniCalendar />
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