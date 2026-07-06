import React, { useState, useEffect, useContext, useRef } from "react";
import "./AttendanceOverview.css";
import {
  LogIn,
  LogOut,
  Coffee,
  Check,
  Clock,
  Calendar,
  MapPin,
  Play,
  Square,
  XCircle,
  ClipboardList,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContex";
import { getLocationName } from "../../utils/getLocationName";
import { calcDuration, parseAPITime } from "../../utils/calcDuration";

const AttendanceOverview = ({ variant = "attendance" }) => {
  const { token, data } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Location state
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [locationError, setLocationError] = useState(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Attendance status states
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [breakStatus, setBreakStatus] = useState("");
  const [punchInTime, setPunchInTime] = useState("--");
  const [punchOutTime, setPunchOutTime] = useState("--");
  const [breakDuration, setBreakDuration] = useState("--");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(false);

  // Store API times for calculations
  const [timeIn, setTimeIn] = useState(null);
  const [timeOut, setTimeOut] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [breakEndTime, setBreakEndTime] = useState(null);

  // Timer refs
  const workTimerIntervalRef = useRef(null);
  const breakTimerIntervalRef = useRef(null);

  // Work Timer state
  const [workTime, setWorkTime] = useState("00:00:00");
  const [totalWorkedSeconds, setTotalWorkedSeconds] = useState(0);

  // Break Timer state
  const [breakTime, setBreakTime] = useState("00:00:00");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0);

  // UI visibility states
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showStartBreak, setShowStartBreak] = useState(false);
  const [showEndBreak, setShowEndBreak] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Convert seconds to time string
  const secondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Location functions
  const findGeolocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
            });
            setLocationError(null);
            resolve({
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
            });
          },
          (err) => {
            let errorMessage = "";
            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMessage =
                  "Location permission denied. Please enable location access.";
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable.";
                break;
              case err.TIMEOUT:
                errorMessage = "Location request timed out.";
                break;
              default:
                errorMessage = "An error occurred while getting location.";
            }
            setLocationError(errorMessage);
            reject(errorMessage);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      } else {
        const errorMessage = "Geolocation is not supported by this browser.";
        setLocationError(errorMessage);
        reject(errorMessage);
      }
    });
  };

  const requestLocation = async () => {
    setIsRequestingLocation(true);
    try {
      const locationData = await findGeolocation();
      return locationData;
    } catch (error) {
      toast.error(error);
      return null;
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Work Timer functions
  const startWorkTimer = (initialSeconds = 0) => {
    if (workTimerIntervalRef.current) {
      clearInterval(workTimerIntervalRef.current);
    }

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

  // Get break status
  const getBreakStatus = async (checkInTime = timeIn) => {
    try {
      const res = await axios.get(`${api_url}/break-status`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() },
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

        if (apiBreakStart && apiBreakEnd) {
          const totalBreakSeconds = calcDuration(apiBreakStart, apiBreakEnd);
          setBreakDuration(secondsToTime(totalBreakSeconds));
        } else {
          setBreakDuration("--");
        }

        if (record.punch_status === "Break Start" && !apiBreakEnd) {
          setIsOnBreak(true);
          const workSecondsBeforeBreak = calcDuration(
            checkInTime,
            apiBreakStart,
          );
          setTotalWorkedSeconds(workSecondsBeforeBreak);
          setWorkTime(secondsToTime(workSecondsBeforeBreak));
          stopWorkTimer();

          const breakElapsed = calcDuration(apiBreakStart, new Date());
          startBreakTimer(breakElapsed);
        } else if (record.punch_status === "Break End" && apiBreakEnd) {
          setIsOnBreak(false);
          const totalBreakTime = calcDuration(apiBreakStart, apiBreakEnd);
          setBreakTime(secondsToTime(totalBreakTime));
          setTotalBreakSeconds(totalBreakTime);
          stopBreakTimer();

          const workBeforeBreak = calcDuration(checkInTime, apiBreakStart);
          const workAfterBreak = calcDuration(apiBreakEnd, new Date());
          const totalWorkSeconds = workBeforeBreak + workAfterBreak;

          startWorkTimer(totalWorkSeconds);
        }
      } else {
        setBreakStatus("");
        setIsOnBreak(false);
        stopBreakTimer();

        if (checkInTime && attendanceStatus === "IN") {
          const workedSeconds = calcDuration(checkInTime, new Date());
          startWorkTimer(workedSeconds);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Get current attendance status
  const getCurrentAttendanceStatus = async () => {
    try {
      const res = await axios.get(`${api_url}/attendance-status`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() },
      });

      if (
        res.data.status === 200 &&
        res.data.flag === 1 &&
        res.data.data.length > 0
      ) {
        const record = res.data.data[0];
        setAttendanceStatus(record.punch_status);
        setCheckedIn(record.punch_status === "IN");

        const apiTimeIn = parseAPITime(record.time_in);
        const apiTimeOut = record.time_out
          ? parseAPITime(record.time_out)
          : null;
        setTimeIn(apiTimeIn);
        setTimeOut(apiTimeOut);

        if (record.time_in) {
          setPunchInTime(record.time_in);
        }
        if (record.time_out) {
          setPunchOutTime(record.time_out);
        } else {
          setPunchOutTime("--");
        }

        if (record.punch_status === "IN") {
          await getBreakStatus(apiTimeIn);
        } else if (record.punch_status === "OUT") {
          const workedSeconds = calcDuration(apiTimeIn, apiTimeOut);
          setTotalWorkedSeconds(workedSeconds);
          setWorkTime(secondsToTime(workedSeconds));
          stopWorkTimer();
          stopBreakTimer();
          // Show break time returned from API
          if (record.break_hours) {
            setBreakTime(record.break_hours);
            setBreakDuration(record.break_hours);
          } else {
            setBreakTime("00:00:00");
            setBreakDuration("00:00:00");
          }
        } else {
          resetWorkTimer();
        }
      } else {
        resetWorkTimer();
        setPunchInTime("--");
        setPunchOutTime("--");
        setBreakDuration("--");
        setCheckedIn(false);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submit
  const handleSubmit = async (actionType) => {
    if (!location.latitude || !location.longitude) {
      toast.error("Please enable location access");
      await requestLocation();
      return;
    }

    setIsSubmitting(true);
    const now = new Date();

    try {
      // Check-in or Check-out
      if (actionType === "check-in" || actionType === "check-out") {
        const locationName = await getLocationName(
          location.latitude,
          location.longitude,
        );
        const attendanceData = {
          latitude: location.latitude,
          longitude: location.longitude,
          time: now.toLocaleTimeString("en-GB", { hour12: false }),
          date: now.toISOString().split("T")[0],
          punch_type: data?.punch_type,
          location: locationName,
        };

        const res = await axios.post(
          `${api_url}/creat-attendance`,
          attendanceData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.status === 200 && res.data.flag === 1) {
          toast.success(res.data.message);

          if (actionType === "check-in") {
            startWorkTimer(0);
          } else if (actionType === "check-out") {
            stopWorkTimer();
            stopBreakTimer();
          }

          await getCurrentAttendanceStatus();
        } else {
          toast.error(res.data.message);
        }
      }

      // Break Start or Break End
      else if (actionType === "break-start" || actionType === "break-end") {
        const locationName = await getLocationName(
          location.latitude,
          location.longitude,
        );
        const breakData = {
          break_date: now.toISOString().split("T")[0],
          break_time: now.toLocaleTimeString("en-GB", { hour12: false }),
          break_latitude: location.latitude,
          break_longitude: location.longitude,
          punch_type: data?.punch_type,
          break_location: locationName,
        };

        const res = await axios.post(`${api_url}/creat-break`, breakData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 200 && res.data.flag === 1) {
          toast.success(res.data.message);

          if (actionType === "break-start") {
            stopWorkTimer();
            startBreakTimer(0);
          } else if (actionType === "break-end") {
            stopBreakTimer();
          }

          await getBreakStatus();
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await requestLocation();
      await getCurrentAttendanceStatus();
    };

    initializeData();

    return () => {
      if (workTimerIntervalRef.current)
        clearInterval(workTimerIntervalRef.current);
      if (breakTimerIntervalRef.current)
        clearInterval(breakTimerIntervalRef.current);
    };
  }, []);

  // Update UI based on status
  useEffect(() => {
    if (attendanceStatus === "") {
      setShowCheckIn(true);
      setShowCheckOut(false);
      setShowStartBreak(false);
      setShowEndBreak(false);
    } else if (attendanceStatus === "IN") {
      setShowCheckIn(false);
      setShowCheckOut(true);
      setCheckedIn(true);
      if (breakStatus === "Break Start") {
        setShowStartBreak(false);
        setShowEndBreak(true);
      } else {
        setShowStartBreak(true);
        setShowEndBreak(false);
      }
    } else if (attendanceStatus === "OUT") {
      setShowCheckIn(false);
      setShowCheckOut(false);
      setShowStartBreak(false);
      setShowEndBreak(false);
      setCheckedIn(false);
    }
  }, [attendanceStatus, breakStatus]);

  // Get button disabled state
  const isButtonDisabled =
    !location.latitude ||
    isSubmitting ||
    attendanceStatus === "OUT" ||
    locationError;

  /* =========================================================================
     SHARED UI PIECES
     These are rendered as functions (not separate components) so they keep
     direct access to state/handlers above without any prop drilling or
     duplicated logic. Both variants call the *same* functions below -
     only the surrounding layout/wrapper markup differs.
     ========================================================================= */

  // The 3 summary tiles (Check In / Check Out / Break Time) - identical in both variants
  const renderTiles = () => (
    <div
      className={`att-tiles-row ${
        variant === "dashboard" ? "dashboard-tiles" : "attendance-tiles"
      }`}
    >
      <div className="att-tile att-tile--checkin">
        <div className="att-tile-icon">
          <LogIn size={20} />
        </div>
        <div className="att-tile-info">
          <span className="att-tile-label">Check In</span>
          <span className="att-tile-value">{punchInTime}</span>
        </div>
        <span className="att-tile-badge">
          <Check size={13} strokeWidth={3} />
          {attendanceStatus === "IN" ? "Checked In" : "Not Checked"}
        </span>
      </div>

      <div className="att-tile att-tile--checkout">
        <div className="att-tile-icon">
          <LogOut size={20} />
        </div>
        <div className="att-tile-info">
          <span className="att-tile-label">Check Out</span>
          <span className="att-tile-value">{punchOutTime}</span>
        </div>
        <span
          className={`att-tile-badge ${attendanceStatus === "OUT" ? "" : "att-tile-badge--muted"}`}
        >
          {attendanceStatus === "OUT" ? "Completed" : "Pending"}
        </span>
      </div>

      <div className="att-tile att-tile--break">
        <div className="att-tile-icon">
          <Coffee size={20} />
        </div>
        <div className="att-tile-info">
          <span className="att-tile-label">Break Time</span>
          <span className="att-tile-value">{breakTime}</span>
        </div>
        <span
          className={`att-tile-badge ${isOnBreak ? "" : "att-tile-badge--muted"}`}
        >
          {isOnBreak ? "On Break" : "No Break"}
        </span>
      </div>
    </div>
  );

  // Action buttons (Start Break / End Break / Check Out / Check In) - shared handlers, no duplication
  const renderActionButtons = () => (
    <>
      {showStartBreak && (
        <button
          type="button"
          className="att-btn att-btn--start-break"
          onClick={() => handleSubmit("break-start")}
          disabled={isButtonDisabled}
        >
          <Play size={14} fill="currentColor" />
          Start Break
        </button>
      )}

      {showEndBreak && (
        <button
          type="button"
          className="att-btn att-btn--end-break"
          onClick={() => handleSubmit("break-end")}
          disabled={isButtonDisabled}
        >
          <Square size={13} />
          End Break
        </button>
      )}

      {showCheckOut && !showEndBreak && (
        <button
          type="button"
          className="att-btn att-btn--checkout"
          onClick={() => handleSubmit("check-out")}
          disabled={isButtonDisabled}
        >
          <XCircle size={14} />
          Check Out
        </button>
      )}

      {showCheckIn && (
        <button
          type="button"
          className="att-btn att-btn--start-break"
          style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
          onClick={() => handleSubmit("check-in")}
          disabled={isButtonDisabled}
        >
          <LogIn size={14} />
          Check In
        </button>
      )}
    </>
  );

  // Info chips (Date / Time / Location) - identical data in both variants
  const renderInfoChips = () => (
    <>
      <div className="att-info-chip">
        <span className="att-info-chip-icon att-info-chip-icon--date">
          <Calendar size={15} />
        </span>
        <div className="att-info-chip-text">
          <span className="att-info-chip-label">Date</span>
          <span className="att-info-chip-value">
            {new Date().toLocaleDateString("en-GB")}
          </span>
        </div>
      </div>

      <div className="att-info-chip">
        <span className="att-info-chip-icon att-info-chip-icon--time">
          <Clock size={15} />
        </span>
        <div className="att-info-chip-text">
          <span className="att-info-chip-label">Time</span>
          <span className="att-info-chip-value">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="att-info-chip">
        <span className="att-info-chip-icon att-info-chip-icon--location">
          <MapPin size={15} />
        </span>
        <div className="att-info-chip-text">
          <span className="att-info-chip-label">Location</span>
          <span
            className={`att-info-chip-value ${location.latitude ? "att-info-chip-value--success" : ""}`}
          >
            {location.latitude ? "Location available" : "Location required"}
          </span>
        </div>
      </div>
    </>
  );

  // Record Break / Check In / Check Out big CTA button - attendance variant only
  const renderRecordButton = () => (
    <div className="att-record-break-wrapper">
      {showStartBreak && (
        <button
          type="button"
          className="att-record-break-btn"
          onClick={() => handleSubmit("break-start")}
          disabled={isButtonDisabled}
        >
          <MapPin size={15} />
          Record Break Start
        </button>
      )}
      {showEndBreak && (
        <button
          type="button"
          className="att-record-break-btn"
          style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}
          onClick={() => handleSubmit("break-end")}
          disabled={isButtonDisabled}
        >
          <MapPin size={15} />
          Record Break End
        </button>
      )}
      {showCheckIn && (
        <button
          type="button"
          className="att-record-break-btn"
          style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
          onClick={() => handleSubmit("check-in")}
          disabled={isButtonDisabled}
        >
          <MapPin size={15} />
          Record Check In
        </button>
      )}
      {showCheckOut && !showStartBreak && !showEndBreak && (
        <button
          type="button"
          className="att-record-break-btn"
          style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)" }}
          onClick={() => handleSubmit("check-out")}
          disabled={isButtonDisabled}
        >
          <MapPin size={15} />
          Record Check Out
        </button>
      )}
    </div>
  );

  // Show loader while loading - shared between both variants
  if (isLoading) {
    return (
      <div className="att-overview-card">
        <div className="att-overview-heading">
          <ClipboardList size={18} className="att-heading-icon" />
          <h2>Today&apos;s Attendance Overview</h2>
        </div>
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  /* =========================================================================
     LAYOUT - only this part differs between variants. Both branches reuse
     the exact same render functions defined above, so there is zero
     duplication of API calls, state, or business logic.
     ========================================================================= */

  return (
    <div className="att-overview-card">
      {/* Section heading - shared */}
      <div className="att-overview-heading">
        <ClipboardList size={18} className="att-heading-icon" />
        <h2>Today&apos;s Attendance Overview</h2>
      </div>

      {/* Top 3 status tiles - shared */}
      {renderTiles()}

      {variant === "dashboard" ? (
        <div className="dashboard-layout">
          {/* Row 1: action buttons only */}
          <div className="dashboard-buttons">{renderActionButtons()}</div>

          {/* Row 2: info cards only */}
          <div className="dashboard-info-row">{renderInfoChips()}</div>

          {/* No Record Break button on the dashboard variant */}
        </div>
      ) : (
        <div className="attendance-layout">
          {/* Buttons + info cards in the same row - unchanged original layout */}
          <div className="att-actions-row">
            {renderActionButtons()}
            {renderInfoChips()}
          </div>

          {/* Record break / check-in / check-out CTA button */}
          {renderRecordButton()}
        </div>
      )}
    </div>
  );
};

export default AttendanceOverview;
