import React, { useContext, useEffect, useState } from 'react';
import './EmployeeAttendance.css'
import { AuthContext } from '../../../context/AuthContex';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import PageLoader from '../../../component/loader/PageLoader';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    const [currentTime, setCurrentTime] = useState(new Date());

    // New state for timer
    const [workTime, setWorkTime] = useState('00:00:00');
    const [isWorking, setIsWorking] = useState(false);
    const [timerInterval, setTimerInterval] = useState(null);
    const [todayWorkTime, setTodayWorkTime] = useState('00:00:00');


    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer); // cleanup
    }, []);

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
                console.log("status: ", status);
                const dutyHours = res.data.data[0]?.duty_hours || '00:00:00';

                setAttendanceStatus(status);

                if (status === 'IN') {
                    await getBreakStatus();
                    // Start the timer if user is checked in but not on break
                    if (breakStatus !== 'Break Start') {
                        startTimer();
                    }
                } else if (status === 'OUT') {
                    stopTimer();
                    // Get today's total work time
                    // await getTodayWorkTime();
                    setTodayWorkTime(dutyHours)
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

                // Control timer based on break status
                if (status === 'Break Start') {
                    stopTimer();
                } else if (status === 'Break End' || status === '') {
                    startTimer();
                }
            }
        } catch (error) {
            console.log(error.message);
            toast.error(error.message);
        }
    }

  

    // Timer functions
    const startTimer = () => {
        setIsWorking(true);
        // In a real app, you would fetch the start time from your API
        // For demo, we'll start from 00:00:00
        let seconds = 0;
        const interval = setInterval(() => {
            seconds++;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            setWorkTime(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            );
        }, 1000);

        setTimerInterval(interval);
    };

    const stopTimer = () => {
        setIsWorking(false);
        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
    };

    const resetTimer = () => {
        stopTimer();
        setWorkTime('00:00:00');
    };

    useEffect(() => {
        findGeolocation();
        getCurrentAttendanceStatus();

        // Check if it's a new day and reset timer
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const timeUntilMidnight = tomorrow.getTime() - now.getTime();

        const midnightTimeout = setTimeout(() => {
            resetTimer();
            setTodayWorkTime('00:00:00');
        }, timeUntilMidnight);

        return () => {
            if (timerInterval) clearInterval(timerInterval);
            clearTimeout(midnightTimeout);
        };
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

            try {
                const res = await axios.post(`${api_url}/creat-attendance`,
                    attendanceData,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                console.log(res.data);

                if (res.status === 200 && res.data.flag === 1) {
                    toast.success(res.data.message);

                    if (attendanceType === 'check-in') {
                        startTimer();
                    } else if (attendanceType === 'check-out') {
                        stopTimer();
                        await getTodayWorkTime();
                    }

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

                    if (attendanceType === 'break-start') {
                        stopTimer();
                    } else if (attendanceType === 'break-end') {
                        startTimer();
                    }

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
        let buttonClass = "btn attendance-type-btn m-1";
        if (type === 'check-in' && showCheckIn && attendanceType === 'check-in') buttonClass += " btn-primary";
        if (type === 'check-out' && showCheckOut && attendanceType === 'check-out') buttonClass += " btn-danger";
        if (type === 'break-start' && showStartBreak && attendanceType === 'break-start') buttonClass += " btn-warning";
        if (type === 'break-end' && showEndBreak && attendanceType === 'break-end') buttonClass += " btn-info";
        return buttonClass;
    };

    if (loading) {
        return <PageLoader />
    }

    return (
        <div className="container-fluid py-4 attendance-container">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-header text-white text-center py-3">
                            <h2 className="mb-0">Employee Attendance System</h2>
                            <p className="mb-0">Record your work status with location tracking</p>
                        </div>

                        <div className="card-body p-4">
                            {/* Timer Display */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className={`card timer-card ${isWorking ? 'bg-success text-white' : 'bg-light'}`}>
                                        <div className="card-body text-center py-3">
                                            <h5 className="card-title">Today's Work Time</h5>
                                            <div className="display-4 fw-bold">{todayWorkTime}</div>
                                            <p className="mb-0">Total time worked today</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {attendanceStatus === 'IN' && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className={`card timer-card ${isWorking ? 'bg-info text-white' : 'bg-warning'}`}>
                                            <div className="card-body text-center py-3">
                                                <h5 className="card-title">Current Session</h5>
                                                <div className="display-4 fw-bold">{workTime}</div>
                                                <p className="mb-0">{isWorking ? 'Working...' : 'On Break'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <div className="alert alert-danger">
                                        <p className="mb-0">{error}</p>
                                    </div>
                                )}

                                <div className="d-flex flex-wrap justify-content-center mb-4">
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

                                <div className="text-center mb-4">
                                    <div className="row">
                                        <div className="col-12 col-md-6 mb-2">
                                            <strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}
                                        </div>
                                        <div className="col-12 col-md-6 mb-2">
                                            <strong>Time:</strong> {currentTime.toLocaleTimeString()}
                                        </div>
                                        {/* <div className="col-12 col-md-4 mb-2">
                                            <strong>Punch Type:</strong> {data?.punch_type}
                                        </div> */}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        disabled={!location.latitude || isSubmitting || attendanceStatus === 'OUT'}
                                        className={`btn btn-lg ${attendanceStatus === 'OUT' ? 'btn-secondary' : 'btn-primary'} px-5`}
                                        style={{ minWidth: '200px' }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Processing...
                                            </>
                                        ) : attendanceStatus === 'OUT' ? (
                                            <span>Already Checked Out</span>
                                        ) : (
                                            `Record ${attendanceType.replace('-', ' ')}`
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeAttendance;