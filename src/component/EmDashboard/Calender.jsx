import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContex";
import "./EmCalender.css";

const EmCalender = () => {
  const api_url = import.meta.env.VITE_API_URL;
  const { token } = useContext(AuthContext);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [holidayData, setHolidayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverData, setHoverData] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [hoverVisible, setHoverVisible] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch holiday data from API
  useEffect(() => {
    const fetchHolidayData = async () => {
      try {
        const response = await axios.get(`${api_url}/holiday-calender`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Holiday data:", response.data.data);
        setHolidayData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching holiday data:", error);
        setLoading(false);
      }
    };

    fetchHolidayData();
  }, [api_url, token]);

  // Check if a date is an off day (Saturday or Sunday)
  const isOffDay = (date) => {
    if (!holidayData?.off_days?.[0]) return false;

    const dayOfWeek = new Date(currentYear, currentMonth, date).getDay();
    const offDays = holidayData.off_days[0];

    const dayMap = {
      0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat",
    };

    const dayKey = dayMap[dayOfWeek];
    return offDays[dayKey] === "1";
  };

  // Check if a date is a national holiday
  const isNationalHoliday = (date) => {
    if (!holidayData?.national_holiday) return false;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    return holidayData.national_holiday.some(
      (holiday) => holiday.from_date === dateStr
    );
  };

  // Check if a date is a personal holiday
  const isPersonalHoliday = (date) => {
    if (!holidayData?.holiday_apply) return false;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    return holidayData.holiday_apply.some((holiday) => {
      const fromDate = holiday.form_date.split(" ")[0];
      const toDate = new Date(
        new Date(fromDate).getTime() + holiday.no_of_days * 24 * 60 * 60 * 1000
      );
      const currentDate = new Date(dateStr);
      return currentDate >= new Date(fromDate) && currentDate <= toDate;
    });
  };

  const getHolidayDescription = (date) => {
    if (!holidayData?.national_holiday) return null;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    const holiday = holidayData.national_holiday.find(
      (h) => h.from_date === dateStr
    );
    return holiday ? holiday.holiday_descripion : null;
  };

  const getHolidayName = (date) => {
    if (!holidayData?.national_holiday) return null;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    const holiday = holidayData.national_holiday.find(
      (h) => h.from_date === dateStr
    );
    return holiday ? holiday.name : null;
  };

  // Enhanced handle day hover
  const handleDayHover = (date, event) => {
    const isOff = isOffDay(date);
    const isNational = isNationalHoliday(date);
    const isPersonal = isPersonalHoliday(date);

    console.log(`Date: ${date}, Off: ${isOff}, National: ${isNational}, Personal: ${isPersonal}`);

    if (!isOff && !isNational && !isPersonal) {
      setHoverData(null);
      setHoverVisible(false);
      return;
    }

    let hoverInfo = {
      date: date,
      type: "",
      title: "",
      description: "",
    };

    if (isNational) {
      const holidayName = getHolidayName(date);
      const holidayDesc = getHolidayDescription(date);
      hoverInfo = {
        ...hoverInfo,
        type: "national",
        title: holidayName || "National Holiday",
        description: holidayDesc || "National holiday celebration",
      };
    } else if (isPersonal) {
      hoverInfo = {
        ...hoverInfo,
        type: "personal",
        title: "Personal Holiday",
        description: "Employee's personal leave applied",
      };
    } else if (isOff) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeek = new Date(currentYear, currentMonth, date).getDay();
      hoverInfo = {
        ...hoverInfo,
        type: "off",
        title: "Weekly Off",
        description: `${dayNames[dayOfWeek]} - Weekly off day`,
      };
    }

    // Get position relative to the calendar container
    const calendarContainer = event.currentTarget.closest('.calendar-container');
    const rect = calendarContainer.getBoundingClientRect();
    
    setHoverData(hoverInfo);
    setHoverPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setHoverVisible(true);
  };

  // Handle day mouse leave
  const handleDayLeave = () => {
    setHoverVisible(false);
    setTimeout(() => {
      if (!hoverVisible) {
        setHoverData(null);
      }
    }, 200);
  };

  // Navigation functions
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setCurrentDate(today);
  };

  // Generate calendar grid
  const generateCalendar = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="7" className="calendar-loading">
            Loading calendar data...
          </td>
        </tr>
      );
    }

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    const calendar = [];
    let day = 1;

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        if ((week === 0 && i < firstDayOfMonth) || day > daysInMonth) {
          weekDays.push(<td key={i} className="calendar-day empty"></td>);
        } else {
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          const isOff = isOffDay(day);
          const isNational = isNationalHoliday(day);
          const isPersonal = isPersonalHoliday(day);
          const holidayDesc = getHolidayDescription(day);

          let dayClass = "calendar-day";
          if (isToday) dayClass += " today";
          if (isOff) dayClass += " off-day";
          if (isNational) dayClass += " national-holiday";
          if (isPersonal) dayClass += " personal-holiday";
          if (isOff || isNational || isPersonal) dayClass += " has-holiday";

          weekDays.push(
            <td
              key={`${week}-${i}`}
              className={dayClass}
              onMouseEnter={(e) => handleDayHover(day, e)}
              onMouseLeave={handleDayLeave}
            >
              <div className="day-number">{day}</div>
              {holidayDesc && (
                <div className="holiday-indicator national">
                  {holidayDesc.length > 10
                    ? `${holidayDesc.substring(0, 10)}...`
                    : holidayDesc}
                </div>
              )}
              {isPersonal && !isNational && (
                <div className="holiday-indicator personal">Personal</div>
              )}
              {isOff && !isNational && !isPersonal && (
                <div className="holiday-indicator off">Off</div>
              )}
            </td>
          );
          day++;
        }
      }
      calendar.push(<tr key={week}>{weekDays}</tr>);
    }

    return calendar;
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Employee Calendar</h2>

      <div className="calendar-header">
        <div className="month-year">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <div className="navigation">
          <button className="nav-button" onClick={prevMonth}>
            &lt; Prev
          </button>
          <button className="nav-button today-button" onClick={goToToday}>
            Today
          </button>
          <button className="nav-button" onClick={nextMonth}>
            Next &gt;
          </button>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color today-legend"></span>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <span className="legend-color off-day-legend"></span>
          <span>Weekly Off</span>
        </div>
        <div className="legend-item">
          <span className="legend-color national-legend"></span>
          <span>National Holiday</span>
        </div>
        <div className="legend-item">
          <span className="legend-color personal-legend"></span>
          <span>Personal Holiday</span>
        </div>
      </div>

      <div className="calendar-table-wrapper">
        <table className="calendar-table">
          <thead>
            <tr>
              {daysOfWeek.map((day, index) => (
                <th key={index} className="calendar-week">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{generateCalendar()}</tbody>
        </table>
      </div>

      {/* Enhanced Hover Popup */}
      {hoverData && hoverVisible && (
        <div
          className="holiday-hover-popup"
          style={{
            left: `${hoverPosition.x + 15}px`,
            top: `${hoverPosition.y + 15}px`,
          }}
        >
          <div className={`popup-header ${hoverData.type}`}>
            {hoverData.title}
          </div>
          <div className="popup-content">
            <p>{hoverData.description}</p>
            <div className="popup-date">
              {hoverData.date} {monthNames[currentMonth]} {currentYear}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmCalender;