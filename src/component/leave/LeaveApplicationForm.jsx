import React, { useState, useContext, useEffect } from "react";
import "./LeaveApplicationForm.css";
import { Briefcase, Calendar, Info, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContex";
import { EmployeeContext } from "../../context/EmployeeContext";
import DotLoader from "../common/DotLoader";
import { useNavigate } from "react-router-dom";

const LeaveApplicationForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { token, data } = useContext(AuthContext);
  const {
    fetchLeaveTypeData,
    leaveTypeData,
    fetchLeaveInHandData,
    calculateDays,
    leaveApply,
    fetchReamingLeave,
    remainingLeave,
  } = useContext(EmployeeContext);

  console.log("Leave Type Data:", leaveTypeData);
  console.log("Remaining Leave Data:", remainingLeave);

  const [leaveInHand, setLeaveInHand] = useState("");
  const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    date_of_application: new Date().toISOString().split("T")[0],
    leave_type_id: "",
    from_date: "",
    to_date: "",
    no_of_days: "",
    image: null,
  });

  useEffect(() => {
    if (token && data) {
      fetchLeaveTypeData(token, data.id, data.emid);
      fetchReamingLeave(token);
    }
  }, [token, data]);

  // Validate if user has sufficient leave balance
  const validateLeaveBalance = () => {
    const requestedDays = parseInt(formData.no_of_days) || 0;

    if (requestedDays === 0) {
      toast.error("Please select valid dates");
      return false;
    }

    // Find the selected leave type in remainingLeave
    const selectedLeave = remainingLeave.find(
      (leave) => leave.leave_type_id === parseInt(formData.leave_type_id),
    );

    if (!selectedLeave) {
      toast.error("Selected leave type not found in your balance");
      return false;
    }

    const availableDays = selectedLeave.leave_in_hand;

    if (requestedDays > availableDays) {
      toast.error(
        `Insufficient leave balance! You have only ${availableDays} day(s) of ${selectedLeave.leave_type_name} available, but requested ${requestedDays} day(s).`,
      );
      return false;
    }

    return true;
  };

  const validateDates = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    const fromDate = formData.from_date;
    const toDate = formData.to_date;

    if (fromDate && fromDate < currentDate) {
      toast.error("From Date cannot be earlier than today");
      return false;
    }

    if (fromDate && toDate && toDate < fromDate) {
      toast.error("To Date cannot be earlier than From Date");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates first
    if (!validateDates()) {
      return;
    }

    // Validate leave balance
    if (!validateLeaveBalance()) {
      return;
    }

    setSubmitLoading(true);

    try {
      const result = await leaveApply(token, formData);
      toast.success(result);
      setFormData({
        date_of_application: new Date().toISOString().split("T")[0],
        leave_type_id: "",
        from_date: "",
        to_date: "",
        no_of_days: "",
        image: null,
      });
      setLeaveInHand("");
      setSelectedLeaveTypeName("");
      fetchReamingLeave(token);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to submit leave application");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleLeaveTypeChange = async (e) => {
    const selectedLeaveTypeId = e.target.value;
    handleChange(e);

    if (!selectedLeaveTypeId) {
      setLeaveInHand("");
      setSelectedLeaveTypeName("");
      return;
    }

    // Find the leave type name
    const selectedLeave = leaveTypeData.find(
      (leave) => leave.id === parseInt(selectedLeaveTypeId),
    );
    if (selectedLeave) {
      setSelectedLeaveTypeName(selectedLeave.leave_type_name);
    }

    const balance = await fetchLeaveInHandData(token, selectedLeaveTypeId);
    setLeaveInHand(balance);

    // Re-validate days if already selected
    if (formData.no_of_days) {
      const requestedDays = parseInt(formData.no_of_days);
      const availableDays = parseInt(balance);
      if (requestedDays > availableDays) {
        toast.warning(
          `You have only ${availableDays} day(s) of ${selectedLeave?.leave_type_name || "this leave type"} available.`,
        );
      }
    }
  };

  const handleFromDateChange = (e) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const value = e.target.value;

    if (value && value < currentDate) {
      toast.error("From Date cannot be earlier than today");
      return;
    }
    if (formData.to_date && value && value > formData.to_date) {
      toast.error("From Date cannot be later than To Date");
      return;
    }
    handleChange(e);
    const days = calculateDays(value, formData.to_date);
    setFormData((prev) => ({ ...prev, no_of_days: days }));

    // Validate balance after days calculation
    if (days > 0 && formData.leave_type_id) {
      const availableDays = parseInt(leaveInHand);
      if (days > availableDays) {
        toast.warning(
          `You have only ${availableDays} day(s) available for this leave type.`,
        );
      }
    }
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    if (formData.from_date && value && value < formData.from_date) {
      toast.error("To Date cannot be earlier than From Date");
      return;
    }
    handleChange(e);
    const days = calculateDays(formData.from_date, value);
    setFormData((prev) => ({ ...prev, no_of_days: days }));

    // Validate balance after days calculation
    if (days > 0 && formData.leave_type_id) {
      const availableDays = parseInt(leaveInHand);
      if (days > availableDays) {
        toast.warning(
          `You have only ${availableDays} day(s) available for this leave type.`,
        );
      }
    }
  };

  const handleReset = () => {
    setFormData({
      date_of_application: new Date().toISOString().split("T")[0],
      leave_type_id: "",
      from_date: "",
      to_date: "",
      no_of_days: "",
      image: null,
    });
    setLeaveInHand("");
    setSelectedLeaveTypeName("");
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Get current available days for selected leave type
  const getAvailableDays = () => {
    if (!formData.leave_type_id) return 0;
    const selected = remainingLeave.find(
      (leave) => leave.leave_type_id === parseInt(formData.leave_type_id),
    );
    return selected ? selected.leave_in_hand : 0;
  };

  const availableDays = getAvailableDays();
  const requestedDays = parseInt(formData.no_of_days) || 0;
  const isInsufficientBalance =
    requestedDays > availableDays && availableDays > 0;

  return (
    <div className="laf-card">
      {/* Header */}
      <div className="laf-header">
        <div className="laf-title">
          <Briefcase size={17} className="laf-title-icon" />
          <h3>Leave Application</h3>
        </div>
        <button
          type="button"
          className="laf-apply-btn"
          onClick={() => navigate("/organization/holiday")}
        >
          <Calendar size={14} />
          Holiday
        </button>
      </div>

      <div className="laf-body">
        <form onSubmit={handleSubmit}>
          {/* Leave Type / Leave In Hand */}
          <div className="laf-grid laf-grid--2">
            <div className="laf-field">
              <label className="laf-label">
                Leave Type <span className="laf-required">*</span>
              </label>
              <select
                className="laf-input"
                name="leave_type_id"
                value={formData.leave_type_id}
                onChange={handleLeaveTypeChange}
                required
              >
                <option value="">Select Leave Type</option>
                {leaveTypeData.map((leaveType) => (
                  <option key={leaveType.id} value={leaveType.id}>
                    {leaveType.leave_type_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="laf-field">
              <label className="laf-label">Leave In Hand</label>
              <input
                type="text"
                className="laf-input laf-input--readonly"
                value={leaveInHand || "0"}
                readOnly
              />
            </div>
          </div>

          {/* From Date / To Date / No. of Days */}
          <div className="laf-grid laf-grid--3">
            <div className="laf-field">
              <label className="laf-label">
                From Date <span className="laf-required">*</span>
              </label>
              <div className="laf-input-wrap">
                <input
                  type="date"
                  className="laf-input"
                  name="from_date"
                  value={formData.from_date}
                  onChange={handleFromDateChange}
                  required
                />
              </div>
            </div>
            <div className="laf-field">
              <label className="laf-label">
                To Date <span className="laf-required">*</span>
              </label>
              <div className="laf-input-wrap">
                <input
                  type="date"
                  className="laf-input"
                  name="to_date"
                  value={formData.to_date}
                  onChange={handleToDateChange}
                  required
                />
              </div>
            </div>
            <div className="laf-field">
              <label className="laf-label">No. of Days</label>
              <input
                type="text"
                className={`laf-input laf-input--readonly ${isInsufficientBalance ? "laf-input--error" : ""}`}
                value={formData.no_of_days || "0"}
                readOnly
              />
              {isInsufficientBalance && (
                <span className="laf-error-message">
                  Insufficient balance! Available: {availableDays} days
                </span>
              )}
            </div>
          </div>

          {/* Date of Application */}
          <div className="laf-grid laf-grid--1">
            <div className="laf-field">
              <label className="laf-label">Date of Application</label>
              <div className="laf-input-wrap laf-input-wrap--half">
                <input
                  type="text"
                  className="laf-input laf-input--readonly"
                  value={formatDate(formData.date_of_application)}
                  readOnly
                />
                <Calendar size={15} className="laf-input-icon" />
              </div>
            </div>
          </div>

          {/* Supporting document */}
          <div className="laf-grid laf-grid--1">
            <div className="laf-field">
              <label className="laf-label">
                Supporting Document{" "}
                <span className="laf-optional">(Optional)</span>
              </label>
              <div className="laf-file-box">
                <input
                  type="file"
                  className="laf-file-input"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="laf-actions">
            <button
              type="submit"
              className="laf-btn laf-btn--submit"
              disabled={submitLoading || isInsufficientBalance}
            >
              {submitLoading ? <DotLoader /> : "Submit Application"}
            </button>
            <button
              type="button"
              className="laf-btn laf-btn--reset"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="laf-note">
          <Info size={15} className="laf-note-icon" />
          <span>
            <strong>Note:</strong> Please apply for leave in advance for smooth
            approval process.
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationForm;
