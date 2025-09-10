import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContex';
import DotLoader from '../../../component/common/DotLoader';
import { toast } from 'react-toastify';
import Breadcrumb from '../../../component/common/Breadcrumb';

const LeaveApplication = () => {
    const { token, data } = useContext(AuthContext);
    const {
        fetchLeaveTypeData,
        leaveTypeData,
        fetchLeaveInHandData,
        calculateDays,
        leaveApply,
        fetchReamingLeave,
        remainingLeave
    } = useContext(EmployeeContext);

    const [leaveInHand, setLeaveInHand] = useState("");
    const [formData, setFormData] = useState({
        date_of_application: new Date().toISOString().split('T')[0],
        leave_type_id: '',
        from_date: '',
        to_date: '',
        no_of_days: '',
        image: null
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchLeaveTypeData(token, data.id, data.emid);
        fetchReamingLeave(token);
    }, [token]);

    const validateDates = () => {
        const currentDate = new Date().toISOString().split('T')[0];
        const fromDate = formData.from_date;
        const toDate = formData.to_date;

        if (fromDate && fromDate < currentDate) {
            toast.error("From Date cannot be earlier than today");
            return false;
        }

        if (fromDate && toDate && toDate < fromDate) {
            toast.error("To Date cannot be earlier than From Date");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateDates()) {
            return;
        }
        setSubmitLoading(true);

        try {
            const result = await leaveApply(token, formData);
            toast.success(result);
            setFormData({
                date_of_application: new Date().toISOString().split('T')[0],
                leave_type_id: '',
                from_date: '',
                to_date: '',
                no_of_days: '',
                image: null
            });
            setLeaveInHand("");
            fetchReamingLeave(token); // Refresh remaining leaves
        } catch (error) {
            console.log(error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    return (
        <>
            <div className='leaves-page'>
                <div className="row">
                    <Breadcrumb pageTitle="Leave Application" />
                </div>

                {/* Leave Remaining */}
                <div className="row">
                    {remainingLeave.map((leave, index) => (
                        <div className="col-md-3" key={leave.id}>
                            <div className="stats-info">
                                <h6>{leave.leave_type_name}</h6>
                                <h4>{leave.leave_in_hand}</h4>
                            </div>
                        </div>
                    ))}
                </div>
                
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
                                                    name="leave_type_id"
                                                    id="leave-type"
                                                    value={formData.leave_type_id}
                                                    onChange={async (e) => {
                                                        const selectedLeaveTypeId = e.target.value;
                                                        handleChange(e);

                                                        if (!selectedLeaveTypeId) {
                                                            setLeaveInHand("");
                                                            return;
                                                        }
                                                        const balance = await fetchLeaveInHandData(token, selectedLeaveTypeId);
                                                        setLeaveInHand(balance);
                                                    }}>
                                                    <option value="">Select</option>
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
            </div>
        </>
    );
};

export default LeaveApplication;