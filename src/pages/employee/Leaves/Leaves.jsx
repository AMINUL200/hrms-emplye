import React, { useContext, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faCircleDot, faEllipsisVertical, faFile, faFileExcel, faFilePdf, faPencil, faPlus, faTrashCan, faBraille, faL } from '@fortawesome/free-solid-svg-icons';
import { avatar9 } from '../../../assets';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../../component/common/Breadcrumb';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContex';
import ModalCenter from '../../../component/common/ModalCenter';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import DotLoader from '../../../component/common/DotLoader';
import { toast } from 'react-toastify';


const Leaves = () => {
    const { token, data } = useContext(AuthContext)
    const {
        leavesData,
        loading,
        fetchLeavesData,
        formatDisplayDate,
        getStatusObject,
        fetchLeaveTypeData,
        leaveTypeData,
        fetchLeaveInHandData,
        calculateDays,
        leaveApply,
        fetchReamingLeave,
        remainingLeave

    } = useContext(EmployeeContext)
    const [leavesListPerPage, setLeavesListPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedLeaveDoc, setSelectedLeaveDoc] = useState(null);
    const [leaveInHand, setLeaveInHand] = useState("");
    const [formData, setFormData] = useState({
        date_of_application: new Date().toISOString().split('T')[0], // Default to today
        leave_type_id: '',
        from_date: '',
        to_date: '',
        no_of_days: '',
        image: null
    });
    const [submitLoading, setSubmitLoading] = useState(false)
    const [dateFilter, setDateFilter] = useState({
        fromDate: null,
        toDate: null
    });


    const validateDates = () => {
        const currentDate = new Date().toISOString().split('T')[0];
        const fromDate = formData.from_date;
        const toDate = formData.to_date;

        // Check if From Date is earlier than current date
        if (fromDate && fromDate < currentDate) {
            toast.error("From Date cannot be earlier than today");
            return false;
        }

        // Check if To Date is earlier than From Date
        if (fromDate && toDate && toDate < fromDate) {
            toast.error("To Date cannot be earlier than From Date");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate dates before submitting
        if (!validateDates()) {
            return;
        }
        setSubmitLoading(true)


        try {
            const result = await leaveApply(token, formData);
            toast.success(result);
            // Reset form after successful submission
            setFormData({
                date_of_application: new Date().toISOString().split('T')[0],
                leave_type_id: '',
                from_date: '',
                to_date: '',
                no_of_days: '',
                image: null
            });
            setLeaveInHand("")
        } catch (error) {
            // Error handling is done in the leaveApply function
            console.log(error);

        } finally {
            setSubmitLoading(false);
            fetchLeavesData(token, dateFilter.fromDate, dateFilter.toDate);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };








    useEffect(() => {
        fetchLeavesData(token, dateFilter.fromDate, dateFilter.toDate);

    }, [token, dateFilter.fromDate, dateFilter.toDate]);

    useEffect(() => {
        fetchLeaveTypeData(token, data.id, data.emid)
        fetchReamingLeave(token)
    }, [token])



    // Format API data to match your table structure
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
            avatar: avatar9, // Default avatar,
            docImage: leave.doc_image || '',
            dateOfApply: formatDisplayDate(leave.date_of_apply)

        }));
    }, [leavesData]);




    const sortedLeavesList = useMemo(() => {
        return [...formattedLeavesData].sort((a, b) => new Date(b.to_date) - new Date(a.to_date));
    }, [formattedLeavesData]);

    const filteredLeavesList = useMemo(() => {
        return sortedLeavesList.filter(item =>
            item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            // item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.days.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status.text.toLowerCase().includes(searchTerm.toLowerCase())
            // item.approvedBy.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [sortedLeavesList, searchTerm])

    const handleDateFilterSubmit = (e) => {
        e.preventDefault();
        const fromDate = e.target.elements['from-date'].value;
        const toDate = e.target.elements['to-date'].value;
        setDateFilter({ fromDate, toDate });
        setCurrentPage(1); // Reset to first page when filters change
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





















    // Export to Excel function
    const exportToExcel = () => {
        // Prepare data for export (using current filtered and paginated data)
        const exportData = currentLeaves.map((item, index) => ({
            'SI No.': startIndex + index + 1,
            'Leave Type': item.type,
            'From Date': item.from,
            'To Date': item.to,
            'No. of Days': item.days,
            'Reason': item.reason,
            'Status': item.status.text,
            'Approved By': item.approvedBy
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leaves Data");

        // Generate current date for filename
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];

        // Export the workbook
        XLSX.writeFile(workbook, `Leaves_Data_${dateString}.xlsx`);
    };

    // Export to PDF function
    const exportToPDF = () => {
        try {
            // Initialize jsPDF
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(16);
            doc.setTextColor(40);
            doc.text('Leaves Data', 14, 15);

            // Prepare data for export
            const exportData = currentLeaves.map((item, index) => [
                startIndex + index + 1,
                item.type,
                item.from,
                item.to,
                item.days,
                item.reason,
                item.status.text,
                item.approvedBy
            ]);

            // Use autoTable plugin
            autoTable(doc, {
                head: [['SI No.', 'Leave Type', 'From Date', 'To Date', 'No. of Days', 'Reason', 'Status', 'Approved By']],
                body: exportData,
                startY: 25,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [34, 139, 34], // Dark green color
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                }
            });

            // Generate filename with current date
            const today = new Date();
            const dateString = today.toISOString().split('T')[0];

            // Save the PDF
            doc.save(`Leaves_Data_${dateString}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please check console for details.');
        }
    };

    console.log(remainingLeave);


    return (
        <>
            <div className='leaves-page'>
                <div className="row">
                    <Breadcrumb pageTitle="Leaves" />
                </div>


                {/* <!-- Leave Remaining --> */}
                <div class="row">
                    {remainingLeave.map((leave, index) => (
                        <div className="col-md-3" key={leave.id}>
                            <div className="stats-info">
                                <h6>{leave.leave_type_name}</h6>
                                <h4>{leave.leave_in_hand}</h4>
                            </div>
                        </div>
                    ))}
                    
                </div>
                {/* <!-- /Leave Statistics --> */}


                {/* leave form */}
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>



                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="pay-slip-heading">
                                                <h4>Leave Application</h4>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="pay-slip-heading holiday-cal">
                                                <Link to='/organization/holiday'>
                                                    <FontAwesomeIcon icon={faCalendar} />
                                                    <h4>Holiday Calender</h4>
                                                </Link>

                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="app-from-text">
                                                <h5>Employment Type:</h5>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="app-from-text">
                                                <h5>Employee Code:</h5>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="app-from-text">
                                                <h5>Employee Name:</h5>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="app-from-text">
                                                <h5>
                                                    Date Of Application:
                                                    <span>
                                                        <input
                                                            type="date"
                                                            name="date_of_application"
                                                            value={formData.date_of_application}
                                                            onChange={handleChange}
                                                            required
                                                            disabled
                                                        />
                                                    </span>
                                                </h5>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="leave-type">Leave type: </label>
                                                <select
                                                    name="leave_type_id"  // Changed to match formData key
                                                    id="leave-type"
                                                    value={formData.leave_type_id}
                                                    onChange={async (e) => {
                                                        const selectedLeaveTypeId = e.target.value;
                                                        handleChange(e);  // Update formData with the new value

                                                        if (!selectedLeaveTypeId) {
                                                            setLeaveInHand("");
                                                            return;
                                                        }
                                                        const balance = await fetchLeaveInHandData(token, selectedLeaveTypeId);
                                                        setLeaveInHand(balance);
                                                    }}>
                                                    <option value="">Select</option>  {/* Changed value from "#" to empty string */}
                                                    {leaveTypeData.map((leaveType) => (
                                                        <option key={leaveType.id} value={leaveType.id}>
                                                            {leaveType.leave_type_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="leave-in-hand">Leave In Hand </label>
                                                <input
                                                    type="text"
                                                    id="leave-in-hand"
                                                    value={leaveInHand}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="from-date">From Date: </label>
                                                <input
                                                    type="date"
                                                    name="from_date"
                                                    id="from-date"
                                                    value={formData.from_date}
                                                    onChange={(e) => {
                                                        const currentDate = new Date().toISOString().split('T')[0];
                                                        if (e.target.value < currentDate) {
                                                            toast.error("From Date cannot be earlier than today");
                                                            return;
                                                        }
                                                        if (formData.to_date && e.target.value > formData.to_date) {
                                                            toast.error("From Date cannot be later than To Date");
                                                            return;
                                                        }
                                                        handleChange(e);
                                                        const days = calculateDays(e.target.value, formData.to_date);
                                                        setFormData(prev => ({ ...prev, no_of_days: days }));
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="to-date">To Date</label>
                                                <input
                                                    type="date"
                                                    name="to_date"
                                                    id="to-date"
                                                    value={formData.to_date}
                                                    onChange={(e) => {
                                                        if (formData.from_date && e.target.value < formData.from_date) {
                                                            toast.error("To Date cannot be earlier than From Date");
                                                            return;
                                                        }
                                                        handleChange(e);
                                                        const days = calculateDays(formData.from_date, e.target.value);
                                                        setFormData(prev => ({ ...prev, no_of_days: days }));
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="no-of-days">No. Of Days</label>
                                                <input
                                                    type="number"
                                                    id="no-of-days"
                                                    value={formData.no_of_days}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="image">Supporting Document (Optional)</label>
                                                <input
                                                    type="file"
                                                    name="image"
                                                    id="image"
                                                    onChange={handleFileChange}
                                                    accept="image/*,.pdf"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="form-btn-group">
                                                <button type="submit" className="btn btn-apply" disabled={submitLoading}>
                                                    {submitLoading ? <DotLoader /> : ' Apply '}
                                                    <FontAwesomeIcon icon={faPlus} className="btn-icon" />
                                                </button>
                                                <button type="reset" className="btn btn-reset"
                                                    onClick={() => {
                                                        setFormData({
                                                            date_of_application: new Date().toISOString().split('T')[0],
                                                            leave_type_id: '',
                                                            from_date: '',
                                                            to_date: '',
                                                            no_of_days: '',
                                                            image: null
                                                        });
                                                        setLeaveInHand("")
                                                    }}>
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body">
                                <form onSubmit={handleDateFilterSubmit}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h4 className="card-title">
                                                <FontAwesomeIcon icon={faBraille} /> Leave Status
                                            </h4>
                                        </div>
                                        <div className="col-md-5 mt-4">
                                            <div className="form-group">
                                                <label htmlFor="from-date">From date</label>
                                                <input type="date"
                                                    className="form-control"
                                                    id="from-date"
                                                    onChange={(e) => setDateFilter(prev => ({ ...prev, fromDate: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-5 mt-4">
                                            <div className="form-group">
                                                <label htmlFor="to-date">To date</label>
                                                <input type="date"
                                                    className="form-control"
                                                    id="to-date"
                                                    onChange={(e) => setDateFilter(prev => ({ ...prev, toDate: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-2 mt-4 att-btn">
                                            <button
                                                className="btn btn-reset me-2"
                                                type="reset"
                                                onClick={() => {
                                                    setDateFilter({ fromDate: null, toDate: null });
                                                    setCurrentPage(1); // Reset to first page
                                                }}
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>



                <div class="row">
                    <div class="col-md-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between gap-2">
                                <h4 className="card-title m-0">
                                    <FontAwesomeIcon icon={faFile} className="me-2" />
                                    Leaves List
                                </h4>
                                <div className="card-export">
                                    <button className='btn btn-success me-2' onClick={exportToExcel} >
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
                                                <div className="dataTables_length" id="DataTables_Table_0_length">
                                                    <label>
                                                        Show {' '}
                                                        <select
                                                            name="DataTables_Table_0_length"
                                                            aria-controls="DataTables_Table_0"
                                                            className="form-select d-inline w-auto"
                                                            onChange={(e) => {
                                                                setCurrentPage(1);
                                                                setLeavesListPerPage(parseInt(e.target.value));
                                                            }}
                                                        >
                                                            {[5, 10, 20, 50, 100, 200, 500].map((num) => (
                                                                <option key={num} value={num}>{num}</option>
                                                            ))}
                                                        </select>{' '}
                                                        entries
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-6">
                                                <div style={{ position: 'relative' }}>

                                                    <input
                                                        type="text"
                                                        className="form-control "
                                                        placeholder="Search...."
                                                        value={searchTerm}
                                                        onChange={(e) => {
                                                            setCurrentPage(1);
                                                            setSearchTerm(e.target.value.toLowerCase());
                                                        }}
                                                    />
                                                    {searchTerm && (
                                                        <button
                                                            className="btn "
                                                            type="button"
                                                            style={{ position: 'absolute', right: '0', top: '0' }}
                                                            onClick={() => {
                                                                setCurrentPage(1);
                                                                setSearchTerm('');
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '20px' }} />
                                                        </button>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <table class="table table-striped custom-table leave-employee-table mb-0 datatable">
                                                    <thead>
                                                        <tr>
                                                            <th>Leave Type</th>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th>No of Days</th>
                                                            <th>Date Of Apply</th>
                                                            <th class="text-center">Status</th>
                                                            <th>Doc Image</th>
                                                            <th class="">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr>
                                                                <td colSpan="8" className="text-center">
                                                                    <div className="spinner-border text-primary" role="status">
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : currentLeaves.length > 0 ? (
                                                            currentLeaves.map((leave, index) => (
                                                                <tr key={index}>
                                                                    <td>{leave.type}</td>
                                                                    <td>{leave.from}</td>
                                                                    <td>{leave.to}</td>
                                                                    <td>{leave.days}</td>
                                                                    <td>{leave.dateOfApply}</td>
                                                                    <td className="text-center">
                                                                        <div className="action-label">
                                                                            <a className="btn btn-white btn-sm btn-rounded" href="javascript:void(0);">
                                                                                <FontAwesomeIcon icon={faCircleDot} className={leave.status.color} /> {leave.status.text}
                                                                            </a>
                                                                        </div>
                                                                    </td>
                                                                    <td className='use-modal'
                                                                        onClick={() => {
                                                                            setSelectedLeaveDoc(leave.docImage);
                                                                            setShowModal(true);
                                                                        }}>
                                                                        <h2 className="table-avatar">

                                                                            {leave.docImage ? (
                                                                                leave.docImage.endsWith('.pdf') || leave.docImage.includes('.pdf') ? (
                                                                                    <div className="document-icon">
                                                                                        <FontAwesomeIcon icon={faFilePdf} className="text-danger" size="2x" />
                                                                                        <span>PDF</span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <img
                                                                                        src={`https://skilledworkerscloud.co.uk/hrms-v2/public/storage/${leave.docImage}`}
                                                                                        alt="Document"
                                                                                        className="avatar text-center"
                                                                                        onError={(e) => {
                                                                                            e.target.onerror = null;
                                                                                            e.target.src = avatar9; // Fallback avatar if image fails to load
                                                                                        }}
                                                                                    />
                                                                                )
                                                                            ) : (
                                                                                <div className="document-icon">
                                                                                    <FontAwesomeIcon icon={faFile} className="text-muted" size="2x" />
                                                                                    <span>No Doc</span>
                                                                                </div>
                                                                            )}
                                                                        </h2>
                                                                    </td>
                                                                    <td className="text-end">
                                                                        <div className="dropdown dropdown-action dropstart">
                                                                            <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                                                                <FontAwesomeIcon icon={faEllipsisVertical} />
                                                                            </a>
                                                                            <div className="dropdown-menu dropdown-menu-right">
                                                                                <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_leave">
                                                                                    <FontAwesomeIcon icon={faPencil} /> Edit
                                                                                </a>
                                                                                <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_approve">
                                                                                    <FontAwesomeIcon icon={faTrashCan} className='w-5' /> Delete
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="8" className="text-center text-muted">No work updates available</td>
                                                            </tr>
                                                        )}

                                                    </tbody>

                                                </table>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="d-flex justify-content-between align-items-center mt-3 px-2">
                                                <div>
                                                    Showing {startIndex + 1}–{Math.min(endIndex, filteredLeavesList.length)} of {filteredLeavesList.length} leaves
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
            </div>

            <ModalCenter show={showModal} onHide={() => setShowModal(false)} docImage={selectedLeaveDoc} />



        </>

    )
}

export default Leaves
