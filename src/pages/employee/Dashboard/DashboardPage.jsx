import React from "react";
import "./DashboardPage.css";

const DashboardPage = () => {
  return (
    <div className="dashboard-page-container container-fluid p-4">
      {/* Alert Row */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="dashboard-card">Alert</div>
        </div>
      </div>

      {/* Attendance & Calendar Row */}
      <div className="row g-3 mb-3 align-items-stretch">
        {/* Left Side - Attendance */}
        <div className="col-12 col-lg-6 d-flex">
          <div className="dashboard-card flex-fill h-100">Attendance</div>
        </div>

        {/* Right Side - Calendar + Bottom Cards */}
        <div className="col-12 col-lg-6 d-flex flex-column justify-content-between">
          {/* Top - Calendar */}
          <div className="dashboard-card flex-fill mb-3 flex-grow-1">
            Calendar
          </div>

          {/* Bottom - Leaves / Holidays / Work Update */}
          <div className="row g-3 flex-grow-1">
            <div className="col-12 col-md-4">
              <div className="dashboard-card h-100">Leaves</div>
            </div>
            <div className="col-12 col-md-4">
              <div className="dashboard-card h-100">Holidays</div>
            </div>
            <div className="col-12 col-md-4">
              <div className="dashboard-card h-100">Work Update</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Holiday / Test / Post Row */}
      <div className="row g-3 align-items-stretch">
        {/* Left Side - Upcoming Holiday + Test */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-between">
          <div className="dashboard-card flex-fill mb-3 flex-grow-1">
            Upcoming Holiday
          </div>
          <div className="dashboard-card flex-fill flex-grow-1">Test</div>
        </div>

        {/* Right Side - Post */}
        <div className="col-12 col-md-6 d-flex">
          <div className="dashboard-card h-100 flex-fill">Post</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
