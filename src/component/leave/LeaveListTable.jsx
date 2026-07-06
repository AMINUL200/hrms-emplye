import React, { useState } from "react";
import "./LeaveListTable.css";
import {
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Calendar,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const RECORDS = [
  {
    sl: 1,
    type: "Casual Leave",
    from: "04-07-2026",
    to: "04-07-2026",
    days: 1,
    applied: "04-07-2026",
    status: "Pending",
    doc: null,
  },
  {
    sl: 2,
    type: "Sick Leave",
    from: "30-06-2026",
    to: "01-07-2026",
    days: 2,
    applied: "29-06-2026",
    status: "Approved",
    doc: "Medical.pdf",
  },
  {
    sl: 3,
    type: "Casual Leave",
    from: "23-06-2026",
    to: "23-06-2026",
    days: 1,
    applied: "22-06-2026",
    status: "Rejected",
    doc: null,
  },
  {
    sl: 4,
    type: "Annual Leave",
    from: "15-06-2026",
    to: "18-06-2026",
    days: 4,
    applied: "10-06-2026",
    status: "Approved",
    doc: "Family.pdf",
  },
  {
    sl: 5,
    type: "Sick Leave",
    from: "05-06-2026",
    to: "05-06-2026",
    days: 1,
    applied: "04-06-2026",
    status: "Approved",
    doc: "Medical.pdf",
  },
  {
    sl: 6,
    type: "Casual Leave",
    from: "28-05-2026",
    to: "29-05-2026",
    days: 2,
    applied: "27-05-2026",
    status: "Approved",
    doc: null,
  },
  {
    sl: 7,
    type: "Earned Leave",
    from: "20-05-2026",
    to: "22-05-2026",
    days: 3,
    applied: "18-05-2026",
    status: "Pending",
    doc: null,
  },
  {
    sl: 8,
    type: "Sick Leave",
    from: "12-05-2026",
    to: "12-05-2026",
    days: 1,
    applied: "11-05-2026",
    status: "Rejected",
    doc: "Medical.pdf",
  },
];

const STATUS_CLASS = {
  Pending: "llt-status--pending",
  Approved: "llt-status--approved",
  Rejected: "llt-status--rejected",
};

const columns = [
  "SL.NO",
  "LEAVE TYPE",
  "FROM DATE",
  "TO DATE",
  "NO OF DAYS",
  "DATE OF APPLY",
  "STATUS",
  "DOCUMENT",
  "ACTIONS",
];

const LeaveListTable = () => {
  const [activePage, setActivePage] = useState(1);

  return (
    <div className="llt-card">
      {/* Header */}
      <div className="llt-header">
        <div className="llt-title">
          <ClipboardList size={17} className="llt-title-icon" />
          <h3>Leave List</h3>
        </div>
        <div className="llt-export">
          <button type="button" className="llt-export-btn llt-export-btn--excel">
            <FileSpreadsheet size={14} />
            Export Excel
          </button>
          <button type="button" className="llt-export-btn llt-export-btn--pdf">
            <FileText size={14} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="llt-body">
        {/* Filters */}
        <div className="llt-filters">
          <div className="llt-filter-field">
            <label>From Date</label>
            <div className="llt-input-wrap">
              <input type="text" placeholder="dd-mm-yyyy" />
              <Calendar size={14} className="llt-input-icon" />
            </div>
          </div>
          <div className="llt-filter-field">
            <label>To Date</label>
            <div className="llt-input-wrap">
              <input type="text" placeholder="dd-mm-yyyy" />
              <Calendar size={14} className="llt-input-icon" />
            </div>
          </div>
          <button type="button" className="llt-apply-btn">Apply Filter</button>
          <button type="button" className="llt-reset-btn">Reset</button>
          <div className="llt-search-box">
            <input type="text" placeholder="Search leaves..." />
            <Search size={14} />
          </div>
        </div>

        {/* Table */}
        <div className="llt-table-scroll">
          <table className="llt-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECORDS.map((row) => (
                <tr key={row.sl}>
                  <td>{row.sl}</td>
                  <td>{row.type}</td>
                  <td>{row.from}</td>
                  <td>{row.to}</td>
                  <td>{row.days}</td>
                  <td>{row.applied}</td>
                  <td>
                    <span className={`llt-status-pill ${STATUS_CLASS[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    {row.doc ? (
                      <a href="#!" className="llt-doc-link">{row.doc}</a>
                    ) : (
                      <span className="llt-doc-empty">-</span>
                    )}
                  </td>
                  <td>
                    <button type="button" className="llt-action-btn" aria-label="Actions">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="llt-footer">
          <span className="llt-showing-text">Showing 1 to 8 of 18 entries</span>
          <div className="llt-pagination">
            <button type="button" className="llt-page-btn" aria-label="Previous page">
              <ChevronLeft size={15} />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                type="button"
                className={`llt-page-btn ${activePage === p ? "llt-page-btn--active" : ""}`}
                onClick={() => setActivePage(p)}
              >
                {p}
              </button>
            ))}
            <button type="button" className="llt-page-btn" aria-label="Next page">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveListTable;