import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBraille, faCircleDot, faEllipsisVertical, faFile, faFileExcel, faFilePdf, faPencil, faPlus, faTrashCan, faSearch, faFilter, faRefresh, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { avatar9 } from '../../../assets';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContex';
import ModalCenter from '../../../component/common/ModalCenter';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Breadcrumb from '../../../component/common/Breadcrumb';

const LeaveList = () => {
    const { token } = useContext(AuthContext);
    const {
        leavesData,
        loading,
        fetchLeavesData,
        formatDisplayDate,
        getStatusObject
    } = useContext(EmployeeContext);

    const [leavesListPerPage, setLeavesListPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedLeaveDoc, setSelectedLeaveDoc] = useState(null);
    const [dateFilter, setDateFilter] = useState({
        fromDate: null,
        toDate: null
    });
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

    useEffect(() => {
        fetchLeavesData(token, dateFilter.fromDate, dateFilter.toDate);
    }, [token, dateFilter.fromDate, dateFilter.toDate]);

    const formattedLeavesData = useMemo(() => {
        return leavesData.map(leave => ({
            id: leave.id,
            type: leave.leave_type?.leave_type_name || 'N/A',
            from: formatDisplayDate(leave.from_date),
            to: formatDisplayDate(leave.to_date),
            days: `${leave.no_of_leave} ${leave.no_of_leave > 1 ? 'days' : 'day'}`,
            reason: leave.leave_cos || 'N/A',
            status: getStatusObject(leave.status),
            approvedBy: leave.emp_lv_sanc_auth || 'Pending Approval',
            avatar: avatar9,
            docImage: leave.doc_image || '',
            dateOfApply: formatDisplayDate(leave.date_of_apply)
        }));
    }, [leavesData]);

    const sortedLeavesList = useMemo(() => {
        return [...formattedLeavesData].sort((a, b) => new Date(b.dateOfApply) - new Date(a.dateOfApply));
    }, [formattedLeavesData]);

    const filteredLeavesList = useMemo(() => {
        return sortedLeavesList.filter(item =>
            item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.days.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.dateOfApply.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [sortedLeavesList, searchTerm]);

    const handleDateFilterSubmit = (e) => {
        e.preventDefault();
        const fromDate = e.target.elements['from-date'].value;
        const toDate = e.target.elements['to-date'].value;
        setDateFilter({ fromDate, toDate });
        setCurrentPage(1);
        setShowMobileFilters(false);
    };

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

    const totalPages = Math.ceil(filteredLeavesList.length / leavesListPerPage);
    const startIndex = (currentPage - 1) * leavesListPerPage;
    const endIndex = startIndex + leavesListPerPage;
    const currentLeaves = filteredLeavesList.slice(startIndex, endIndex);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleEntriesChange = (e) => {
        setLeavesListPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Reset function
    const handleReset = () => {
        setDateFilter({
            fromDate: '',
            toDate: ''
        });
        setSearchTerm('');
        setCurrentPage(1);
        fetchLeavesData(token);
    };

    const exportToExcel = () => {
        const exportData = currentLeaves.map((item, index) => ({
            'SI No.': startIndex + index + 1,
            'Leave Type': item.type,
            'From Date': item.from,
            'To Date': item.to,
            'No. of Days': item.days,
            'Date of Apply': item.dateOfApply,
            'Reason': item.reason,
            'Status': item.status.text,
            'Approved By': item.approvedBy
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leaves Data");

        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Leaves_Data_${dateString}.xlsx`);
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.setTextColor(40);
            doc.text('Leaves Data', 14, 15);

            const exportData = currentLeaves.map((item, index) => [
                startIndex + index + 1,
                item.type,
                item.from,
                item.to,
                item.days,
                item.dateOfApply,
                item.reason,
                item.status.text,
                item.approvedBy
            ]);

            autoTable(doc, {
                head: [['SI No.', 'Leave Type', 'From Date', 'To Date', 'No. of Days', 'Date of Apply', 'Reason', 'Status', 'Approved By']],
                body: exportData,
                startY: 25,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [68, 66, 66],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                }
            });

            const today = new Date();
            const dateString = today.toISOString().split('T')[0];
            doc.save(`Leaves_Data_${dateString}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <>
            <div className='leaves-page'>
                <div className="row mb-4">
                    <Breadcrumb pageTitle="Leave List" />
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
                                        Filter Leaves
                                    </h4>
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={handleReset}
                                    >
                                        <FontAwesomeIcon icon={faRefresh} className="me-1" />
                                        Reset
                                    </button>
                                </div>
                                <form onSubmit={handleDateFilterSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-5">
                                            <label htmlFor="from-date" className="form-label fw-semibold">
                                                <FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />
                                                From date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control form-control-lg"
                                                id="from-date"
                                                value={dateFilter.fromDate || ''}
                                                onChange={handleDateChange}
                                            />
                                        </div>
                                        <div className="col-md-5">
                                            <label htmlFor="to-date" className="form-label fw-semibold">
                                                <FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />
                                                To date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control form-control-lg"
                                                id="to-date"
                                                value={dateFilter.toDate || ''}
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

                {/* Leaves Table */}
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-transparent py-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
                                <h4 className="card-title m-0 text-primary mb-2 mb-md-0">
                                    <FontAwesomeIcon icon={faFile} className="me-2" />
                                    Leave Records
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
                                            value={leavesListPerPage}
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
                                                placeholder="Search leaves..."
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
                                                <th className="text-center text-gray border py-3">Leave Type</th>
                                                <th className="text-center text-gray border py-3">From Date</th>
                                                <th className="text-center text-gray border py-3">To Date</th>
                                                <th className="text-center text-gray border py-3">No of Days</th>
                                                <th className="text-center text-gray border py-3">Date of Apply</th>
                                                <th className="text-center text-gray border py-3">Status</th>
                                                <th className="text-center text-gray border py-3">Document</th>
                                                <th className="text-center text-gray border py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-4">
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : currentLeaves.length > 0 ? (
                                                currentLeaves.map((leave, index) => (
                                                    <tr key={index}>
                                                        <td className="ps-4 fw-semibold text-gray text-end border">{startIndex + index + 1}</td>
                                                        <td className='border text-gray'>{leave.type}</td>
                                                        <td className="border text-gray">{leave.from}</td>
                                                        <td className="border text-gray">{leave.to}</td>
                                                        <td className="fw-semibold text-gray border">{leave.days}</td>
                                                        <td className="border text-gray">{leave.dateOfApply}</td>
                                                        <td className="border text-center">
                                                            <span className={`badge fw-semibold ${leave.status.bgColor || 'bg-secondary'}`}>
                                                                {leave.status.text}
                                                            </span>
                                                        </td>
                                                        <td className="border text-center">
                                                            <div 
                                                                className="cursor-pointer"
                                                                onClick={() => {
                                                                    setSelectedLeaveDoc(leave.docImage);
                                                                    setShowModal(true);
                                                                }}
                                                            >
                                                                {leave.docImage ? (
                                                                    leave.docImage.endsWith('.pdf') || leave.docImage.includes('.pdf') ? (
                                                                        <div className="document-icon">
                                                                            <FontAwesomeIcon icon={faFilePdf} className="text-danger" size="lg" />
                                                                            <span className="small d-block">PDF</span>
                                                                        </div>
                                                                    ) : (
                                                                        <img
                                                                            src={`https://skilledworkerscloud.co.uk/hrms-v2/public/storage/${leave.docImage}`}
                                                                            alt="Document"
                                                                            className="avatar-sm rounded"
                                                                            onError={(e) => {
                                                                                e.target.onerror = null;
                                                                                e.target.src = avatar9;
                                                                            }}
                                                                        />
                                                                    )
                                                                ) : (
                                                                    <div className="document-icon">
                                                                        <FontAwesomeIcon icon={faFile} className="text-muted" size="lg" />
                                                                        <span className="small d-block">No Doc</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="border text-center">
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
                                                                        <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_leave">
                                                                            <FontAwesomeIcon icon={faPencil} className="me-2" /> Edit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_approve">
                                                                            <FontAwesomeIcon icon={faTrashCan} className="me-2" /> Delete
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-4">
                                                        <div className="d-flex flex-column align-items-center text-muted">
                                                            <FontAwesomeIcon icon={faFile} size="2x" className="mb-2" />
                                                            <p className="mb-0">No leaves found</p>
                                                            <small>Try adjusting your filters or search term</small>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Mobile Card View */}
                                    <div className="d-md-none">
                                        {loading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : currentLeaves.length > 0 ? (
                                            currentLeaves.map((leave, index) => (
                                                <div key={index} className="card mb-3 mx-3">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h6 className="card-title mb-0 text-gray">
                                                                {leave.type}
                                                            </h6>
                                                            <span className="badge bg-secondary">#{startIndex + index + 1}</span>
                                                        </div>
                                                        
                                                        <div className="row mb-2">
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">From</p>
                                                                <p className="mb-0 fw-semibold text-gray">{leave.from}</p>
                                                            </div>
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">To</p>
                                                                <p className="mb-0 fw-semibold text-gray">{leave.to}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="row mb-2">
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">Days</p>
                                                                <p className="mb-0 fw-semibold text-gray">{leave.days}</p>
                                                            </div>
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">Applied On</p>
                                                                <p className="mb-0 fw-semibold text-gray">{leave.dateOfApply}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="row mb-2">
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">Status</p>
                                                                <p className="mb-0">
                                                                    <span className={`badge fw-semibold ${leave.status.bgColor || 'bg-secondary'}`}>
                                                                        {leave.status.text}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <div className="col-6">
                                                                <p className="mb-1 small text-muted">Document</p>
                                                                <div 
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedLeaveDoc(leave.docImage);
                                                                        setShowModal(true);
                                                                    }}
                                                                >
                                                                    {leave.docImage ? (
                                                                        leave.docImage.endsWith('.pdf') || leave.docImage.includes('.pdf') ? (
                                                                            <div className="document-icon">
                                                                                <FontAwesomeIcon icon={faFilePdf} className="text-danger" />
                                                                                <span className="small d-block">PDF</span>
                                                                            </div>
                                                                        ) : (
                                                                            <img
                                                                                src={`https://skilledworkerscloud.co.uk/hrms-v2/public/storage/${leave.docImage}`}
                                                                                alt="Document"
                                                                                className="avatar-sm rounded"
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null;
                                                                                    e.target.src = avatar9;
                                                                                }}
                                                                            />
                                                                        )
                                                                    ) : (
                                                                        <div className="document-icon">
                                                                            <FontAwesomeIcon icon={faFile} className="text-muted" />
                                                                            <span className="small d-block">No Doc</span>
                                                                        </div>
                                                                    )}
                                                                </div>
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
                                                                        <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_leave">
                                                                            <FontAwesomeIcon icon={faPencil} className="me-2" /> Edit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_approve">
                                                                            <FontAwesomeIcon icon={faTrashCan} className="me-2" /> Delete
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
                                                    <FontAwesomeIcon icon={faFile} size="2x" className="mb-2" />
                                                    <p className="mb-0">No leaves found</p>
                                                    <small>Try adjusting your filters or search term</small>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pagination */}
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-3 px-md-4 py-3 border-top">
                                    <div className="text-muted mb-2 mb-md-0">
                                        Showing {startIndex + 1} to {Math.min(endIndex, filteredLeavesList.length)} of {filteredLeavesList.length} entries
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
            </div>

            <ModalCenter show={showModal} onHide={() => setShowModal(false)} docImage={selectedLeaveDoc} />

            {/* Custom CSS */}
            <style>
                {`
                    .leaves-page {
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
                    
                    .avatar-sm {
                        width: 40px;
                        height: 40px;
                        object-fit: cover;
                    }
                    
                    .document-icon {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
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
        </>
    );
};

export default LeaveList;