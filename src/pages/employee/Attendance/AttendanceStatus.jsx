import { faBraille, faFile, faFileExcel, faFilePdf, faClock, faCalendar, faSearch, faFilter, faRefresh, faDownload, faMapMarkerAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../component/common/Breadcrumb';
import { AuthContext } from '../../../context/AuthContex';
import { toast } from 'react-toastify';
import axios from 'axios';
import PageLoader from '../../../component/loader/PageLoader';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AttendanceStatus = () => {
    const { token } = useContext(AuthContext);
    const api_url = import.meta.env.VITE_API_URL;
    const [loading, setLoading] = useState(true)
    const [rawAttendanceStatusData, setRawAttendanceStatusData] = useState([])
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Handle window resize for responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getCurrentData = async (fromDate = null, toDate = null) => {
        try {
            const requestData = {};

            // Only add dates to the request if they are provided
            if (fromDate && toDate) {
                requestData.from_date = fromDate;
                requestData.to_date = toDate;
            }

            const res = await axios.post(
                `${api_url}/show-emp-attendance`,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (res.data.flag === 1) {
                setRawAttendanceStatusData(res.data.data);
            } else {
                toast.error(res.data.message)
            }

        } catch (error) {
            console.error('Error fetching attendance data:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch attendance data');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCurrentData();
    }, [])

    const [attendancesStatusPage, setAttendancesStatusPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [dateFilter, setDateFilter] = useState({
        from_date: null,
        to_date: null
    });

    // Filtered and Sorted Data
    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return rawAttendanceStatusData
            .filter(entry =>
                entry.date.toLowerCase().includes(term) ||
                entry.time_in.toLowerCase().includes(term)
            )
    }, [searchTerm, rawAttendanceStatusData]);

    const totalPages = Math.ceil(filteredData.length / attendancesStatusPage);
    const startIndex = (currentPage - 1) * attendancesStatusPage;
    const endIndex = startIndex + attendancesStatusPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handleEntriesChange = (e) => {
        setAttendancesStatusPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await getCurrentData(dateFilter.from_date, dateFilter.to_date);
            setShowMobileFilters(false); // Close mobile filters after applying
        } catch (error) {
            console.error('Error filtering data:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDateChange = (e) => {
        const { id, value } = e.target;
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // reset time part

        // Prevent selecting future date
        if (selectedDate > today) {
            toast.error("You can only select today or past dates.");
            return; // don't update state
        }

        setDateFilter(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Reset function
    const handleReset = () => {
        // Clear date filters
        setDateFilter({
            from_date: '',
            to_date: ''
        });

        // Clear search term
        setSearchTerm('');

        // Reset to first page
        setCurrentPage(1);

        // Fetch original data
        getCurrentData()
    };


    // Export to Excel function
    const exportToExcel = () => {
        // Prepare data for export with exact same format as table
        const exportData = filteredData.map((item, index) => ({
            'SI.No': startIndex + index + 1,
            'Punch Date': item.date || 'N/A',
            'Punch In': item.time_in,
            'Punch Out': item.time_out,
            'Total Duty Hours': item.duty_hours || '00:00',
            'Status': item.status || 'N/A'
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths for better formatting
        const colWidths = [
            { wch: 8 },  // SI.No
            { wch: 15 }, // Punch Date
            { wch: 12 }, // Punch In
            { wch: 12 }, // Punch Out
            { wch: 18 }, // Total Duty Hours
            { wch: 12 }  // Status
        ];
        ws['!cols'] = colWidths;

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");

        // Generate file and download
        const fileName = `Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast.success("Excel file downloaded successfully!");
    };
    // Export to PDF function
    const exportToPDF = () => {
        // Create new PDF instance
        const doc = new jsPDF();

        // Add title with current date
        const currentDate = new Date().toLocaleDateString();
        doc.setFontSize(16);
        doc.text('Attendance Report', 14, 16);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${currentDate}`, 14, 22);

        // Prepare data for the table
        const tableData = filteredData.map((item, index) => [
            (startIndex + index + 1).toString(),
            item.date || 'N/A',
            item.time_in,
            item.time_out,
            item.duty_hours || '00:00',
            item.status || 'N/A'
        ]);

        // Add table to PDF
        autoTable(doc, {
            head: [['SI.No', 'Punch Date', 'Punch In', 'Punch Out', 'Total Duty Hours', 'Status']],
            body: tableData,
            startY: 30,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [200, 200, 200]
            },
            headStyles: {
                fillColor: [68, 66, 66], // Matches your table-infoo color #444242
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 10
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { top: 30 }
        });

        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10, { align: 'center' });
        }

        // Save the PDF
        const fileName = `Attendance_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        toast.success("PDF file downloaded successfully!");
    };


    if (loading) {
        return <PageLoader />
    }

    return (
        <div className='attendance-status'>


            <div className="row mb-4">
                <Breadcrumb pageTitle={"Attendance Status"} />
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
                            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>
                </div>
            )}

            {/* Filter Card - Hidden on mobile when toggled off */}
            <div className={`row mb-4 ${isMobile && !showMobileFilters ? 'd-none' : ''}`}>
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="card-title m-0 text-primary">
                                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                                    Filter Attendance
                                </h4>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleReset}
                                >
                                    <FontAwesomeIcon icon={faRefresh} className="me-1" />
                                    Reset
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-5">
                                        <label htmlFor="from_date" className="form-label fw-semibold">
                                            <FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />
                                            From date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control form-control-lg"
                                            id="from_date"
                                            value={dateFilter.from_date || ''}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                    <div className="col-md-5">
                                        <label htmlFor="to_date" className="form-label fw-semibold">
                                            <FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />
                                            To date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control form-control-lg"
                                            id="to_date"
                                            value={dateFilter.to_date || ''}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button type='submit' className='btn btn-primary btn-lg w-100 text-end'>
                                            <FontAwesomeIcon icon={faSearch} className="me-1" />
                                            {isMobile ? 'Search' : 'Apply'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-transparent py-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
                            <h4 className="card-title m-0 text-primary mb-2 mb-md-0">
                                <FontAwesomeIcon icon={faClock} className="me-2" />
                                Attendance Records
                            </h4>
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    className='btn btn-success mb-1 mb-md-0'
                                    onClick={exportToExcel}
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                                    {isMobile ? 'Excel' : 'Export Excel'}
                                </button>
                                <button className='btn btn-danger mb-1 mb-md-0' onClick={exportToPDF}>
                                    <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                                    {isMobile ? 'PDF' : 'Export PDF'}
                                </button>
                            </div>
                        </div>
                        <div className="card-body px-0 pb-0">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-4 px-3 px-md-4 mb-3">
                                <div className="d-flex align-items-center mb-2 mb-md-0">
                                    <span className="me-2 text-muted">Show</span>
                                    <select
                                        className="form-select form-select-sm w-auto"
                                        value={attendancesStatusPage}
                                        onChange={handleEntriesChange}
                                    >
                                        {[8, 10, 20, 50, 100].map((num) => (
                                            <option key={num} value={num}>{num}</option>
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
                                            placeholder="Search by date or time..."
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
                                            <th className="text-center text-gray border py-3">SI.No</th>
                                            <th className="text-center text-gray border py-3">Punch Date</th>
                                            <th className="text-center text-gray border py-3">Punch In</th>
                                            <th className="text-center text-gray border py-3">Punch Out</th>
                                            <th className="text-center text-gray border py-3">Total Duty Hours</th>
                                            <th className="text-center text-gray border py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.length > 0 ? (
                                            currentData.map((entry, index) => {
                                                const isAbsent = !entry?.time_out || entry?.time_out === "00:00:00";
                                                const isToday = entry.date === new Date().toISOString().split('T')[0];

                                                return (
                                                    <tr key={index}>
                                                        <td className="ps-4 fw-semibold text-gray text-end border">{startIndex + index + 1 || 'N/A'}</td>
                                                        <td className='border'>
                                                            <div className="d-flex align-items-center text-gray">
                                                                {entry?.date || 'N/A'}
                                                                {isToday && (
                                                                    <span className="badge text-gray ms-2">Today</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="border">
                                                            <div className="d-flex flex-column">
                                                                <span className="fw-semibold text-gray">
                                                                    {entry?.time_in}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="border">
                                                            <div className="d-flex flex-column">
                                                                <span className="fw-semibold text-gray">
                                                                    {entry?.time_out}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="fw-semibold text-gray border">{entry?.duty_hours || '00:00'}</td>
                                                        <td className="border">
                                                            <span className="badge fw-semibold text-gray"
                                                                style={{ fontSize: '1rem' }}
                                                            >
                                                                {entry?.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">
                                                    <div className="d-flex flex-column align-items-center text-muted">
                                                        <FontAwesomeIcon icon={faFile} size="2x" className="mb-2" />
                                                        <p className="mb-0">No attendance records found</p>
                                                        <small>Try adjusting your filters or search term</small>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Mobile Card View */}
                                <div className="d-md-none">
                                    {currentData.length > 0 ? (
                                        currentData.map((entry, index) => {
                                            const isAbsent = !entry?.time_out || entry?.time_out === "00:00:00";
                                            const isToday = entry.date === new Date().toISOString().split('T')[0];
                                            
                                            return (
                                                <div key={index} className="card mb-3 mx-3">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h6 className="card-title mb-0">
                                                                {entry?.date || 'N/A'}
                                                                {isToday && (
                                                                    <span className="badge bg-info text-dark ms-2">Today</span>
                                                                )}
                                                            </h6>
                                                            <span className="badge bg-secondary">#{startIndex + index + 1}</span>
                                                        </div>
                                                        
                                                        <div className="row">
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">Punch In</p>
                                                                <p className="mb-2 fw-semibold">{entry?.time_in}</p>
                                                            </div>
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">Punch Out</p>
                                                                <p className="mb-2 fw-semibold">{entry?.time_out}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="row">
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">Duty Hours</p>
                                                                <p className="mb-0 fw-semibold">{entry?.duty_hours || '00:00'}</p>
                                                            </div>
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">Status</p>
                                                                <p className="mb-0">
                                                                    <span className="badge fw-semibold">
                                                                        {entry?.status}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-4">
                                            <div className="d-flex flex-column align-items-center text-muted">
                                                <FontAwesomeIcon icon={faFile} size="2x" className="mb-2" />
                                                <p className="mb-0">No attendance records found</p>
                                                <small>Try adjusting your filters or search term</small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pagination */}
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-3 px-md-4 py-3 border-top">
                                <div className="text-muted mb-2 mb-md-0">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                                </div>
                                <div className="d-flex align-items-center">
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2 d-flex align-items-center"
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
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
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
                    .attendance-status {
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
                    
                    .location-text {
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

export default AttendanceStatus;