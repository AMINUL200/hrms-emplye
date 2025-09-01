import { faPlus, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import Breadcrumb from '../../../component/common/Breadcrumb';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContex';
import DotLoader from '../../../component/common/DotLoader';

const HolidayApply = () => {
    const { token } = useContext(AuthContext)
    const { fetchHolidayTypeData, holidayTypeData, holidayApply } = useContext(EmployeeContext)
    const [leaveType, setLeaveType] = useState('day'); // 'day' or 'hour'
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        holiday_type_id: '',
        leave_type: 'day',
        from_date: '',
        no_of_days: 0,
        no_of_hours: 1,
        reason: ''
    });

    const handleLeaveTypeChange = (e) => {
        const newLeaveType = e.target.value;
        setLeaveType(newLeaveType);
        setFormData({ ...formData, leave_type: newLeaveType });
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        fetchHolidayTypeData(token)
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSend = {
                holiday_type_id: formData.holiday_type_id,
                leave_type: formData.leave_type,
                from_date: formData.from_date,
                no_of_days: formData.leave_type === 'day' ? formData.no_of_days : 0,
                no_of_hours: formData.leave_type === 'hour' ? formData.no_of_hours : 0,
                reason: formData.reason
            };

            const response = await holidayApply(token, dataToSend);
            console.log("response:", response);

        } catch (error) {
            console.log(error);

        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="holiday-apply mt-4">

            <div className="row">
                <Breadcrumb pageTitle="Holiday Apply" />
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">
                                <FontAwesomeIcon icon={faUser} />
                                Holiday Apply
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-12 col-lg-12">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="Holiday-type">Holiday type: </label>
                                                    <select name="holiday_type_id"  // Changed from "Holiday-type" to match state
                                                        id="holiday_type_id"
                                                        value={formData.holiday_type_id}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {holidayTypeData.map((holidayType) => (
                                                            <option value={holidayType.id} key={holidayType.id}>
                                                                {holidayType.holiday_type_name}
                                                            </option>
                                                        ))}

                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Leave Type: </label>
                                                    <div className="checkbox-group">
                                                        <label className="checkbox-container">
                                                            <input
                                                                type="radio"
                                                                name="leaveType"
                                                                value="day"
                                                                checked={leaveType === 'day'}
                                                                onChange={handleLeaveTypeChange}
                                                            />
                                                            Day Wise
                                                        </label>
                                                        <label className="checkbox-container">
                                                            <input
                                                                type="radio"
                                                                name="leaveType"
                                                                value="hour"
                                                                checked={leaveType === 'hour'}
                                                                onChange={handleLeaveTypeChange}
                                                            />
                                                            Hourly Wise
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="from-date"> From Date: </label>
                                                    <input
                                                        type="date"
                                                        name="from_date"
                                                        id="from_date"
                                                        value={formData.from_date}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor={leaveType === 'day' ? 'no_of_days' : 'no_of_hours'}>
                                                        {leaveType === 'day' ? 'Number Of Days' : 'Number Of Hours'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name={leaveType === 'day' ? 'no_of_days' : 'no_of_hours'}
                                                        id={leaveType === 'day' ? 'no_of_days' : 'no_of_hours'}
                                                        min={leaveType === 'day' ? 0.5 : 1}
                                                        step={leaveType === 'day' ? 0.5 : 1}
                                                        value={leaveType === 'day' ? formData.no_of_days : formData.no_of_hours}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label htmlFor="reason">Reason: </label>
                                                    <textarea
                                                        name="reason"
                                                        id="reason"
                                                        value={formData.reason}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-btn-group">
                                                    <button type="submit" className="btn btn-apply" disabled={loading}>
                                                        {loading ? <DotLoader /> : 'Apply'}
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
            </div>

        </div>
    )
}

export default HolidayApply
