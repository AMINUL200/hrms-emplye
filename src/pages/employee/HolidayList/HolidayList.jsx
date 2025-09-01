import { faFile, faFileExcel, faFilePdf, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../../../component/common/Breadcrumb'

const HolidayList = () => {
    const rawHolidayListData = [
        { id: 1, employeeName: "Alice Johnson", holidaySanctionAuthority: "HR Manager", holidayType: "Sick Leave", date: "2025-05-01", duration: "2 days", status: "Approved" },
        { id: 2, employeeName: "Bob Smith", holidaySanctionAuthority: "Team Lead", holidayType: "Casual Leave", date: "2025-04-28", duration: "1 day", status: "Pending" },
        { id: 3, employeeName: "Charlie Brown", holidaySanctionAuthority: "HR Manager", holidayType: "Earned Leave", date: "2025-04-25", duration: "5 days", status: "Rejected" },
        { id: 4, employeeName: "Diana Prince", holidaySanctionAuthority: "Department Head", holidayType: "Sick Leave", date: "2025-04-20", duration: "3 days", status: "Approved" },
        { id: 5, employeeName: "Ethan Hunt", holidaySanctionAuthority: "Manager", holidayType: "Annual Leave", date: "2025-04-15", duration: "10 days", status: "Approved" },
        { id: 6, employeeName: "Fiona Glenanne", holidaySanctionAuthority: "Team Lead", holidayType: "Casual Leave", date: "2025-04-12", duration: "1 day", status: "Pending" },
        { id: 7, employeeName: "George Bailey", holidaySanctionAuthority: "HR Manager", holidayType: "Emergency Leave", date: "2025-04-10", duration: "2 days", status: "Approved" },
        { id: 8, employeeName: "Hannah Wells", holidaySanctionAuthority: "Department Head", holidayType: "Sick Leave", date: "2025-04-08", duration: "4 days", status: "Approved" },
        { id: 9, employeeName: "Ivan Drago", holidaySanctionAuthority: "Supervisor", holidayType: "Casual Leave", date: "2025-04-05", duration: "1 day", status: "Rejected" },
        { id: 10, employeeName: "Jenna Maroney", holidaySanctionAuthority: "Team Lead", holidayType: "Earned Leave", date: "2025-04-03", duration: "7 days", status: "Approved" },
        { id: 11, employeeName: "Karl Urban", holidaySanctionAuthority: "Manager", holidayType: "Sick Leave", date: "2025-04-01", duration: "2 days", status: "Pending" },
        { id: 12, employeeName: "Lena Luthor", holidaySanctionAuthority: "Department Head", holidayType: "Annual Leave", date: "2025-03-28", duration: "3 days", status: "Approved" }
    ];




    const [holidayListPerPage, setHolidayListPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Sort by date (descending)
    const sortedHolidayList = useMemo(() => {
        return [...rawHolidayListData].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [rawHolidayListData]);

    const filteredHolidayList = useMemo(() => {
        return sortedHolidayList.filter(item =>
            item.holidaySanctionAuthority.toLowerCase().includes(searchTerm) ||
            item.holidayType.toLowerCase().includes(searchTerm)
        );
    }, [sortedHolidayList, searchTerm]);

    const totalPages = Math.ceil(filteredHolidayList.length / holidayListPerPage);
    const startIndex = (currentPage - 1) * holidayListPerPage;
    const endIndex = startIndex + holidayListPerPage;
    const currentHolidayListDate = filteredHolidayList.slice(startIndex, endIndex)

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className='holiday-list'>

            <div className="row justify-content-between align-items-center mb-3">
                <Breadcrumb pageTitle="Holiday List" />

                <div className="" style={{ width: 'fit-content' }}>
                    <Link to='/organization/holiday-apply'> <button className='btn btn-warning text-white'>
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1.3rem', marginRight: '9px' }} />
                        Holiday Apply
                    </button>
                    </Link>
                </div>
            </div>




            <div className="row">
                <div className="col-md-12">
                    <div className="card">

                        <div className="card-header d-flex justify-content-between gap-2">
                            <h4 className="card-title m-0">
                                <FontAwesomeIcon icon={faFile} className="me-2" />
                                Holiday Apply List
                            </h4>
                            <div className="card-export">
                                <button className='btn btn-success me-2' >
                                    <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                                    Export to Excel
                                </button>
                                <button className='btn btn-primary' >
                                    <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                                    Export to PDF
                                </button>
                            </div>
                        </div>
                        <div className="card-body">

                            <div className="table-responsive-ee">
                                <div className="dataTables_wrapper">
                                    <div className="row ">
                                        <div className="col-sm-12 col-md-6 ">
                                            <div>
                                                Show{' '}
                                                <select
                                                    className="form-select d-inline w-auto"
                                                    value={holidayListPerPage}
                                                    onChange={(e) => {
                                                        setCurrentPage(1);
                                                        setHolidayListPerPage(parseInt(e.target.value));
                                                    }}
                                                >
                                                    {[8, 10, 20, 50, 100].map((num) => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>{' '}
                                                entries
                                            </div>

                                        </div>
                                        <div className="col-sm-12 col-md-6 ">
                                            <div style={{ position: 'relative' }}>
                                                <input

                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search..."
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
                                            <table className="table table-striped custom-table holiday-list-table mb-0">
                                                <thead>
                                                    <tr role='row'>
                                                        <th>ID</th>
                                                        <th>Employee name</th>
                                                        <th>Holiday Sanction Authority</th>
                                                        <th>Holiday Type</th>
                                                        <th>Apply Date</th>
                                                        <th className="text-center">Duration</th>
                                                        <th className='text-center'>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentHolidayListDate.length > 0 ? (
                                                        currentHolidayListDate.map((item, index) => (
                                                            <tr key={item.id}>
                                                                <td>{item.id}</td>
                                                                <td>{item.employeeName}</td>
                                                                <td>{item.holidaySanctionAuthority}</td>
                                                                <td>{item.holidayType}</td>
                                                                <td>{item.date}</td>
                                                                <td className="text-center">{item.duration}</td>
                                                                <td className='text-center'>
                                                                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                                        {item.status}
                                                                    </span>
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
                                                Showing {startIndex + 1}–{Math.min(endIndex, sortedHolidayList.length)} of {sortedHolidayList.length} work updates
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
    )
}

export default HolidayList
