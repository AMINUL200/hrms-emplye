import React, { useContext, useEffect, useState } from 'react';
import './EmployeeAttendance.css'
import { AuthContext } from '../../../context/AuthContex';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import PageLoader from '../../../component/loader/PageLoader';

const EmployeeAttendance = () => {
    const { token, data } = useContext(AuthContext);
    const api_url = import.meta.env.VITE_API_URL;
    const [location, setLocation] = useState({ latitude: '', longitude: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendanceType, setAttendanceType] = useState('check-in');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState('');
    const [breakStatus, setBreakStatus] = useState('');
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);
    const [showStartBreak, setShowStartBreak] = useState(false);
    const [showEndBreak, setShowEndBreak] = useState(false);

    const findGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude.toFixed(6),
                        longitude: position.coords.longitude.toFixed(6)
                    });
                },
                (err) => {
                    setError(err.message);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    }

    const getCurrentAttendanceStatus = async () => {
        try {
            const res = await axios.get(`${api_url}/attendance-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.status === 200 && res.data.flag === 1) {
                const status = res.data.data[0]?.punch_status || '';
                setAttendanceStatus(status);


                if (status === 'IN') {
                    await getBreakStatus();
                } else if (status === 'OUT') {
                    // toast.info('You have already checked out for today');
                }
            }
        } catch (error) {
            console.log(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    const getBreakStatus = async () => {
        try {
            const res = await axios.get(`${api_url}/break-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.status === 200 && res.data.flag === 1) {
                const status = res.data.data[0]?.punch_status || '';
                setBreakStatus(status);
            }
        } catch (error) {
            console.log(error.message);
            toast.error(error.message);
        }
    }


    useEffect(() => {
        findGeolocation();
        getCurrentAttendanceStatus();
    }, []);

    useEffect(() => {
        // Determine which buttons to show based on status
        if (attendanceStatus === '') {
            setShowCheckIn(true);
            setAttendanceType('check-in');
            setShowCheckOut(false);
            setShowStartBreak(false);
            setShowEndBreak(false);
        } else if (attendanceStatus === 'IN') {
            setShowCheckIn(false);
            setShowCheckOut(true);
            setAttendanceType('check-out');

            if (breakStatus === 'Break Start') {
                setShowStartBreak(false);
                setShowEndBreak(true);
            } else if (breakStatus === 'Break End' || breakStatus === '') {
                setShowStartBreak(true);
                setShowEndBreak(false);
            }
        } else if (attendanceStatus === 'OUT') {
            setShowCheckIn(false);
            setShowCheckOut(false);
            setShowStartBreak(false);
            setShowEndBreak(false);
            setAttendanceType('')
        }
    }, [attendanceStatus, breakStatus]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const now = new Date();

        if ((showCheckIn && attendanceType === 'check-in') || (showCheckOut && attendanceType === 'check-out')) {
            const attendanceData = {
                latitude: location.latitude,
                longitude: location.longitude,
                time: now.toLocaleTimeString('en-GB', { hour12: false }),
                date: now.toISOString().split('T')[0],
                punch_type: data?.punch_type,
            };

            console.log("login logout data ::", attendanceData);

            try {
                const res = await axios.post(`${api_url}/creat-attendance`,
                    attendanceData,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                console.log(res.data);

                if (res.status === 200 && res.data.flag === 1) {
                    toast.success(res.data.message);
                    getCurrentAttendanceStatus();
                } else {
                    toast.error(res.data.message)
                }

            } catch (error) {
                console.log(error.message);
                toast.error(error.message)
            } finally {
                setIsSubmitting(false);
            }


        } else if ((showStartBreak && attendanceType === 'break-start') || (showEndBreak && attendanceType === 'break-end')) {

            const attendanceData = {
                break_date: now.toISOString().split('T')[0],
                break_time: now.toLocaleTimeString('en-GB', { hour12: false }),
                break_latitude: location.latitude,
                break_longitude: location.longitude,
                punch_type: data?.punch_type,
            };
            console.log("break api call :: ", attendanceData);

            try {
                const res = await axios.post(`${api_url}/creat-break`,
                    attendanceData,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                if (res.data.status === 200 && res.data.flag === 1) {
                    toast.success(res.data.message);
                    getCurrentAttendanceStatus();
                } else {
                    toast.error(res.data.message)
                }

            } catch (error) {
                console.log(error.message);
                toast.error(error.message)
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const getButtonClass = (type) => {
        let buttonClass = "attendance-type-btn";
        if (type === 'check-in' && showCheckIn && attendanceType === 'check-in') buttonClass += " active-attendance-btn";
        if (type === 'check-out' && showCheckOut && attendanceType === 'check-out') buttonClass += " active-attendance-btn";
        if (type === 'break-start' && showStartBreak && attendanceType === 'break-start') buttonClass += " active-attendance-btn";
        if (type === 'break-end' && showEndBreak && attendanceType === 'break-end') buttonClass += " active-attendance-btn";
        return buttonClass;
    };

    if (loading) {
        return <PageLoader />
    }

    return (
        <div className="attendance-container">
            <div className="attendance-wrapper">
                <div className="attendance-card">
                    <div className="attendance-header">
                        <h2>Employee Attendance System</h2>
                        <p>Record your work status with location tracking</p>
                    </div>

                    <form onSubmit={handleSubmit} className="attendance-form">
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="form-content">
                            <div className="attendance-type-buttons">
                                {showCheckIn && (
                                    <button
                                        type="button"
                                        className={getButtonClass('check-in')}
                                        onClick={() => setAttendanceType('check-in')}
                                    >
                                        Check In
                                    </button>
                                )}
                                {showStartBreak && (
                                    <button
                                        type="button"
                                        className={getButtonClass('break-start')}
                                        onClick={() => setAttendanceType('break-start')}
                                    >
                                        Start Break
                                    </button>
                                )}
                                {showEndBreak && (
                                    <button
                                        type="button"
                                        className={getButtonClass('break-end')}
                                        onClick={() => setAttendanceType('break-end')}
                                    >
                                        End Break
                                    </button>
                                )}
                                {showCheckOut && (
                                    <button
                                        type="button"
                                        className={getButtonClass('check-out')}
                                        onClick={() => setAttendanceType('check-out')}
                                    >
                                        Check Out
                                    </button>
                                )}
                            </div>

                            <div className="location-fields">
                                <div className="location-field">
                                    <label>Latitude</label>
                                    <input
                                        type="text"
                                        value={location.latitude || 'Fetching...'}
                                        disabled
                                        className="location-input"
                                    />
                                </div>
                                <div className="location-field">
                                    <label>Longitude</label>
                                    <input
                                        type="text"
                                        value={location.longitude || 'Fetching...'}
                                        disabled
                                        className="location-input"
                                    />
                                </div>
                            </div>

                            <div className="time-fields">
                                <div className="time-field">
                                    <label>Current Date</label>
                                    <input
                                        type="text"
                                        value={new Date().toLocaleDateString()}
                                        disabled
                                        className="time-input"
                                    />
                                </div>
                                <div className="time-field">
                                    <label>Current Time</label>
                                    <input
                                        type="text"
                                        value={new Date().toLocaleTimeString()}
                                        disabled
                                        className="time-input"
                                    />
                                </div>
                                <div className="time-field">
                                    <label>Punch Type:</label>
                                    <input
                                        type="text"
                                        value={data?.punch_type}
                                        disabled
                                        className="time-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!location.latitude || isSubmitting || attendanceStatus === 'OUT'}
                            className={`submit-btn 
                                ${!location.latitude || isSubmitting ? 'disabled-btn' :
                                    attendanceStatus === 'OUT' ? 'danger-btn' : ''
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="spinner-container">
                                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : attendanceStatus === 'OUT' ? (
                                <span>Today Already have Check Out</span>
                            ) :
                                (
                                    `Record ${attendanceType.replace('-', ' ')}`
                                )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EmployeeAttendance;