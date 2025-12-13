import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFile,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../../component/common/Breadcrumb";
import PageLoader from "../../../component/loader/PageLoader";
import { AuthContext } from "../../../context/AuthContex";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const AttendanceReport = () => {
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState({
    from_date: null,
    to_date: null,
  });

  const fetchAttendanceReport = async (fromDate = null, toDate = null) => {
    try {
      const requestData = {};

      // Only add dates to the request if they are provided
      if (fromDate && toDate) {
        requestData.from_date = fromDate;
        requestData.to_date = toDate;
      }
      const res = await axios.post(
        `${api_url}/attendance-report`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res.data);

      if (res.data.status) {
        setAttendanceData(res.data.data || []);
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

  const totalEntries = attendanceData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentData = attendanceData.slice(startIndex, endIndex);

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleDateChange = (e) => {
    const { id, value } = e.target;

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      toast.error("Future date not allowed");
      return;
    }

    setDateFilter((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPage(1);
    fetchAttendanceReport(dateFilter.from_date, dateFilter.to_date);
  };

  const handleReset = () => {
    setDateFilter({ from_date: null, to_date: null });
    setCurrentPage(1);
    setLoading(true);
    fetchAttendanceReport();
  };

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
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 6 }, // SI.No
      { wch: 14 }, // Date
      { wch: 12 }, // Office In
      { wch: 12 }, // Office Out
      { wch: 12 }, // Login
      { wch: 12 }, // Logout
      { wch: 12 }, // Late
      { wch: 14 }, // Break
      { wch: 12 }, // Duty
      { wch: 10 }, // Day Off
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    const fileName = `Attendance_Report_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    XLSX.writeFile(workbook, fileName);

    toast.success("Excel file downloaded successfully");
  };

 const exportToPDF = () => {
  if (!attendanceData.length) {
    toast.error("No data to export");
    return;
  }

  const doc = new jsPDF("l", "mm", "a4"); // landscape for wide table

  doc.setFontSize(16);
  doc.text("Attendance Report", 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    14,
    22
  );

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
      fillColor: [68, 66, 66], // dark header
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


  if (loading) return <PageLoader />;

  return (
    <div className="attendance-status">
      <div className="row mb-4">
        <Breadcrumb pageTitle="Attendance Report" />
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <form onSubmit={handleFilterSubmit}>
              <div className="row g-3 px-3 px-md-4 p-4  align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">From Date</label>
                  <input
                    type="date"
                    id="from_date"
                    className="form-control"
                    value={dateFilter.from_date || ""}
                    onChange={handleDateChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">To Date</label>
                  <input
                    type="date"
                    id="to_date"
                    className="form-control"
                    value={dateFilter.to_date || ""}
                    onChange={handleDateChange}
                  />
                </div>

                <div className="col-md-4 d-flex gap-2">
                  <button type="submit" className="btn btn-primary w-100">
                    Apply
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-transparent py-3">
              <h4 className="card-title m-0 text-primary">
                <FontAwesomeIcon icon={faClock} />
                Attendance Report
              </h4>

              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-success mb-1 mb-md-0"
                  onClick={exportToExcel}
                >
                  <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                  {"Export Excel"}
                </button>
                <button
                  className="btn btn-danger mb-1 mb-md-0"
                  onClick={exportToPDF}
                >
                  <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                  {"Export PDF"}
                </button>
              </div>
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 px-3 px-md-4 mb-3 mt-3">
              {/* Show entries */}
              <div className="d-flex align-items-center">
                <span className="me-2 text-muted">Show</span>
                <select
                  className="form-select form-select-sm w-auto"
                  value={entriesPerPage}
                  onChange={handleEntriesChange}
                >
                  {[5, 10, 20, 50, 100].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <span className="ms-2 text-muted">entries</span>
              </div>
            </div>

            <div className="card-body px-0 pb-0">
              <div className="table-responsive table-responsive-ee">
                {/* Desktop Table */}
                <table className="table attendance-status-table table-hover align-middle mb-0 d-none d-md-table">
                  <thead className="table-infoo">
                    <tr>
                      <th className="text-center text-gray border py-3">
                        SI.No
                      </th>
                      <th className="text-center text-gray border py-3">
                        Date
                      </th>
                      <th className="text-center text-gray border py-3">
                        Office In
                      </th>
                      <th className="text-center text-gray border py-3">
                        Office Out
                      </th>
                      <th className="text-center text-gray border py-3">
                        Login
                      </th>
                      <th className="text-center text-gray border py-3">
                        Logout
                      </th>
                      <th className="text-center text-gray border py-3">
                        Late
                      </th>
                      <th className="text-center text-gray border py-3">
                        Break Time
                      </th>
                      <th className="text-center text-gray border py-3">
                        Duty Hour
                      </th>

                      <th className="text-center text-gray border py-3">
                        Day Off
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((item, index) => (
                        <tr key={index}>
                          <td className="text-end fw-semibold border">
                            {index + 1}
                          </td>
                          <td className="text-center border">{item.date}</td>
                          <td className="text-center border">
                            {item.office_in_time}
                          </td>
                          <td className="text-center border">
                            {item.Office_out_time}
                          </td>
                          <td className="text-center border">
                            {item.login_time}
                          </td>
                          <td className="text-center border">
                            {item.logout_time}
                          </td>
                          <td className="text-center text-gray  border">
                            {item.late}
                          </td>
                          <td className="text-center border">
                            {item.total_break_time}
                          </td>
                          <td className="text-center border">
                            {item.total_duty_hour || "00:00"}
                          </td>

                          <td className="text-center border text-gray">
                            <span className={` text-gray`}>{item.day_off}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          <FontAwesomeIcon
                            icon={faFile}
                            size="2x"
                            className="mb-2 text-muted"
                          />
                          <p className="mb-0">No attendance data found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Mobile View */}
                <div className="d-md-none px-3">
                  {currentData.map((item, index) => (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <strong>{item.date}</strong>
                          <span className="badge bg-secondary">
                            #{index + 1}
                          </span>
                        </div>

                        <p className="mb-1">
                          <strong>Office:</strong> {item.office_in_time} -{" "}
                          {item.Office_out_time}
                        </p>
                        <p className="mb-1">
                          <strong>Login:</strong> {item.login_time}
                        </p>
                        <p className="mb-1">
                          <strong>Logout:</strong> {item.logout_time}
                        </p>
                        <p className="mb-1 text-danger">
                          <strong>Late:</strong> {item.late}
                        </p>
                        <p className="mb-1">
                          <strong>Break:</strong> {item.total_break_time}
                        </p>
                        <span className={`text-gray`}>
                          Day Off: {item.day_off}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-3 px-md-4 py-3 border-top">
              <div className="text-muted mb-2 mb-md-0">
                Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)}{" "}
                of {totalEntries} entries
              </div>

              <div className="d-flex align-items-center">
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <span className="mx-2 fw-semibold">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
