import { faEllipsisVertical, faFile, faFileExcel, faFilePdf, faPencil, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useMemo, useContext, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../component/common/Breadcrumb';
import { AuthContext } from '../../../context/AuthContex';
import { toast } from 'react-toastify';
import axios from 'axios';
import PageLoader from '../../../component/loader/PageLoader';

const WorkUpdate = () => {
    const navigate = useNavigate();
    const api_url = import.meta.env.VITE_API_URL;
    const storage_url = import.meta.env.VITE_STORAGE_URL;
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [rawWorkUpdateData, setRawWorkUpdateData] = useState([]);

    const fetchWorkUpdatesData = async () => {
        try {
            const response = await axios.get(`${api_url}/list-work-update`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.flag === 1) {
                setRawWorkUpdateData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching work updates:", error);
            toast.error(error?.response?.data?.message || "Failed to fetch work updates");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchWorkUpdatesData();
    }, []);

    const [workUpdatePerPage, setWorkUpdatePerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Transform API data to match expected format
    const transformedData = useMemo(() => {
        return rawWorkUpdateData.map(item => ({
            id: item.id,
            date: item.date,
            from: item.in_time,
            to: item.out_time,
            time: `${item.w_hours}h ${item.w_min}m`,
            remarks: item.remarks,
            comment: item.cmd || 'No comment'
        }));
    }, [rawWorkUpdateData]);

    // Sort by date (descending)
    const sortedWorkUpdate = useMemo(() => {
        return [...transformedData].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transformedData]);

    const filteredWorkUpdate = useMemo(() => {
        return sortedWorkUpdate.filter(item =>
            // item.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.comment.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedWorkUpdate, searchTerm]);

    const totalPages = Math.ceil(filteredWorkUpdate.length / workUpdatePerPage);
    const startIndex = (currentPage - 1) * workUpdatePerPage;
    const endIndex = startIndex + workUpdatePerPage;
    const currentWorkUpdate = filteredWorkUpdate.slice(startIndex, endIndex);

    // Export to Excel function
    const exportToExcel = () => {
        const exportData = currentWorkUpdate.map((item, index) => ({
            'SI No.': startIndex + index + 1,
            'Date': item.date,
            'From Time': item.from,
            'To Time': item.to,
            'Time': item.time,
            'Remarks': item.remarks,
            'Comment': item.comment
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Work Updates");

        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Work_Updates_${dateString}.xlsx`);
    };

    // Export to PDF function
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.setTextColor(40);
            doc.text('Daily Work Updates', 14, 15);

            const exportData = currentWorkUpdate.map((item, index) => [
                startIndex + index + 1,
                item.date,
                item.from,
                item.to,
                item.time,
                item.remarks,
                item.comment
            ]);

            autoTable(doc, {
                head: [['SI No.', 'Date', 'From Time', 'To Time', 'Time', 'Remarks', 'Comment']],
                body: exportData,
                startY: 25,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [34, 139, 34],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                }
            });

            const today = new Date();
            const dateString = today.toISOString().split('T')[0];
            doc.save(`Work_Updates_${dateString}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please check console for details.');
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className='work-update'>
            <div className="row justify-content-between align-items-center mb-3">
                <Breadcrumb pageTitle="Work Update" />
                <div style={{ width: 'fit-content' }}>
                    <Link to='/organization/add-work-update'>
                        <button className='btn btn-warning text-white'>
                            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1.3rem', marginRight: '9px' }} />
                            Add Daily Work Update
                        </button>
                    </Link>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between ">
                            <h4 className="card-title m-0">
                                <FontAwesomeIcon icon={faFile} className="me-2" />
                                Daily Work Update
                            </h4>
                            <div className="card-export">
                                <button className='btn btn-success me-2' onClick={exportToExcel}>
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
                                                <select
                                                    className="form-select d-inline w-auto"
                                                    value={workUpdatePerPage}
                                                    onChange={(e) => {
                                                        setCurrentPage(1);
                                                        setWorkUpdatePerPage(parseInt(e.target.value));
                                                    }}
                                                >
                                                    {[8, 10, 20, 50, 100].map((num) => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>{' '}
                                                entries
                                            </div>
                                        </div>
                                        <div className="col-sm-12 col-md-6">
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search remarks or comment..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setCurrentPage(1);
                                                        setSearchTerm(e.target.value);
                                                    }}
                                                />
                                                {searchTerm && (
                                                    <button
                                                        className="btn"
                                                        type="button"
                                                        style={{ position: 'absolute', right: '0', top: '0' }}
                                                        onClick={() => {
                                                            setCurrentPage(1);
                                                            setSearchTerm('');
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: '20px', transform: 'rotate(45deg)' }} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <table className="table table-striped custom-table work-update-table mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>SI No.</th>
                                                        <th>Date</th>
                                                        <th>From Time</th>
                                                        <th>To Time</th>
                                                        <th>Time</th>
                                                        <th className="text-center">Remarks</th>
                                                        <th>Comment</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentWorkUpdate.length > 0 ? (
                                                        currentWorkUpdate.map((item, index) => (
                                                            <tr key={item.id}>
                                                                <td>{startIndex + index + 1}</td>
                                                                <td>{item.date}</td>
                                                                <td>{item.from}</td>
                                                                <td>{item.to}</td>
                                                                <td>{item.time}</td>
                                                                <td className="text-center">{item.remarks}</td>
                                                                <td>{item.comment}</td>
                                                                <td className="text-end">
                                                                    <div className="dropdown dropdown-action dropstart">
                                                                        <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                                                            <FontAwesomeIcon icon={faEllipsisVertical} />
                                                                        </a>
                                                                        <div className="dropdown-menu dropdown-menu-left">
                                                                            <Link className="dropdown-item"
                                                                                to={`/organization/add-work-update?update=${item.id}`}
                                                                               
                                                                            >
                                                                                <FontAwesomeIcon icon={faPencil} /> Edit
                                                                            </Link>
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
                                                Showing {startIndex + 1}–{Math.min(endIndex, filteredWorkUpdate.length)} of {filteredWorkUpdate.length} work updates
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
    );
};

export default WorkUpdate;