import React, { useContext, useEffect, useState, useRef } from "react";
import "./EmployeeAttendance.css";
import { AuthContext } from "../../../context/AuthContex";
import { EmployeeContext } from "../../../context/EmployeeContext";
import { toast } from "react-toastify";
import axios from "axios";
import PageLoader from "../../../component/loader/PageLoader";
import "bootstrap/dist/css/bootstrap.min.css";
import { calcDuration, parseAPITime } from "../../../utils/calcDuration";
import { getLocationName } from "../../../utils/getLocationName";

const EmployeeAttendance = () => {
  const { token, data } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceType, setAttendanceType] = useState("check-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [breakStatus, setBreakStatus] = useState("");
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showStartBreak, setShowStartBreak] = useState(false);
  const [showEndBreak, setShowEndBreak] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Store API times for calculations
  const [timeIn, setTimeIn] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [breakEndTime, setBreakEndTime] = useState(null);

  // Use refs for intervals to access latest values in cleanup
  const workTimerIntervalRef = useRef(null);
  const breakTimerIntervalRef = useRef(null);

  // Work Timer state
  const [workTime, setWorkTime] = useState("00:00:00");
  const [isWorking, setIsWorking] = useState(false);
  const [todayWorkTime, setTodayWorkTime] = useState("00:00:00");
  const [totalWorkedSeconds, setTotalWorkedSeconds] = useState(0);

  // Break Timer state
  const [breakTime, setBreakTime] = useState("00:00:00");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const findGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
        },
        (err) => {
          setError(err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  // Convert seconds to time string (always returns "HH:MM:SS" format)
  const secondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getCurrentAttendanceStatus = async () => {
    try {
      const res = await axios.get(`${api_url}/attendance-status`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          t: Date.now(), // prevent caching
        },
      });

      if (
        res.data.status === 200 &&
        res.data.flag === 1 &&
        res.data.data.length > 0
      ) {
        const record = res.data.data[0];
        setAttendanceStatus(record.punch_status);

        const apiTimeIn = parseAPITime(record.time_in);
        const apiTimeOut = record.time_out
          ? parseAPITime(record.time_out)
          : null;
        setTimeIn(apiTimeIn);

        if (record.punch_status === "IN") {
          // User is checked in - get break status first, then calculate work time
          await getBreakStatus(apiTimeIn);
        } else if (record.punch_status === "OUT") {
          // User has checked out - freeze work timer at total worked time
          const workedSeconds = calcDuration(apiTimeIn, apiTimeOut);
          setTotalWorkedSeconds(workedSeconds);
          setWorkTime(secondsToTime(workedSeconds));
          setTodayWorkTime(secondsToTime(workedSeconds));
          stopWorkTimer();
          stopBreakTimer();
        } else {
          // Not checked in yet
          resetWorkTimer();
        }
      } else {
        // No attendance record found
        resetWorkTimer();
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getBreakStatus = async (checkInTime = timeIn) => {
    try {
      const res = await axios.get(`${api_url}/break-status`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          t: Date.now(), // prevent caching
        },
      });

      if (
        res.data.status === 200 &&
        res.data.flag === 1 &&
        res.data.data.length > 0
      ) {
        const record = res.data.data[0];
        setBreakStatus(record.punch_status);

        const apiBreakStart = parseAPITime(record.break_time_start);
        const apiBreakEnd = record.break_time_end
          ? parseAPITime(record.break_time_end)
          : null;

        setBreakStartTime(apiBreakStart);
        setBreakEndTime(apiBreakEnd);

        if (record.punch_status === "Break Start" && !apiBreakEnd) {
          // Currently on break
          setIsOnBreak(true);

          // Calculate and freeze work time from check-in to break start
          const workSecondsBeforeBreak = calcDuration(
            checkInTime,
            apiBreakStart
          );
          setTotalWorkedSeconds(workSecondsBeforeBreak);
          setWorkTime(secondsToTime(workSecondsBeforeBreak));
          stopWorkTimer();

          // Start live break timer
          const breakElapsed = calcDuration(apiBreakStart, new Date());
          startBreakTimer(breakElapsed);
        } else if (record.punch_status === "Break End" && apiBreakEnd) {
          // Break has ended
          setIsOnBreak(false);

          // Calculate total break time and freeze it
          const totalBreakTime = calcDuration(apiBreakStart, apiBreakEnd);
          setBreakTime(secondsToTime(totalBreakTime));
          setTotalBreakSeconds(totalBreakTime);
          stopBreakTimer();

          // Calculate work time: (check-in to break-start) + (break-end to now)
          const workBeforeBreak = calcDuration(checkInTime, apiBreakStart);
          const workAfterBreak = calcDuration(apiBreakEnd, new Date());
          const totalWorkSeconds = workBeforeBreak + workAfterBreak;

          startWorkTimer(totalWorkSeconds);
        }
      } else {
        // No break record found - normal work time calculation
        setBreakStatus("");
        setIsOnBreak(false);
        stopBreakTimer();

        if (checkInTime && attendanceStatus === "IN") {
          // Calculate work time from check-in to now
          const workedSeconds = calcDuration(checkInTime, new Date());
          startWorkTimer(workedSeconds);
        }
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  // Work Timer functions
  const startWorkTimer = (initialSeconds = 0) => {
    // Stop any existing work timer first
    if (workTimerIntervalRef.current) {
      clearInterval(workTimerIntervalRef.current);
    }

    setIsWorking(true);
    setTotalWorkedSeconds(initialSeconds);
    setWorkTime(secondsToTime(initialSeconds));

    const interval = setInterval(() => {
      setTotalWorkedSeconds((prev) => {
        const newSeconds = prev + 1;
        setWorkTime(secondsToTime(newSeconds));
        return newSeconds;
      });
    }, 1000);

    workTimerIntervalRef.current = interval;
  };

  const stopWorkTimer = () => {
    setIsWorking(false);
    if (workTimerIntervalRef.current) {
      clearInterval(workTimerIntervalRef.current);
      workTimerIntervalRef.current = null;
    }
  };

  const resetWorkTimer = () => {
    stopWorkTimer();
    setWorkTime("00:00:00");
    setTotalWorkedSeconds(0);
  };

  // Break Timer functions
  const startBreakTimer = (initialSeconds = 0) => {
    // Stop any existing break timer first
    if (breakTimerIntervalRef.current) {
      clearInterval(breakTimerIntervalRef.current);
    }

    setIsOnBreak(true);
    setTotalBreakSeconds(initialSeconds);
    setBreakTime(secondsToTime(initialSeconds));

    const interval = setInterval(() => {
      setTotalBreakSeconds((prev) => {
        const newSeconds = prev + 1;
        setBreakTime(secondsToTime(newSeconds));
        return newSeconds;
      });
    }, 1000);

    breakTimerIntervalRef.current = interval;
  };

  const stopBreakTimer = () => {
    setIsOnBreak(false);
    if (breakTimerIntervalRef.current) {
      clearInterval(breakTimerIntervalRef.current);
      breakTimerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    findGeolocation();
    getCurrentAttendanceStatus();

    // Cleanup on unmount
    return () => {
      if (workTimerIntervalRef.current)
        clearInterval(workTimerIntervalRef.current);
      if (breakTimerIntervalRef.current)
        clearInterval(breakTimerIntervalRef.current);
    };
  }, []);

  // Update UI based on attendance and break status
  useEffect(() => {
    if (attendanceStatus === "") {
      setShowCheckIn(true);
      setAttendanceType("check-in");
      setShowCheckOut(false);
      setShowStartBreak(false);
      setShowEndBreak(false);
    } else if (attendanceStatus === "IN") {
      setShowCheckIn(false);
      setShowCheckOut(true);

      if (breakStatus === "Break Start") {
        setShowStartBreak(false);
        setShowEndBreak(true);
        setAttendanceType("break-end");
      } else {
        setShowStartBreak(true);
        setShowEndBreak(false);
        setAttendanceType("break-start");
      }
    } else if (attendanceStatus === "OUT") {
      setShowCheckIn(false);
      setShowCheckOut(false);
      setShowStartBreak(false);
      setShowEndBreak(false);
      setAttendanceType("");
    }
  }, [attendanceStatus, breakStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const now = new Date();

    if (attendanceType === "check-in" || attendanceType === "check-out") {
      // Add location name only when needed
      const locationName = await getLocationName(
        location.latitude,
        location.longitude
      );
      let attendanceData = {
        latitude: location.latitude,
        longitude: location.longitude,
        time: now.toLocaleTimeString("en-GB", { hour12: false }),
        date: now.toISOString().split("T")[0],
        punch_type: data?.punch_type,
        location: locationName,
      };

      console.log(attendanceData);

      try {
        const res = await axios.post(
          `${api_url}/creat-attendance`,
          attendanceData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 200 && res.data.flag === 1) {
          toast.success(res.data.message);

          if (attendanceType === "check-in") {
            // Start work timer from 0 for new check-in
            startWorkTimer(0);
          } else if (attendanceType === "check-out") {
            // Stop both timers
            stopWorkTimer();
            stopBreakTimer();
          }

          // Refresh attendance status
          await getCurrentAttendanceStatus();
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setIsSubmitting(false);
      }
    } else if (
      attendanceType === "break-start" ||
      attendanceType === "break-end"
    ) {
      // Add location name only when needed
      const locationName = await getLocationName(
        location.latitude,
        location.longitude
      );

      const attendanceData = {
        break_date: now.toISOString().split("T")[0],
        break_time: now.toLocaleTimeString("en-GB", { hour12: false }),
        break_latitude: location.latitude,
        break_longitude: location.longitude,
        punch_type: data?.punch_type,
        break_location: locationName,
      };

      console.log(attendanceData);

      try {
        const res = await axios.post(`${api_url}/creat-break`, attendanceData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 200 && res.data.flag === 1) {
          toast.success(res.data.message);

          if (attendanceType === "break-start") {
            // Freeze work timer at current time and start break timer
            stopWorkTimer();
            startBreakTimer(0);
          } else if (attendanceType === "break-end") {
            // Stop break timer and resume work timer
            stopBreakTimer();
            // Work timer will be recalculated when getBreakStatus is called
          }

          // Refresh status to get updated break information
          await getBreakStatus();
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getButtonClass = (type) => {
    let buttonClass = "btn attendance-type-btn m-1";
    if (type === "check-in" && showCheckIn && attendanceType === "check-in")
      buttonClass += " btn-primary";
    if (type === "check-out" && showCheckOut && attendanceType === "check-out")
      buttonClass += " btn-danger";
    if (
      type === "break-start" &&
      showStartBreak &&
      attendanceType === "break-start"
    )
      buttonClass += " btn-warning";
    if (type === "break-end" && showEndBreak && attendanceType === "break-end")
      buttonClass += " btn-info";
    return buttonClass;
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="attendance-container">
      <div className="row justify-content-center">
        <div className="col-12 p-0 ">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white text-center py-3">
              <h2 className="mb-0 mx-auto"> Attendance </h2>
            </div>

            <div className="card-body p-4">
              {/* Timer Display */}
              {/* <div className="row mb-4">
                                <div className="col-12">
                                    <div className={`card timer-card ${attendanceStatus === 'OUT'
                                        ? 'bg-secondary text-white'
                                        : isWorking
                                            ? 'bg-success text-white'
                                            : isOnBreak
                                                ? 'bg-warning'
                                                : 'bg-warning'
                                        }`}>
                                        <div className="card-body text-center py-3">
                                            <h5 className="card-title">Work Time</h5>

                                            <div className="display-4 fw-bold">
                                                {attendanceStatus === 'OUT'
                                                    ? todayWorkTime
                                                    : workTime}
                                            </div>

                                            <p className="mb-0">
                                                {attendanceStatus === 'OUT'
                                                    ? "Day Complete - Total Time"
                                                    : attendanceStatus === 'IN'
                                                        ? (isOnBreak ? "Work Timer Paused" : "Working...")
                                                        : "Ready to Start"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

              {/* Break Timer Display - Show when on break or break has ended */}
              {/* {(isOnBreak || (breakStatus === 'Break End' && breakTime !== '00:00:00')) && ( */}
              {/* {isOnBreak && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className={`card timer-card ${isOnBreak ? 'bg-danger text-white' : 'bg-info text-white'}`}>
                                            <div className="card-body text-center py-3">
                                                <h5 className="card-title">Break Time</h5>
                                                <div className="display-4 fw-bold">
                                                    {breakTime}
                                                </div>
                                                <p className="mb-0">
                                                    {isOnBreak ? "Currently on Break" : "Break Completed"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )} */}

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
                      className={getButtonClass("check-in")}
                      onClick={() => setAttendanceType("check-in")}
                    >
                      Check In
                    </button>
                  )}
                  {showStartBreak && (
                    <button
                      type="button"
                      className={getButtonClass("break-start")}
                      onClick={() => setAttendanceType("break-start")}
                    >
                      Start Break
                    </button>
                  )}
                  {showEndBreak && (
                    <button
                      type="button"
                      className={getButtonClass("break-end")}
                      onClick={() => setAttendanceType("break-end")}
                    >
                      End Break
                    </button>
                  )}
                  {showCheckOut && !showEndBreak && (
                    <button
                      type="button"
                      className={getButtonClass("check-out")}
                      onClick={() => setAttendanceType("check-out")}
                    >
                      Check Out
                    </button>
                  )}
                </div>

                <div className="text-center mb-4">
                  <div className="row">
                    <div className="col-12 col-md-6 mb-2">
                      <strong>Date:</strong>{" "}
                      {new Date().toLocaleDateString("en-GB")}
                    </div>
                    <div className="col-12 col-md-6 mb-2">
                      <strong>Time:</strong> {currentTime.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={
                      !location.latitude ||
                      isSubmitting ||
                      attendanceStatus === "OUT"
                    }
                    className={`btn btn-lg ${
                      attendanceStatus === "OUT"
                        ? "btn-secondary"
                        : "btn-primary"
                    } px-5`}
                    style={{ minWidth: "200px" }}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Processing...
                      </>
                    ) : attendanceStatus === "OUT" ? (
                      <span>Day Complete</span>
                    ) : (
                      `Record ${attendanceType.replace("-", " ")}`
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
};

export default EmployeeAttendance;
