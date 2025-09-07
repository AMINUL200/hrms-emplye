import { faBraille, faFile, faFileExcel, faFilePdf, faL } from '@fortawesome/free-solid-svg-icons';
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
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [currentLocation, setCurrentLocation] = useState({ text: '', type: '' });


    // Function to format time values - show "Absent" for "00:00:00"
    const formatTimeValue = (timeValue) => {
        return timeValue === '00:00:00' || !timeValue ? 'Absent' : timeValue;
    };

    const getCurrentData = async (fromDate = null, toDate = null) => {
        try {
            const requestData = {};

            // Only add dates to the request if they are provided
            if (fromDate && toDate) {
                requestData.from_date = fromDate;
                requestData.to_date = toDate;
            }

            const res = await axios.post(
                `${api_url}/show-attendance`,
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
                entry.time_in_location.toLowerCase().includes(term) ||
                entry.time_out_location.toLowerCase().includes(term)
            )
        // .sort((a, b) => new Date(b.date) - new Date(a.date));
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
        } catch (error) {
            console.error('Error filtering data:', error);
        } finally {
            setLoading(false);
        }
    }
    const handleDateChange = (e) => {
        const { id, value } = e.target;
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

        // // Fetch original data
        // setLoading(true);
        getCurrentData()
        // .finally(() => setLoading(false));
    };

    // Handle showing location in modal
    const handleShowLocation = (location, type) => {
        setCurrentLocation({ text: location, type });
        setShowLocationModal(true);
    };

    // Export to Excel function
    const exportToExcel = () => {
        // Prepare data for export
        const exportData = filteredData.map(item => ({
            'SI No.': item.id || 'N/A',
            'Date': item.date || 'N/A',
            'Clock In': formatTimeValue(item.time_in),
            // 'Clock In Location': item.time_in_location || 'Absent',
            'Clock Out': formatTimeValue(item.time_out),
            // 'Clock Out Location': item.time_out_location || 'Absent',
            'Duty Hours': item.duty_hours || 'Absent'
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");

        // Generate file and download
        XLSX.writeFile(wb, `Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Export to PDF function
    const exportToPDF = () => {
        // Create new PDF instance
        const doc = new jsPDF();

        // Add title
        doc.text('Attendance Report', 14, 16);

        // Prepare data for the table
        const tableData = filteredData.map(item => [
            item.id || 'N/A',
            item.date || 'N/A',
            formatTimeValue(item.time_in),
            // item.time_in_location || 'Absent',
            formatTimeValue(item.time_out),
            // item.time_out_location || 'Absent',
            item.duty_hours || 'Absent'
        ]);

        // Add table to PDF
        autoTable(doc, {
            head: [['SI No.', 'Date', 'Clock In',  'Clock Out',  'Duty Hours']],
            body: tableData,
            startY: 20,
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Save the PDF
        doc.save(`Attendance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };


    if (loading) {
        console.log(rawAttendanceStatusData);

        return <PageLoader />
    }

    return (
        <div className='attendance-status'>
            {/* Location Modal */}
            {showLocationModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {currentLocation.type === 'in' ? 'Clock In' : 'Clock Out'} Location
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowLocationModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="location-text">{currentLocation.text}</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowLocationModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                <Breadcrumb pageTitle={"Attendance Status"} />

            </div>
            {/* Filter Card */}
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-12">
                                        <h4 className="card-title">
                                            <FontAwesomeIcon icon={faBraille} /> Attendance Status
                                        </h4>
                                    </div>
                                    <div className="col-md-5 mt-4">
                                        <div className="form-group">
                                            <label htmlFor="from_date">From date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="from_date"
                                                value={dateFilter.from_date}
                                                onChange={handleDateChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-5 mt-4">
                                        <div className="form-group">
                                            <label htmlFor="to_date">To date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="to_date"
                                                value={dateFilter.to_date}
                                                onChange={handleDateChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-2 mt-4 att-btn gap-2">
                                        <button type='submit' className='btn btn-warning text-white'>Submit</button>
                                        <button type='reset' className='btn btn-warning text-white' onClick={handleReset}>Reset</button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between ">
                            <h4 className="card-title m-0">
                                <FontAwesomeIcon icon={faFile} className="me-2" />
                                Attendance
                            </h4>
                            <div className="card-export">
                                <button
                                    className='btn btn-success me-2'
                                    onClick={exportToExcel}
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                                    Export to Excel
                                </button>
                                <button className='btn btn-primary' onClick={exportToPDF}>
                                    <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                                    Export to PDF
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive-ee">
                                <div className="dataTables_wrapper">
                                    <div className="row">
                                        <div className="col-sm-12 col-md-6">
                                            <div>
                                                Show{' '}
                                                <select className="form-select d-inline w-auto" value={attendancesStatusPage} onChange={handleEntriesChange}>
                                                    {[8, 10, 20, 50, 100].map((num) => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>{' '}
                                                entries
                                            </div>
                                        </div>
                                        <div className="col-sm-12 col-md-6">
                                            <div >
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search location..."
                                                    value={searchTerm}
                                                    onChange={handleSearch}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <table className="table table-striped custom-table attendance-status-table mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>SI No.</th>
                                                        <th>Date</th>
                                                        <th>Clock In</th>
                                                        {/* <th className="text-center">Clock In Location</th> */}
                                                        <th>Clock Out</th>
                                                        {/* <th className="text-center">Clock Out Location</th> */}
                                                        <th>Duty Hours</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentData.length > 0 ? (
                                                        currentData.map((entry, index) => (
                                                            <tr key={index}>
                                                                <td>{startIndex + index + 1 || 'N/A'}</td>
                                                                <td>{entry?.date || 'N/A'}</td>
                                                                {/* <td>{entry?.time_in || 'Absent'}</td> */}
                                                                <td>{formatTimeValue(entry?.time_in)}</td>
                                                                {/* <td className="text-center">
                                                                    {entry?.time_in_location && entry.time_in_location.length > 30 ? (
                                                                        <span
                                                                            className="location-truncate"
                                                                            style={{ cursor: 'pointer' }}
                                                                            onClick={() => handleShowLocation(entry.time_in_location, 'in')}
                                                                            title="Click to view full location"
                                                                        >
                                                                            {entry.time_in_location.substring(0, 30)}...
                                                                        </span>
                                                                    ) : (
                                                                        entry?.time_in_location || 'Absent'
                                                                    )}
                                                                </td> */}
                                                                <td>{formatTimeValue(entry?.time_out)}</td>
                                                                {/* <td className="text-center">
                                                                    {entry?.time_out_location && entry.time_out_location.length > 30 ? (
                                                                        <span
                                                                            className="location-truncate"
                                                                            style={{ cursor: 'pointer' }}
                                                                            onClick={() => handleShowLocation(entry.time_out_location, 'out')}
                                                                            title="Click to view full location"
                                                                        >
                                                                            {entry.time_out_location.substring(0, 30)}...
                                                                        </span>
                                                                    ) : (
                                                                        entry?.time_out_location || 'Absent'
                                                                    )}
                                                                </td> */}
                                                                <td>{entry?.duty_hours || 'N/A'}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="text-center">No records found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="row">
                                        {/* Pagination */}
                                        <div className="d-flex justify-content-between align-items-center mt-3 px-2">
                                            <div>
                                                Showing {startIndex + 1}–{Math.min(endIndex, filteredData.length)} of {filteredData.length} records
                                            </div>
                                            <div>
                                                <button className="btn btn-outline-secondary me-2" onClick={handlePrev} disabled={currentPage === 1}>
                                                    Prev
                                                </button>
                                                <button className="btn btn-outline-secondary" onClick={handleNext} disabled={currentPage === totalPages}>
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS */}
            <style>
                {`
                    .location-truncate {
                        color: #0d6efd;
                        text-decoration: underline dotted;
                    }
                    
                    .location-truncate:hover {
                        color: #0a58ca;
                    }
                    
                    .modal-body .location-text {
                        word-wrap: break-word;
                        white-space: pre-wrap;
                    }
                    
                    .table-responsive-ee {
                        overflow-x: auto;
                    }
                    
                    .attendance-status-table th,
                    .attendance-status-table td {
                        vertical-align: middle;
                    }
                    
                    .attendance-status-table th:nth-child(4),
                    .attendance-status-table td:nth-child(4),
                    .attendance-status-table th:nth-child(6),
                    .attendance-status-table td:nth-child(6) {
                        max-width: 200px;
                    }
                `}
            </style>
        </div>
    );
};

export default AttendanceStatus;