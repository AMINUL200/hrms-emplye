import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ProfileImg } from "../../../assets";
import {
  faEllipsisV,
  faPencil,
  faTrashCan,
  faCamera,
  faSpinner,
  faCircleCheck,
  faUser,
  faTriangleExclamation,
  faBuildingColumns,
  faBriefcase,
  faPassport,
  faCertificate,
  faUserGroup,
  faPhone,
  faEnvelope,
  faLock,
  faLocationDot,
  faVenusMars,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../../component/common/Breadcrumb";
import "./ProfilePage.css";
import { AuthContext } from "../../../context/AuthContex";
import axios from "axios";
import { toast } from "react-toastify";
import PageLoader from "../../../component/loader/PageLoader";

const ProfilePage = () => {
  const navigate = useNavigate();
  const api_url = import.meta.env.VITE_API_URL;
  const storage_url = import.meta.env.VITE_STORAGE_URL;
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${api_url}/employee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          t: Date.now(),
        },
      });

      if (response.data.flag !== 1) {
        toast.error(response.data.message || "Failed to fetch profile data");
        if (response.data.flag === 0) {
          navigate("/organization/employerdashboard");
        }
        return;
      } else {
        setProfileData(response.data.data[0]);
        console.log(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch profile data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, GIF)");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Please select an image smaller than 5MB");
        return;
      }

      updateProfileImage(file);
    }
  };

  const updateProfileImage = async (imageFile) => {
    setImageUploading(true);
    console.log(imageFile);

    try {
      const formData = new FormData();
      formData.append("emp_image", imageFile);

      const response = await axios.post(`${api_url}/employee`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.flag === 1) {
        toast.success(
          response.data.message || "Profile image updated successfully"
        );
        await fetchProfileData();
      } else {
        toast.error(response.data.message || "Failed to update profile image");
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update profile image"
      );
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeProfileImage = async () => {
    if (
      !window.confirm("Are you sure you want to remove your profile image?")
    ) {
      return;
    }

    setImageUploading(true);
    try {
      const response = await axios.post(
        `${api_url}/employee/remove-image`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.flag === 1) {
        toast.success(
          response.data.message || "Profile image removed successfully"
        );
        await fetchProfileData();
      } else {
        toast.error(response.data.message || "Failed to remove profile image");
      }
    } catch (error) {
      console.error("Error removing profile image:", error);
      toast.error(
        error?.response?.data?.message || "Failed to remove profile image"
      );
    } finally {
      setImageUploading(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString || dateString === "1970-01-01") return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getFullName = () => {
    if (!profileData) return "Loading...";
    const { emp_fname, emp_mname, emp_lname } = profileData;
    return [emp_fname, emp_mname, emp_lname].filter(Boolean).join(" ");
  };

  const getProfileImage = () => {
    if (profileData?.emp_image) {
      return `${storage_url}/${profileData.emp_image}`;
    }
    return ProfileImg;
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!profileData) {
    return (
      <div className="content profile">
        <Breadcrumb pageTitle="Profile" />
        <div className="card mb-0">
          <div className="card-body">
            <div className="text-center p-4">
              <p>No profile data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content profile">
      <Breadcrumb pageTitle="Profile" />

      <div className="card mb-0">
        <div className="card-body">
          <div className="row">
            <div className="col-md-12">
              <div className="profile-view">
                <div className="profile-img-wrap">
                  <div className="profile-img">
                    <img src={getProfileImage()} alt="User Image" />

                    {/* Image Upload Controls */}
                    <div className="profile-img-overlay text-center">
                      <div className="profile-img-actions">
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={triggerImageUpload}
                          disabled={imageUploading}
                          title="Change Profile Image"
                        >
                          {imageUploading ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            <FontAwesomeIcon icon={faCamera} />
                          )}
                        </button>

                        {profileData?.emp_image && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={removeProfileImage}
                            disabled={imageUploading}
                            title="Remove Profile Image"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      style={{ display: "none" }}
                    />
                  </div>

                  {imageUploading && (
                    <div className="image-upload-status">
                      <small className="text-muted">
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="me-1"
                        />
                        Updating image...
                      </small>
                    </div>
                  )}
                </div>

                <div className="profile-basic">
                  <div className="row">
                    <div className="col-md-5">
                      <div className="profile-info-left">
                        <h3 className="user-name m-t-0 mb-0">
                          {getFullName()}
                          <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="verified-badge"
                            title="Verified"
                          />
                        </h3>
                        <h6 className="text-muted dept-link">
                          {profileData.emp_department ||
                            "Department not specified"}
                        </h6>
                        <small className="text-muted">
                          {profileData.emp_designation ||
                            "Designation not specified"}
                        </small>
                        <div className="staff-id">
                          Employee ID :{" "}
                          <span className="staff-id-value">
                            {profileData.emp_code || profileData.emid}
                          </span>
                        </div>
                        <div className="small doj text-muted">
                          Date of Join : {formatDate(profileData.emp_doj)}
                        </div>

                        <div className="staff-msg">
                          {!isEdit ? (
                            <button
                              className="btn btn-custom"
                              onClick={() => setIsEdit(true)}
                            >
                              <FontAwesomeIcon icon={faPencil} /> Edit Profile
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn cancel-btn"
                                onClick={() => setIsEdit(false)}
                              >
                                Cancel
                              </button>
                              <button className="btn btn-custom">
                                Update
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-7">
                      <ul className="personal-info personal-info--contact">
                        <li>
                          <div className="title">
                            <span className="field-icon">
                              <FontAwesomeIcon icon={faPhone} />
                            </span>
                            Phone:
                          </div>
                          <div className="text">
                            <a href={`tel:${profileData.em_contact}`}>
                              {profileData.em_contact || "Not provided"}
                            </a>
                          </div>
                        </li>
                        <li>
                          <div className="title">
                            <span className="field-icon">
                              <FontAwesomeIcon icon={faEnvelope} />
                            </span>
                            Email:
                          </div>
                          <div className="text">
                            <a href={`mailto:${profileData.emp_ps_email}`}>
                              {profileData.emp_ps_email || "Not provided"}
                            </a>
                          </div>
                        </li>
                        <li>
                          <div className="title">
                            <span className="field-icon">
                              <FontAwesomeIcon icon={faLock} />
                            </span>
                            Birthday:
                          </div>
                          <div className="text">
                            {formatDate(profileData.emp_dob)}
                          </div>
                        </li>
                        <li>
                          <div className="title">
                            <span className="field-icon">
                              <FontAwesomeIcon icon={faLocationDot} />
                            </span>
                            Address:
                          </div>
                          <div className="text">
                            {[
                              profileData.emp_pr_street_no,
                              profileData.emp_per_village,
                              profileData.emp_pr_city,
                              profileData.emp_pr_state,
                              profileData.emp_pr_country,
                              profileData.emp_pr_pincode,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Not provided"}
                          </div>
                        </li>
                        <li>
                          <div className="title">
                            <span className="field-icon">
                              <FontAwesomeIcon icon={faVenusMars} />
                            </span>
                            Gender:
                          </div>
                          <div className="text">
                            {profileData.emp_gender || "Not specified"}
                          </div>
                        </li>
                        <li>
                          <div className="title">
                            <span className="field-icon">
                              <FontAwesomeIcon icon={faUserTie} />
                            </span>
                            Reports to:
                          </div>
                          <div className="text">
                            <a href="profile.html">
                              {profileData.emp_reporting_auth || "Not assigned"}
                            </a>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="pro-edit">
                  <a
                    data-bs-target="#profile_info"
                    data-bs-toggle="modal"
                    className="edit-icon"
                    href="#"
                  >
                    <i className="fa-solid fa-pencil"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card tab-box">
        <div className="row user-tabs">
          <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
            <ul className="nav nav-tabs nav-tabs-bottom">
              <li className="nav-item">
                <a
                  href="#emp_profile"
                  data-bs-toggle="tab"
                  className="nav-link active"
                >
                  <FontAwesomeIcon icon={faUser} /> Profile
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#emp_profile"
                  data-bs-toggle="tab"
                  className="nav-link"
                >
                  <FontAwesomeIcon icon={faUserGroup} /> Personal Information
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#emp_profile"
                  data-bs-toggle="tab"
                  className="nav-link"
                >
                  <FontAwesomeIcon icon={faBriefcase} /> Work Information
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#emp_profile"
                  data-bs-toggle="tab"
                  className="nav-link"
                >
                  <FontAwesomeIcon icon={faPassport} /> Documents
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#emp_profile"
                  data-bs-toggle="tab"
                  className="nav-link"
                >
                  <FontAwesomeIcon icon={faCertificate} /> Additional
                  Information
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="tab-content">
        <div
          id="emp_profile"
          className="pro-overview tab-pane fade show active"
        >
          <div className="row">
            <div className="col-md-6 d-flex">
              <div className="card profile-box personal-card flex-fill">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="card-title-left">
                      <span className="title-icon title-icon--purple">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      Personal Informations
                    </span>
                    <a
                      href="#"
                      className="edit-icon"
                      data-bs-toggle="modal"
                      data-bs-target="#personal_info_modal"
                    >
                      <i className="fa-solid fa-pencil"></i>
                    </a>
                  </h3>
                  <div className="info-grid">
                    <ul className="personal-info">
                      <li>
                        <div className="title">Passport No.</div>
                        <div className="text">
                          {profileData.pass_doc_no || "Not provided"}
                        </div>
                      </li>
                      <li>
                        <div className="title">Passport Exp Date.</div>
                        <div className="text">
                          {formatDate(profileData.pass_exp_date)}
                        </div>
                      </li>
                      <li>
                        <div className="title">Tel</div>
                        <div className="text">
                          {profileData.emp_ps_phone || "Not provided"}
                        </div>
                      </li>
                    </ul>
                    <ul className="personal-info">
                      <li>
                        <div className="title">Nationality</div>
                        <div className="text">
                          {profileData.nationality || "Not provided"}
                        </div>
                      </li>
                      <li>
                        <div className="title">Religion</div>
                        <div className="text">
                          {profileData.emp_religion || "Not provided"}
                        </div>
                      </li>
                      <li>
                        <div className="title">Marital status</div>
                        <div className="text">
                          {profileData.marital_status || "Not provided"}
                        </div>
                      </li>
                      <li>
                        <div className="title">Employment of spouse</div>
                        <div className="text">
                          {profileData.emp_spouse_working_status || "N/A"}
                        </div>
                      </li>
                      <li>
                        <div className="title">Spouse Name</div>
                        <div className="text">
                          {profileData.spouse_name || "N/A"}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card profile-box  emergency-card flex-fill">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="card-title-left">
                      <span className="title-icon title-icon--red">
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                      </span>
                      Emergency Contact
                    </span>
                    <a
                      href="#"
                      className="edit-icon"
                      data-bs-toggle="modal"
                      data-bs-target="#emergency_contact_modal"
                    >
                      <i className="fa-solid fa-pencil"></i>
                    </a>
                  </h3>
                  <h5 className="section-title">Primary</h5>
                  <ul className="personal-info">
                    <li>
                      <div className="title">Name</div>
                      <div className="text">
                        {profileData.em_name || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">Relationship</div>
                      <div className="text">
                        {profileData.em_relation || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">Phone </div>
                      <div className="text">
                        {profileData.em_phone || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">Email</div>
                      <div className="text">
                        {profileData.em_email || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">Address</div>
                      <div className="text">
                        {profileData.em_address || "Not provided"}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 d-flex">
              <div className="card profile-box  bank-card flex-fill">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="card-title-left">
                      <span className="title-icon title-icon--green">
                        <FontAwesomeIcon icon={faBuildingColumns} />
                      </span>
                      Bank &amp; Document Information
                    </span>
                  </h3>
                  <div className="info-grid">
                    <ul className="personal-info">
                      <li>
                        <div className="title">Bank name</div>
                        <div className="text">
                          {profileData.emp_bank_name || "Not provided"}
                        </div>
                      </li>
                      <li>
                        <div className="title">Bank account No.</div>
                        <div className="text">
                          {profileData.emp_account_no || "Not provided"}
                        </div>
                      </li>
                    </ul>
                    <ul className="personal-info">
                      <li>
                        <div className="title">Aadhar No</div>
                        <div className="text">
                          {profileData.emp_aadhar_no || "Not provided"}
                        </div>
                      </li>
                      <li>
                        <div className="title">National Insurance</div>
                        <div className="text">
                          {profileData.ni_no || "Not provided"}
                        </div>
                      </li>
                    </ul>
                  </div>
                  <ul className="personal-info">
                    <li>
                      <div className="title">Status</div>
                      <div className="text">
                        <span
                          className={`badge ${
                            profileData.status === "active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {profileData.status || "Unknown"}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card profile-box work-card flex-fill">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="card-title-left">
                      <span className="title-icon title-icon--orange">
                        <FontAwesomeIcon icon={faBriefcase} />
                      </span>
                      Work Information
                    </span>
                  </h3>
                  <div className="info-grid">
                    <ul className="personal-info">
                      <li>
                        <div className="title">Employee Status</div>
                        <div className="text">
                          {profileData.emp_status || "Not provided"}
                        </div>
                      </li>
                      <li>
                        <div className="title">Job Location</div>
                        <div className="text">
                          {profileData.job_loc || "Not provided"}
                        </div>
                      </li>
                      <li>
                        <div className="title">Start Date</div>
                        <div className="text">
                          {formatDate(profileData.start_date)}
                        </div>
                      </li>
                    </ul>
                    <ul className="personal-info">
                      <li>
                        <div className="title">End Date</div>
                        <div className="text">
                          {formatDate(profileData.end_date)}
                        </div>
                      </li>
                      <li>
                        <div className="title">Confirmation Date</div>
                        <div className="text">
                          {formatDate(profileData.date_confirm)}
                        </div>
                      </li>
                      <li>
                        <div className="title">Retirement Date</div>
                        <div className="text">
                          {formatDate(profileData.emp_retirement_date)}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="row">
            <div className="col-md-6 d-flex">
              <div className="card profile-box visa-card  flex-fill">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="card-title-left">
                      <span className="title-icon title-icon--blue">
                        <FontAwesomeIcon icon={faPassport} />
                      </span>
                      Visa Information
                    </span>
                  </h3>
                  <ul className="personal-info">
                    <li>
                      <div className="title">Visa Document No.</div>
                      <div className="text">
                        {profileData.visa_doc_no || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">Issue Date</div>
                      <div className="text">
                        {formatDate(profileData.visa_issue_date)}
                      </div>
                    </li>
                    <li>
                      <div className="title">Expiry Date</div>
                      <div className="text">
                        {formatDate(profileData.visa_exp_date)}
                      </div>
                    </li>
                    <li>
                      <div className="title">Issued By</div>
                      <div className="text">
                        {profileData.visa_issue || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">Current Status</div>
                      <div className="text">
                        <span
                          className={`badge ${
                            profileData.visa_cur === "Yes"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {profileData.visa_cur || "Unknown"}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card profile-box license-card flex-fill">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="card-title-left">
                      <span className="title-icon title-icon--violet">
                        <FontAwesomeIcon icon={faCertificate} />
                      </span>
                      Professional License
                    </span>
                  </h3>
                  <ul className="personal-info">
                    <li>
                      <div className="title">License Title</div>
                      <div className="text">
                        {profileData.titleof_license || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">License Number</div>
                      <div className="text">
                        {profileData.cf_license_number || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">Start Date</div>
                      <div className="text">
                        {formatDate(profileData.cf_start_date)}
                      </div>
                    </li>
                    <li>
                      <div className="title">End Date</div>
                      <div className="text">
                        {formatDate(profileData.cf_end_date)}
                      </div>
                    </li>
                    <li>
                      <div className="title">Verification Status</div>
                      <div className="text">
                        <span
                          className={`badge ${
                            profileData.verify_status === "approved"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {profileData.verify_status || "Pending"}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Document Cards */}
          <div className="row">
            <div className="col-md-6 d-flex">
              <div className="card profile-box dbs-card flex-fill">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="card-title-left">
                      <span className="title-icon title-icon--green">
                        <FontAwesomeIcon icon={faPassport} />
                      </span>
                      DBS Information
                    </span>
                  </h3>
                  <ul className="personal-info">
                    <li>
                      <div className="title">DBS Reference No.</div>
                      <div className="text">
                        {profileData.dbs_ref_no || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">DBS Type</div>
                      <div className="text">
                        {profileData.dbs_type || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">Issue Date</div>
                      <div className="text">
                        {formatDate(profileData.dbs_issue_date)}
                      </div>
                    </li>
                    <li>
                      <div className="title">Expiry Date</div>
                      <div className="text">
                        {formatDate(profileData.dbs_exp_date)}
                      </div>
                    </li>
                    <li>
                      <div className="title">Current Status</div>
                      <div className="text">
                        <span
                          className={`badge ${
                            profileData.dbs_cur === "Yes"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {profileData.dbs_cur || "Unknown"}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card profile-box euss-card flex-fill">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="card-title-left">
                      <span className="title-icon title-icon--orange">
                        <FontAwesomeIcon icon={faCertificate} />
                      </span>
                      EUSS Information
                    </span>
                  </h3>
                  <ul className="personal-info">
                    <li>
                      <div className="title">EUSS Reference No.</div>
                      <div className="text">
                        {profileData.euss_ref_no || "Not provided"}
                      </div>
                    </li>
                    <li>
                      <div className="title">Issue Date</div>
                      <div className="text">
                        {formatDate(profileData.euss_issue_date)}
                      </div>
                    </li>
                    <li>
                      <div className="title">Expiry Date</div>
                      <div className="text">
                        {formatDate(profileData.euss_exp_date)}
                      </div>
                    </li>
                    <li>
                      <div className="title">Review Date</div>
                      <div className="text">
                        {formatDate(profileData.euss_review_date)}
                      </div>
                    </li>
                    <li>
                      <div className="title">Current Status</div>
                      <div className="text">
                        <span
                          className={`badge ${
                            profileData.euss_cur === "Yes"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {profileData.euss_cur || "Unknown"}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="row">
            <div className="col-md-12 d-flex">
              <div className="card profile-box flex-fill">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="card-title-left">
                      <span className="title-icon title-icon--violet">
                        <FontAwesomeIcon icon={faUserGroup} />
                      </span>
                      Nominee Informations
                    </span>
                    <a
                      href="#"
                      className="edit-icon"
                      data-bs-toggle="modal"
                      data-bs-target="#family_info_modal"
                    >
                      <i className="fa-solid fa-pencil"></i>
                    </a>
                  </h3>
                  <div className="table-responsive">
                    <table className="table table-nowrap">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Relationship</th>
                          <th>Date of Birth</th>
                          <th>Share %</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {profileData.nominee_name_one && (
                          <tr>
                            <td>{profileData.nominee_name_one}</td>
                            <td>
                              {profileData.nominee_relationship_one ||
                                "Not specified"}
                            </td>
                            <td>{formatDate(profileData.nominee_dob_one)}</td>
                            <td>
                              {profileData.emp_nomination_share_one ||
                                "Not specified"}
                              %
                            </td>
                            <td className="text-end">
                              <div className="dropdown dropdown-action">
                                <a
                                  aria-expanded="false"
                                  data-bs-toggle="dropdown"
                                  className="action-icon dropdown-toggle"
                                  href="#"
                                >
                                  <FontAwesomeIcon
                                    className="faEllipsisV-icon"
                                    icon={faEllipsisV}
                                  />
                                </a>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <a href="#" className="dropdown-item">
                                    <FontAwesomeIcon icon={faPencil} /> &nbsp;
                                    Edit
                                  </a>
                                  <a href="#" className="dropdown-item">
                                    <FontAwesomeIcon icon={faTrashCan} /> &nbsp;
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        {profileData.nominee_name_two && (
                          <tr>
                            <td>{profileData.nominee_name_two}</td>
                            <td>
                              {profileData.nominee_relationship_two ||
                                "Not specified"}
                            </td>
                            <td>{formatDate(profileData.nominee_dob_two)}</td>
                            <td>
                              {profileData.emp_nomination_share_two ||
                                "Not specified"}
                              %
                            </td>
                            <td className="text-end">
                              <div className="dropdown dropdown-action">
                                <a
                                  aria-expanded="false"
                                  data-bs-toggle="dropdown"
                                  className="action-icon dropdown-toggle"
                                  href="#"
                                >
                                  <FontAwesomeIcon
                                    className="faEllipsisV-icon"
                                    icon={faEllipsisV}
                                  />
                                </a>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <a href="#" className="dropdown-item">
                                    <FontAwesomeIcon icon={faPencil} /> &nbsp;
                                    Edit
                                  </a>
                                  <a href="#" className="dropdown-item">
                                    <FontAwesomeIcon icon={faTrashCan} /> &nbsp;
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        {!profileData.nominee_name_one &&
                          !profileData.nominee_name_two && (
                            <tr>
                              <td
                                colSpan="5"
                                className="text-center text-muted"
                              >
                                No nominee information available
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;