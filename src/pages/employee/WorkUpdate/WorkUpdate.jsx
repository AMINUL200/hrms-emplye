import {
  faEllipsisVertical,
  faFile,
  faFileExcel,
  faFilePdf,
  faPencil,
  faPlus,
  faTrashCan,
  faSearch,
  faFilter,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useMemo, useContext, useEffect } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../../../component/common/Breadcrumb";
import { AuthContext } from "../../../context/AuthContex";
import { toast } from "react-toastify";
import axios from "axios";
import PageLoader from "../../../component/loader/PageLoader";

const WorkUpdate = () => {
  const navigate = useNavigate();
  const api_url = import.meta.env.VITE_API_URL;
  const storage_url = import.meta.env.VITE_STORAGE_URL;
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [rawWorkUpdateData, setRawWorkUpdateData] = useState([]);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentRemarks, setCurrentRemarks] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchWorkUpdatesData = async () => {
    try {
      const response = await axios.get(`${api_url}/list-work-update`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          t: Date.now(), // prevent caching
        },
      });
      if (response.data.flag === 1) {
        setRawWorkUpdateData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching work updates:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch work updates"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkUpdatesData();
  }, []);

  const [workUpdatePerPage, setWorkUpdatePerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Transform API data to match expected format
  const transformedData = useMemo(() => {
    return rawWorkUpdateData.map((item) => ({
      id: item.id,
      date: item.date,
      from: item.in_time,
      to: item.out_time,
      time: `${item.w_hours}h ${item.w_min}m`,
      remarks: item.remarks,
      comment: item.cmd || "No comment",
    }));
  }, [rawWorkUpdateData]);

  // Sort by date (descending)
  const sortedWorkUpdate = useMemo(() => {
    return [...transformedData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [transformedData]);

  const filteredWorkUpdate = useMemo(() => {
    return sortedWorkUpdate.filter(
      (item) =>
        item.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedWorkUpdate, searchTerm]);

  const totalPages = Math.ceil(filteredWorkUpdate.length / workUpdatePerPage);
  const startIndex = (currentPage - 1) * workUpdatePerPage;
  const endIndex = startIndex + workUpdatePerPage;
  const currentWorkUpdate = filteredWorkUpdate.slice(startIndex, endIndex);

  // Handle showing remarks in modal
  const handleShowRemarks = (remarks) => {
    setCurrentRemarks(remarks);
    setShowRemarksModal(true);
  };

  // Export to Excel function
  const exportToExcel = () => {
    const exportData = currentWorkUpdate.map((item, index) => ({
      "SI No.": startIndex + index + 1,
      Date: item.date,
      "From Time": item.from,
      "To Time": item.to,
      Time: item.time,
      Remarks: item.remarks,
      Comment: item.comment,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Work Updates");

    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Work_Updates_${dateString}.xlsx`);
  };

  // Export to PDF function
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text("Daily Work Updates", 14, 15);

      const exportData = currentWorkUpdate.map((item, index) => [
        startIndex + index + 1,
        item.date,
        item.from,
        item.to,
        item.time,
        item.remarks,
        item.comment,
      ]);

      autoTable(doc, {
        head: [
          [
            "SI No.",
            "Date",
            "From Time",
            "To Time",
            "Time",
            "Remarks",
            "Comment",
          ],
        ],
        body: exportData,
        startY: 25,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [68, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
      });

      const today = new Date();
      const dateString = today.toISOString().split("T")[0];
      doc.save(`Work_Updates_${dateString}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please check console for details.");
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleEntriesChange = (e) => {
    setWorkUpdatePerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  // Reset function
  const handleReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchWorkUpdatesData();
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="work-update">
      {/* Remarks Modal */}
      {showRemarksModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Remarks</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRemarksModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p
                  className="remarks-text blog-rich-text"
                  dangerouslySetInnerHTML={{ __html: currentRemarks }}
                >
                  {/* {currentRemarks} */}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRemarksModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4">
        <Breadcrumb pageTitle="Work Update" />
      </div>

      {/* Add Work Update Button */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-end">
            <Link to="/organization/add-work-update">
              <button className="btn btn-warning text-white">
                <FontAwesomeIcon
                  icon={faPlus}
                  style={{ fontSize: "1.3rem", marginRight: "9px" }}
                />
                Add Daily Work Update
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      {isMobile && (
        <div className="row mb-3">
          <div className="col-12">
            <button
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <FontAwesomeIcon icon={faFilter} className="me-2" />
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
        </div>
      )}

      {/* Work Update Table */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-transparent py-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
              <h4 className="card-title m-0 text-primary mb-2 mb-md-0">
                <FontAwesomeIcon icon={faFile} className="me-2" />
                Work Update Records
              </h4>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-success mb-1 mb-md-0"
                  onClick={exportToExcel}
                >
                  <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                  {isMobile ? "Excel" : "Export Excel"}
                </button>
                <button
                  className="btn btn-danger mb-1 mb-md-0"
                  onClick={exportToPDF}
                >
                  <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                  {isMobile ? "PDF" : "Export PDF"}
                </button>
              </div>
            </div>
            <div className="card-body px-0 pb-0">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-4 px-3 px-md-4 mb-3">
                <div className="d-flex align-items-center mb-2 mb-md-0">
                  <span className="me-2 text-muted">Show</span>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={workUpdatePerPage}
                    onChange={handleEntriesChange}
                  >
                    {[8, 10, 20, 50, 100].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <span className="ms-2 text-muted">entries</span>
                </div>
                <div className="d-flex align-items-center w-100 w-md-auto">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faSearch} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search remarks or comments..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                {/* Desktop Table View */}
                <table className="table table-hover align-middle mb-0 d-none d-md-table">
                  <thead className="table-infoo">
                    <tr>
                      <th className="text-center text-gray border py-3">
                        SI.No
                      </th>
                      <th className="text-center text-gray border py-3">
                        Date
                      </th>
                      <th className="text-center text-gray border py-3">
                        From Time
                      </th>
                      <th className="text-center text-gray border py-3">
                        To Time
                      </th>
                      <th className="text-center text-gray border py-3">
                        Time
                      </th>
                      <th className="text-center text-gray border py-3">
                        Work Report
                      </th>
                      <th className="text-center text-gray border py-3">
                        Comment
                      </th>
                      <th className="text-center text-gray border py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentWorkUpdate.length > 0 ? (
                      currentWorkUpdate.map((item, index) => (
                        <tr key={item.id}>
                          <td className="ps-4 fw-semibold text-gray text-end border">
                            {startIndex + index + 1}
                          </td>
                          <td className="border text-gray">{item.date}</td>
                          <td className="border text-gray">{item.from}</td>
                          <td className="border text-gray">{item.to}</td>
                          <td className="fw-semibold text-gray border">
                            {item.time}
                          </td>
                          <td className="border text-center">
                            {item.remarks && item.remarks.length > 30 ? (
                              <span
                                className="remarks-truncate text-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleShowRemarks(item.remarks)}
                                title="Click to view full remarks"
                                dangerouslySetInnerHTML={{
                                  __html: item.remarks.substring(0, 30),
                                }}
                              >
                                {/* {item.remarks.substring(0, 30)}... */}
                              </span>
                            ) : (
                              <span className="text-gray">
                                {item.remarks || "No remarks"}
                              </span>
                            )}
                          </td>
                          <td className="border text-gray">{item.comment}</td>
                          <td className="border ">
                            <div className="dropdown dropstart">
                              <button
                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/organization/add-work-update?update=${item.id}`}
                                  >
                                    <FontAwesomeIcon
                                      icon={faPencil}
                                      className="me-2"
                                    />{" "}
                                    Edit
                                  </Link>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_approve"
                                  >
                                    <FontAwesomeIcon
                                      icon={faTrashCan}
                                      className="me-2"
                                    />{" "}
                                    Delete
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="d-flex flex-column align-items-center text-muted">
                            <FontAwesomeIcon
                              icon={faFile}
                              size="2x"
                              className="mb-2"
                            />
                            <p className="mb-0">No work updates found</p>
                            <small>Try adjusting your search term</small>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="d-md-none">
                  {currentWorkUpdate.length > 0 ? (
                    currentWorkUpdate.map((item, index) => (
                      <div key={item.id} className="card mb-3 mx-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0 text-gray">
                              {item.date}
                            </h6>
                            <span className="badge bg-secondary">
                              #{startIndex + index + 1}
                            </span>
                          </div>

                          <div className="row mb-2">
                            <div className="col-6">
                              <p className="mb-1 small text-muted">From</p>
                              <p className="mb-0 fw-semibold text-gray">
                                {item.from}
                              </p>
                            </div>
                            <div className="col-6">
                              <p className="mb-1 small text-muted">To</p>
                              <p className="mb-0 fw-semibold text-gray">
                                {item.to}
                              </p>
                            </div>
                          </div>

                          <div className="row mb-2">
                            <div className="col-6">
                              <p className="mb-1 small text-muted">Time</p>
                              <p className="mb-0 fw-semibold text-gray">
                                {item.time}
                              </p>
                            </div>
                          </div>

                          <div className="row mb-2">
                            <div className="col-12">
                              <p className="mb-1 small text-muted">
                                Work Report
                              </p>
                              {item.remarks && item.remarks.length > 50 ? (
                                <p
                                  className="mb-0 text-primary"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleShowRemarks(item.remarks)
                                  }
                                >
                                  {item.remarks.substring(0, 50)}...
                                </p>
                              ) : (
                                <p className="mb-0 text-gray">
                                  {item.remarks || "No remarks"}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-12">
                              <p className="mb-1 small text-muted">Comment</p>
                              <p className="mb-0 text-gray">{item.comment}</p>
                            </div>
                          </div>

                          <div className="d-flex justify-content-end">
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                Actions
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/organization/add-work-update?update=${item.id}`}
                                  >
                                    <FontAwesomeIcon
                                      icon={faPencil}
                                      className="me-2"
                                    />{" "}
                                    Edit
                                  </Link>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_approve"
                                  >
                                    <FontAwesomeIcon
                                      icon={faTrashCan}
                                      className="me-2"
                                    />{" "}
                                    Delete
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <div className="d-flex flex-column align-items-center text-muted">
                        <FontAwesomeIcon
                          icon={faFile}
                          size="2x"
                          className="mb-2"
                        />
                        <p className="mb-0">No work updates found</p>
                        <small>Try adjusting your search term</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-3 px-md-4 py-3 border-top">
                <div className="text-muted mb-2 mb-md-0">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredWorkUpdate.length)} of{" "}
                  {filteredWorkUpdate.length} entries
                </div>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <div className="mx-2 d-flex align-items-center">
                    <span className="text-muted">Page</span>
                    <span className="mx-2 fw-semibold">{currentPage}</span>
                    <span className="text-muted">of {totalPages}</span>
                  </div>
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

      {/* Custom CSS */}
      <style>
        {`
                    .work-update {
                        font-family: 'Inter', 'Segoe UI', sans-serif;
                    }
                    
                    .card {
                        border-radius: 12px;
                    }
                    
                    .card-header {
                        border-bottom: 1px solid rgba(0,0,0,0.08);
                    }
                    
                    .table th {
                        font-weight: 600;
                        text-transform: uppercase;
                        font-size: 0.85rem;
                        letter-spacing: 0.5px;
                        border-top: none;
                    }
                    
                    .cursor-pointer {
                        cursor: pointer;
                    }
                    
                    .remarks-text {
                        word-wrap: break-word;
                        white-space: pre-wrap;
                        line-height: 1.6;
                    }
                    
                    .badge {
                        font-size: 0.75rem;
                    }
                    
                    .btn {
                        border-radius: 8px;
                        font-weight: 500;
                    }
                    
                    .form-control, .form-select {
                        border-radius: 8px;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .form-control:focus, .form-select:focus {
                        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
                        border-color: #4299e1;
                    }
                    
                    .table-hover tbody tr:hover {
                        background-color: rgba(66, 153, 225, 0.05);
                    }
                    
                    .text-muted {
                        color: #718096 !important;
                    }
                    
                    .text-gray{
                        color: gray !important;
                    }
                    
                    .table-infoo th {
                        background-color: #adadadff !important;
                        color: white !important;
                        border-color: #8e8d8dff !important;
                    }
                    
                    .remarks-truncate {
                        color: #0d6efd;
                        text-decoration: underline dotted;
                    }
                    
                    .remarks-truncate:hover {
                        color: #0a58ca;
                    }
                    
                    /* Responsive adjustments */
                    @media (max-width: 767.98px) {
                        .card-body {
                            padding: 1rem;
                        }
                        
                        .form-control-lg {
                            font-size: 1rem;
                        }
                        
                        .btn-lg {
                            padding: 0.5rem 1rem;
                            font-size: 1rem;
                        }
                        
                        .table-responsive {
                            border: none;
                        }
                        
                        .input-group {
                            width: 100% !important;
                        }
                    }
                    
                    @media (max-width: 575.98px) {
                        .card-title {
                            font-size: 1.2rem;
                        }
                        
                        .btn-group-responsive {
                            flex-direction: column;
                            gap: 0.5rem;
                        }
                        
                        .btn-group-responsive .btn {
                            width: 100%;
                        }
                    }
                `}
      </style>
    </div>
  );
};

export default WorkUpdate;
