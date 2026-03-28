import React, { useContext } from "react";
import { AuthContext } from "../../../context/AuthContex";
import "./GuestProfile.css";

const GuestProfile = () => {
  const { data } = useContext(AuthContext);

  if (!data) return null;

  return (
    <div className="guest-profile-container">
      <div className="guest-profile-card">

        {/* Header */}
        <div className="guest-profile-header">
          <img
            src={data.org_logo}
            alt="Organization Logo"
            className="org-logo"
          />
          <div>
            <h2>{data.name}</h2>
            <span className="guest-badge">Guest User</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="guest-info-grid">

          <div className="info-box">
            <label>Email</label>
            <p>{data.email}</p>
          </div>

          <div className="info-box">
            <label>Phone</label>
            <p>{data.phone}</p>
          </div>

          <div className="info-box">
            <label>Employee ID</label>
            <p>{data.employee_id}</p>
          </div>

          <div className="info-box">
            <label>EMID</label>
            <p>{data.emid}</p>
          </div>

          <div className="info-box">
            <label>Designation</label>
            <p>{data.designation}</p>
          </div>

          <div className="info-box">
            <label>Company</label>
            <p>{data.company_name}</p>
          </div>

          <div className="info-box">
            <label>Organization</label>
            <p>{data.org_name}</p>
          </div>

          <div className="info-box">
            <label>User Type</label>
            <p className="text-cap">{data.user_type}</p>
          </div>

        </div>

        {/* Footer note */}
        <div className="guest-note">
          <p>
            This is a read-only profile. Guest users are not allowed to edit
            personal information.
          </p>
        </div>

      </div>
    </div>
  );
};

export default GuestProfile;
