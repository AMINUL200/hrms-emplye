import React, { useState } from "react";
import "./LeaveApplicationForm.css";
import {
  Briefcase,
  Plus,
  Calendar,
  Info,
  Bold,
  Italic,
  Underline,
  Highlighter,
  List,
  ListOrdered,
  AlignLeft,
  AlignRight,
  Link2,
  Smile,
} from "lucide-react";

const LeaveApplicationForm = () => {
  const [reason, setReason] = useState("");

  return (
    <div className="laf-card">
      {/* Header */}
      <div className="laf-header">
        <div className="laf-title">
          <Briefcase size={17} className="laf-title-icon" />
          <h3>Leave Application</h3>
        </div>
        <button type="button" className="laf-apply-btn">
          <Plus size={14} />
          Apply Leave
        </button>
      </div>

      <div className="laf-body">
        <form>
          {/* Leave Type / Leave In Hand */}
          <div className="laf-grid laf-grid--2">
            <div className="laf-field">
              <label className="laf-label">
                Leave Type <span className="laf-required">*</span>
              </label>
              <select className="laf-input" defaultValue="">
                <option value="" disabled>
                  Select Leave Type
                </option>
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Earned Leave</option>
                <option>Annual Leave</option>
              </select>
            </div>
            <div className="laf-field">
              <label className="laf-label">Leave In Hand</label>
              <input type="text" className="laf-input" placeholder="Optional" />
            </div>
          </div>

          {/* From Date / To Date / No. of Days */}
          <div className="laf-grid laf-grid--3">
            <div className="laf-field">
              <label className="laf-label">
                From Date <span className="laf-required">*</span>
              </label>
              <div className="laf-input-wrap">
                <input type="text" className="laf-input" placeholder="dd-mm-yyyy" />
                <Calendar size={15} className="laf-input-icon" />
              </div>
            </div>
            <div className="laf-field">
              <label className="laf-label">
                To Date <span className="laf-required">*</span>
              </label>
              <div className="laf-input-wrap">
                <input type="text" className="laf-input" placeholder="dd-mm-yyyy" />
                <Calendar size={15} className="laf-input-icon" />
              </div>
            </div>
            <div className="laf-field">
              <label className="laf-label">No. of Days</label>
              <input type="text" className="laf-input" defaultValue="0" readOnly />
            </div>
          </div>

          {/* Employment Type / Employee Code / Employee Name */}
          <div className="laf-grid laf-grid--3">
            <div className="laf-field">
              <label className="laf-label">Employment Type</label>
              <select className="laf-input" defaultValue="">
                <option value="" disabled>
                  - Select -
                </option>
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Contract</option>
              </select>
            </div>
            <div className="laf-field">
              <label className="laf-label">Employee Code</label>
              <input
                type="text"
                className="laf-input laf-input--readonly"
                placeholder="Auto-Filled"
                readOnly
              />
            </div>
            <div className="laf-field">
              <label className="laf-label">Employee Name</label>
              <input
                type="text"
                className="laf-input laf-input--readonly"
                placeholder="Auto-Filled"
                readOnly
              />
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
                  defaultValue="04-07-2026"
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
                Supporting Document <span className="laf-optional">(Optional)</span>
              </label>
              <div className="laf-file-box">
                <input type="file" className="laf-file-input" />
              </div>
            </div>
          </div>

          {/* Reason / Remarks */}
          <div className="laf-grid laf-grid--1">
            <div className="laf-field">
              <label className="laf-label">
                Reason / Remarks <span className="laf-required">*</span>
              </label>
              <div className="laf-editor">
                <div className="laf-editor-toolbar">
                  <button type="button"><Bold size={14} /></button>
                  <button type="button"><Italic size={14} /></button>
                  <button type="button"><Underline size={14} /></button>
                  <button type="button"><Highlighter size={14} /></button>
                  <span className="laf-toolbar-divider" />
                  <button type="button"><List size={14} /></button>
                  <button type="button"><ListOrdered size={14} /></button>
                  <button type="button"><AlignLeft size={14} /></button>
                  <button type="button"><AlignRight size={14} /></button>
                  <span className="laf-toolbar-divider" />
                  <button type="button"><Link2 size={14} /></button>
                  <button type="button"><Smile size={14} /></button>
                  <button type="button"><Link2 size={14} /></button>
                </div>
                <textarea
                  className="laf-editor-textarea"
                  placeholder="Write your reason here..."
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="laf-actions">
            <button type="submit" className="laf-btn laf-btn--submit">
              Submit Application
            </button>
            <button type="button" className="laf-btn laf-btn--reset">
              Reset
            </button>
          </div>
        </form>

        <div className="laf-note">
          <Info size={15} className="laf-note-icon" />
          <span>
            <strong>Note:</strong> Please apply for leave in advance for smooth approval process.
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationForm;