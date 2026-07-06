import React, { useState, useEffect, useContext } from "react";
import "./AttendanceRecordTable.css";
import {
  FileSpreadsheet,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CalendarClock,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AuthContext } from "../../context/AuthContex";

const STATUS_CLASS = {
  Present: "att-status--present",
  Late: "att-status--late",
  "Half Day": "att-status--halfday",
};

const columns = [
  "SL.NO",
  "DATE",
  "OFFICE IN",
  "OFFICE OUT",
  "LOGIN",
  "LOGOUT",
  "LATE",
  "BREAK TIME",
  "DUTY HOUR",
  "DAY OFF",
  "STATUS",
];

const AttendanceRecordTable = () => {
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEntries, setTotalEntries] = useState(0);

  // Fetch attendance data
  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${api_url}/attendance-report`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status) {
        setAttendanceData(res.data.data || []);
        setTotalEntries(res.data.data?.length || 0);
      } else {
        toast.error("Failed to load attendance report");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceReport();
  }, []);

  // Get status based on late minutes
  const getStatus = (late) => {
    if (!late) return "Present";
    const minutes = parseInt(late);
    if (minutes === 0) return "Present";
    if (minutes > 30) return "Late";
    if (minutes > 0) return "Half Day";
    return "Present";
  };

  // Get late level for styling
  const getLateLevel = (late) => {
    if (!late) return "none";
    const minutes = parseInt(late);
    if (minutes === 0) return "none";
    if (minutes > 30) return "high";
    return "medium";
  };

  // Transform API data to match the expected format
  const transformData = (data) => {
    return data.map((item, index) => ({
      sl: index + 1,
      date: item.date,
      dateTag: index === 0 ? "Today" : index === 1 ? "Yesterday" : null,
      officeIn: item.office_in_time || "--:-- --",
      officeOut: item.Office_out_time || "--:-- --",
      login: item.login_time || "--:-- --",
      logout: item.logout_time || "--:-- --",
      late: item.late || "0 Min",
      lateLevel: getLateLevel(item.late),
      breakTime: item.total_break_time || "00:00 Hour",
      dutyHour: item.total_duty_hour || "00:00",
      dayOff: item.day_off || "No",
      status: getStatus(item.late),
    }));
  };

  // Filter and paginate data
  const filteredData = transformData(attendanceData).filter((row) => {
    if (!searchTerm) return true;
    return (
      row.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.officeIn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.officeOut.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalFilteredEntries = filteredData.length;
  const totalPages = Math.ceil(totalFilteredEntries / entriesPerPage);
  const startIndex = (activePage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Export to Excel
  const exportToExcel = () => {
    if (!attendanceData.length) {
      toast.error("No data to export");
      return;
    }

    const exportData = attendanceData.map((item, index) => ({
      "SI.No": index + 1,
      Date: item.date,
      "Office In": item.office_in_time,
      "Office Out": item.Office_out_time,
      Login: item.login_time,
      Logout: item.logout_time,
      Late: item.late,
      "Break Time": item.total_break_time,
      "Duty Hour": item.total_duty_hour || "00:00",
      "Day Off": item.day_off,
      Status: getStatus(item.late),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    const fileName = `Attendance_Report_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success("Excel file downloaded successfully");
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!attendanceData.length) {
      toast.error("No data to export");
      return;
    }

    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(16);
    doc.text("Attendance Report", 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = [
      "SI.No",
      "Date",
      "Office In",
      "Office Out",
      "Login",
      "Logout",
      "Late",
      "Break Time",
      "Duty Hour",
      "Day Off",
      "Status",
    ];

    const tableRows = attendanceData.map((item, index) => [
      index + 1,
      item.date,
      item.office_in_time,
      item.Office_out_time,
      item.login_time,
      item.logout_time,
      item.late,
      item.total_break_time,
      item.total_duty_hour || "00:00",
      item.day_off,
      getStatus(item.late),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "middle",
        halign: "center",
      },
      headStyles: {
        fillColor: [68, 66, 66],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 10, right: 10 },
    });

    const fileName = `Attendance_Report_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`;

    doc.save(fileName);
    toast.success("PDF file downloaded successfully");
  };

  // Pagination handlers
  const handlePrev = () => {
    if (activePage > 1) setActivePage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (activePage < totalPages) setActivePage((prev) => prev + 1);
  };

  // Get page numbers for pagination
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

  if (loading) {
    return (
      <div className="att-table-card">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="att-table-card">
      {/* Header */}
      <div className="att-table-header">
        <div className="att-table-title">
          <CalendarClock size={18} className="att-table-title-icon" />
          <h2>Attendance Records</h2>
        </div>
        <div className="att-table-export">
          <button 
            type="button" 
            className="att-export-btn att-export-btn--excel"
            onClick={exportToExcel}
          >
            <FileSpreadsheet size={15} />
            Export Excel
          </button>
          <button 
            type="button" 
            className="att-export-btn att-export-btn--pdf"
            onClick={exportToPDF}
          >
            <FileText size={15} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="att-table-controls">
        <div className="att-entries-select">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setActivePage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        <div className="att-search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by date or time..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActivePage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="att-table-scroll">
        <table className="att-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>
                  <span>
                    {col}
                    <ArrowUpDown size={11} className="att-sort-icon" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row) => (
                <tr key={row.sl}>
                  <td>{row.sl}</td>
                  <td>
                    <span className="att-date-main">{row.date}</span>
                    {/* {row.dateTag && (
                      <span className="att-date-tag">{row.dateTag}</span>
                    )} */}
                  </td>
                  <td className="att-cell-in">{row.officeIn}</td>
                  <td>{row.officeOut}</td>
                  <td className="att-cell-in">{row.login}</td>
                  <td>{row.logout}</td>
                  <td className={row.lateLevel === "high" ? "att-late-high" : ""}>
                    {row.late}
                  </td>
                  <td>{row.breakTime}</td>
                  <td className="att-cell-link">{row.dutyHour}</td>
                  <td>{row.dayOff}</td>
                  <td>
                    <span className={`att-status-pill ${STATUS_CLASS[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="att-table-footer">
        <span className="att-showing-text">
          Showing {startIndex + 1} to {Math.min(endIndex, totalFilteredEntries)} of {totalFilteredEntries} entries
        </span>
        <div className="att-pagination">
          <button 
            type="button" 
            className="att-page-btn" 
            aria-label="Previous page"
            onClick={handlePrev}
            disabled={activePage === 1}
          >
            <ChevronLeft size={15} />
          </button>
          {getPageNumbers().map((p) => (
            <button
              key={p}
              type="button"
              className={`att-page-btn ${activePage === p ? "att-page-btn--active" : ""}`}
              onClick={() => setActivePage(p)}
            >
              {p}
            </button>
          ))}
          <button 
            type="button" 
            className="att-page-btn" 
            aria-label="Next page"
            onClick={handleNext}
            disabled={activePage === totalPages}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecordTable;