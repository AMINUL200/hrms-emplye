import React from "react";
import "./WorkspaceWorkHistory.css";
import { History, FileText, Paperclip, CheckCircle2, Clock, XCircle } from "lucide-react";

const HISTORY = [
  {
    id: 1,
    remarks:
      "Completed the homepage hero section and updated the responsive breakpoints for mobile view. Ready for review.",
    file: "Homepage_Hero_v2.zip",
    date: "08 Jul 2026",
    time: "04:12 PM",
    status: "Approved",
  },
  {
    id: 2,
    remarks:
      "Fixed the navigation bar overlap issue on tablet screens and added smooth scroll behavior across all sections.",
    file: "Nav_Fix_Patch.zip",
    date: "05 Jul 2026",
    time: "11:40 AM",
    status: "Approved",
  },
  {
    id: 3,
    remarks:
      "Initial draft of the contact page with form validation. Awaiting feedback on the layout before finalizing styles.",
    file: null,
    date: "02 Jul 2026",
    time: "02:55 PM",
    status: "Pending",
  },
  {
    id: 4,
    remarks:
      "Uploaded first version of the pricing page. Colors don't match the brand guide yet, will revise after review.",
    file: "Pricing_Page_Draft.pdf",
    date: "28 Jun 2026",
    time: "05:20 PM",
    status: "Rejected",
  },
  {
    id: 5,
    remarks: "Set up the project repository, base folder structure, and initial README documentation.",
    file: "Project_Setup_Notes.docx",
    date: "24 Jun 2026",
    time: "10:05 AM",
    status: "Approved",
  },
];

const STATUS_CONFIG = {
  Approved: { icon: CheckCircle2, className: "wwh-status--approved" },
  Pending: { icon: Clock, className: "wwh-status--pending" },
  Rejected: { icon: XCircle, className: "wwh-status--rejected" },
};

const WorkspaceWorkHistory = () => {
  return (
    <div className="wwh-card">
      <div className="wwh-header">
        <span className="wwh-header-icon">
          <History size={16} />
        </span>
        <h3>Work History</h3>
        <span className="wwh-count-badge">{HISTORY.length}</span>
      </div>

      <div className="wwh-list">
        {HISTORY.map((entry) => {
          const { icon: StatusIcon, className } = STATUS_CONFIG[entry.status];
          return (
            <div className="wwh-item" key={entry.id}>
              <div className="wwh-item-top">
                <span className="wwh-date">
                  {entry.date} <span className="wwh-time">&middot; {entry.time}</span>
                </span>
                <span className={`wwh-status-pill ${className}`}>
                  <StatusIcon size={12} />
                  {entry.status}
                </span>
              </div>

              <p className="wwh-remarks">{entry.remarks}</p>

              {entry.file && (
                <div className="wwh-file-chip">
                  <Paperclip size={12} />
                  {entry.file}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceWorkHistory;