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
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

const STATUS_CLASS = {
  "APPROVED": "llt-status--approved",
  "NOT APPROVED": "llt-status--pending",
  "PENDING": "llt-status--pending",
  "REJECTED": "llt-status--rejected",
};

const STATUS_LABEL = {
  "APPROVED": "Approved",
  "NOT APPROVED": "Pending",
  "PENDING": "Pending",
  "REJECTED": "Rejected",
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

const LeaveListTable = ({ leaveList = [] }) => {
  const [activePage, setActivePage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Get status class
  const getStatusClass = (status) => {
    return STATUS_CLASS[status] || "llt-status--pending";
  };

  // Get status label
  const getStatusLabel = (status) => {
    return STATUS_LABEL[status] || status;
  };

  // Filter data based on search and date
  const filteredData = leaveList.filter((item) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        item.leave_type?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower) ||
        item.from_date?.includes(searchTerm) ||
        item.to_date?.includes(searchTerm);
      if (!matchSearch) return false;
    }

    // Date filter
    if (fromDate && item.from_date < fromDate) return false;
    if (toDate && item.to_date > toDate) return false;

    return true;
  });

  // Pagination
  const totalFilteredEntries = filteredData.length;
  const totalPages = Math.ceil(totalFilteredEntries / entriesPerPage);
  const startIndex = (activePage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setActivePage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    setActivePage(1);
  };

  // Pagination handlers
  const handlePrev = () => {
    if (activePage > 1) setActivePage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (activePage < totalPages) setActivePage((prev) => prev + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;
    let start = Math.max(1, activePage - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Export to Excel - uses filtered data
  const exportToExcel = () => {
    // Use filteredData instead of leaveList
    if (!filteredData.length) {
      toast.error("No data to export based on current filters");
      return;
    }

    try {
      // Prepare data for export from filtered data
      const exportData = filteredData.map((item, index) => ({
        "SI.No": index + 1,
        "Leave Type": item.leave_type || "",
        "From Date": formatDate(item.from_date),
        "To Date": formatDate(item.to_date),
        "No of Days": item.no_of_leave || 0,
        "Date of Apply": formatDate(item.date_of_apply),
        "Status": getStatusLabel(item.status),
        "Document": item.document || "N/A"
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      worksheet["!cols"] = [
        { wch: 8 },   // SI.No
        { wch: 18 },  // Leave Type
        { wch: 14 },  // From Date
        { wch: 14 },  // To Date
        { wch: 12 },  // No of Days
        { wch: 16 },  // Date of Apply
        { wch: 14 },  // Status
        { wch: 16 },  // Document
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leave List");

      // Generate filename with current date and filter info
      let fileName = `Leave_List_${new Date().toISOString().split('T')[0]}`;
      if (fromDate || toDate || searchTerm) {
        fileName += `_filtered`;
      }
      fileName += `.xlsx`;

      // Download file
      XLSX.writeFile(workbook, fileName);
      toast.success(`Excel file downloaded successfully! (${exportData.length} filtered records)`);
    } catch (error) {
      console.error("Export to Excel error:", error);
      toast.error("Failed to export to Excel");
    }
  };

  // Export to PDF - uses filtered data
  const exportToPDF = () => {
    // Use filteredData instead of leaveList
    if (!filteredData.length) {
      toast.error("No data to export based on current filters");
      return;
    }

    try {
      // Create PDF document in landscape mode
      const doc = new jsPDF("l", "mm", "a4");

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(110, 40, 180); // Violet color
      doc.text("Leave List Report", 14, 20);

      // Add generation date and filter info
      doc.setFontSize(10);
      doc.setTextColor(100);
      let dateStr = new Date().toLocaleString();
      let filterInfo = "";
      
      if (fromDate || toDate || searchTerm) {
        filterInfo = " (Filtered)";
        if (fromDate) filterInfo += ` | From: ${formatDate(fromDate)}`;
        if (toDate) filterInfo += ` | To: ${formatDate(toDate)}`;
        if (searchTerm) filterInfo += ` | Search: "${searchTerm}"`;
      }
      
      doc.text(`Generated on: ${dateStr}${filterInfo}`, 14, 28);

      // Prepare table data from filtered data
      const tableColumn = [
        "SI.No",
        "Leave Type",
        "From Date",
        "To Date",
        "No of Days",
        "Date of Apply",
        "Status",
        "Document"
      ];

      const tableRows = filteredData.map((item, index) => [
        index + 1,
        item.leave_type || "",
        formatDate(item.from_date),
        formatDate(item.to_date),
        item.no_of_leave || 0,
        formatDate(item.date_of_apply),
        getStatusLabel(item.status),
        item.document || "N/A"
      ]);

      // Generate table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: "middle",
          halign: "center",
        },
        headStyles: {
          fillColor: [110, 40, 180], // Violet color
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 242, 250],
        },
        columnStyles: {
          0: { cellWidth: 15 },  // SI.No
          1: { cellWidth: 35 },  // Leave Type
          2: { cellWidth: 25 },  // From Date
          3: { cellWidth: 25 },  // To Date
          4: { cellWidth: 20 },  // No of Days
          5: { cellWidth: 25 },  // Date of Apply
          6: { cellWidth: 25 },  // Status
          7: { cellWidth: 30 },  // Document
        },
        margin: { left: 10, right: 10 },
        pageStart: 35,
        didDrawPage: (data) => {
          // Add footer on each page
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
          
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${currentPage} of ${pageCount}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10
          );
        }
      });

      // Generate filename with current date
      let fileName = `Leave_List_${new Date().toISOString().split('T')[0]}`;
      if (fromDate || toDate || searchTerm) {
        fileName += `_filtered`;
      }
      fileName += `.pdf`;

      // Save PDF
      doc.save(fileName);
      toast.success(`PDF file downloaded successfully! (${tableRows.length} filtered records)`);
    } catch (error) {
      console.error("Export to PDF error:", error);
      toast.error("Failed to export to PDF");
    }
  };

  return (
    <div className="llt-card">
      {/* Header */}
      <div className="llt-header">
        <div className="llt-title">
          <ClipboardList size={17} className="llt-title-icon" />
          <h3>Leave List</h3>
          {/* Show filter badge if filters are applied */}
          {(fromDate || toDate || searchTerm) && (
            <span className="llt-filter-badge">
              Filtered
            </span>
          )}
        </div>
        <div className="llt-export">
          <button 
            type="button" 
            className="llt-export-btn llt-export-btn--excel"
            onClick={exportToExcel}
          >
            <FileSpreadsheet size={14} />
            Export Excel
          </button>
          <button 
            type="button" 
            className="llt-export-btn llt-export-btn--pdf"
            onClick={exportToPDF}
          >
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
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  handleFilterChange();
                }}
                placeholder="dd-mm-yyyy" 
              />
            </div>
          </div>
          <div className="llt-filter-field">
            <label>To Date</label>
            <div className="llt-input-wrap">
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  handleFilterChange();
                }}
                placeholder="dd-mm-yyyy" 
              />
            </div>
          </div>
          <button 
            type="button" 
            className="llt-apply-btn"
            onClick={handleFilterChange}
          >
            Apply Filter
          </button>
          <button 
            type="button" 
            className="llt-reset-btn"
            onClick={clearFilters}
          >
            Reset
          </button>
          <div className="llt-search-box">
            <input 
              type="text" 
              placeholder="Search leaves..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange();
              }}
            />
            <Search size={14} />
          </div>
        </div>

        {/* Entries per page selector */}
        <div className="llt-entries-select">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setActivePage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        {/* Table Wrapper with flex grow */}
        <div className="llt-table-wrapper">
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
                {currentData.length > 0 ? (
                  currentData.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{startIndex + index + 1}</td>
                      <td>{row.leave_type}</td>
                      <td>{formatDate(row.from_date)}</td>
                      <td>{formatDate(row.to_date)}</td>
                      <td>{row.no_of_leave}</td>
                      <td>{formatDate(row.date_of_apply)}</td>
                      <td>
                        <span className={`llt-status-pill ${getStatusClass(row.status)}`}>
                          {getStatusLabel(row.status)}
                        </span>
                      </td>
                      <td>
                        {row.document ? (
                          <a href="#!" className="llt-doc-link">{row.document}</a>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="llt-empty-state">
                      <div className="llt-empty-content">
                        <ClipboardList size={32} />
                        <p>No leave applications found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer - Always visible */}
        <div className="llt-footer">
          <span className="llt-showing-text">
            {totalFilteredEntries > 0 ? (
              `Showing ${startIndex + 1} to ${Math.min(endIndex, totalFilteredEntries)} of ${totalFilteredEntries} entries`
            ) : (
              `Showing 0 entries`
            )}
          </span>
          <div className="llt-pagination">
            <button 
              type="button" 
              className="llt-page-btn" 
              aria-label="Previous page"
              onClick={handlePrev}
              disabled={activePage === 1 || totalFilteredEntries === 0}
            >
              <ChevronLeft size={15} />
            </button>
            {totalPages > 0 ? (
              getPageNumbers().map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`llt-page-btn ${activePage === p ? "llt-page-btn--active" : ""}`}
                  onClick={() => setActivePage(p)}
                >
                  {p}
                </button>
              ))
            ) : (
              <button className="llt-page-btn llt-page-btn--active">1</button>
            )}
            <button 
              type="button" 
              className="llt-page-btn" 
              aria-label="Next page"
              onClick={handleNext}
              disabled={activePage === totalPages || totalFilteredEntries === 0}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveListTable;