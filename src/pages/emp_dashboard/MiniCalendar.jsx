import React, { useState, useMemo } from "react";
import "./MiniCalendar.css";
import { ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const buildCalendarGrid = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // Leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, muted: true });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, muted: false });
  }
  // Trailing days to complete the grid (up to 42 cells / 6 rows)
  let nextDay = 1;
  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({ day: nextDay, muted: true });
    nextDay++;
    if (cells.length >= 42) break;
  }

  return cells;
};

// Get day name from index (0 = Sunday, 1 = Monday, etc.)
const getDayName = (index) => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[index];
};

// Check if a date is within a holiday range
const isDateInHolidayRange = (date, holiday) => {
  if (!holiday.from_date || !holiday.to_date) return false;
  const fromDate = new Date(holiday.from_date);
  const toDate = new Date(holiday.to_date);
  const checkDate = new Date(date);
  
  // Reset time to compare dates only
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate >= fromDate && checkDate <= toDate;
};

const MiniCalendar = ({ calendarInfo }) => {
  // console.log("MiniCalendar received calendarInfo:", calendarInfo);
  
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells = buildCalendarGrid(year, month);

  // Get off days from calendarInfo
  const offDays = useMemo(() => {
    if (!calendarInfo?.off_days || calendarInfo.off_days.length === 0) return {};
    
    const offDayObj = {};
    const offDayData = calendarInfo.off_days[0]; // Take first entry
    
    // Map day names to their values (null or "1")
    const dayMapping = {
      sun: offDayData.sun,
      mon: offDayData.mon,
      tue: offDayData.tue,
      wed: offDayData.wed,
      thu: offDayData.thu,
      fri: offDayData.fri,
      sat: offDayData.sat
    };
    
    // Store which days are off (where value is "1")
    Object.keys(dayMapping).forEach((day, index) => {
      if (dayMapping[day] === "1") {
        offDayObj[index] = true; // index 0 = Sunday, 1 = Monday, etc.
      }
    });
    
    return offDayObj;
  }, [calendarInfo]);

  // Get holidays for the current month
  const currentMonthHolidays = useMemo(() => {
    if (!calendarInfo?.national_holiday || calendarInfo.national_holiday.length === 0) return [];
    
    return calendarInfo.national_holiday.filter((holiday) => {
      if (!holiday.from_date) return false;
      const holidayDate = new Date(holiday.from_date);
      return holidayDate.getMonth() === month && holidayDate.getFullYear() === year;
    });
  }, [calendarInfo, month, year]);

  // Get holidays for the next month
  const nextMonthHolidays = useMemo(() => {
    if (!calendarInfo?.national_holiday || calendarInfo.national_holiday.length === 0) return [];
    
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    return calendarInfo.national_holiday.filter((holiday) => {
      if (!holiday.from_date) return false;
      const holidayDate = new Date(holiday.from_date);
      return holidayDate.getMonth() === nextMonth && holidayDate.getFullYear() === nextYear;
    });
  }, [calendarInfo, month, year]);

  // Get upcoming holiday (current month or next month)
  const upcomingHoliday = useMemo(() => {
    // First check current month holidays
    if (currentMonthHolidays.length > 0) {
      return currentMonthHolidays[0];
    }
    // Then check next month holidays
    if (nextMonthHolidays.length > 0) {
      return nextMonthHolidays[0];
    }
    return null;
  }, [currentMonthHolidays, nextMonthHolidays]);

  // Format holiday date for display
  const formatHolidayDate = (holiday) => {
    if (!holiday) return "";
    if (holiday.from_date && holiday.to_date) {
      const from = new Date(holiday.from_date);
      const to = new Date(holiday.to_date);
      const fromStr = from.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const toStr = to.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (fromStr === toStr) return fromStr;
      return `${fromStr} - ${toStr}`;
    }
    return "";
  };

  const isToday = (day, muted) =>
    !muted &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  // Check if a day is a week off
  const isWeekOff = (day, muted) => {
    if (muted) return false;
    const date = new Date(year, month, day);
    const dayIndex = date.getDay(); // 0 = Sunday, 6 = Saturday
    return offDays[dayIndex] === true;
  };

  // Check if a day is a holiday
  const isHoliday = (day, muted) => {
    if (muted) return false;
    const date = new Date(year, month, day);
    return currentMonthHolidays.some((holiday) => 
      isDateInHolidayRange(date, holiday)
    );
  };

  // Get holiday name for a day
  const getHolidayName = (day, muted) => {
    if (muted) return null;
    const date = new Date(year, month, day);
    const holiday = currentMonthHolidays.find((h) => 
      isDateInHolidayRange(date, h)
    );
    return holiday?.name || null;
  };

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="mc-card">
      <div className="mc-header">
        <button type="button" className="mc-nav-btn" onClick={goPrev} aria-label="Previous month">
          <ChevronLeft size={15} />
        </button>
        <span className="mc-month-label">{monthLabel}</span>
        <button type="button" className="mc-nav-btn" onClick={goNext} aria-label="Next month">
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="mc-weekdays">
        {WEEK_DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mc-grid">
        {cells.map((cell, idx) => {
          const isOff = isWeekOff(cell.day, cell.muted);
          const isHoli = isHoliday(cell.day, cell.muted);
          const holidayName = getHolidayName(cell.day, cell.muted);
          const isTodayCell = isToday(cell.day, cell.muted);

          let cellClassName = "mc-cell";
          if (cell.muted) cellClassName += " mc-cell--muted";
          if (isTodayCell) cellClassName += " mc-cell--today";
          if (isOff && !isTodayCell) cellClassName += " mc-cell--weekoff";
          if (isHoli && !isTodayCell) cellClassName += " mc-cell--holiday";

          return (
            <span
              key={idx}
              className={cellClassName}
              title={holidayName || (isOff ? "Week Off" : "")}
            >
              {cell.day}
              {isHoli && <span className="mc-holiday-dot" />}
            </span>
          );
        })}
      </div>

      <div className="mc-note">
        <PartyPopper size={15} className="mc-note-icon" />
        <div className="mc-note-text">
          {upcomingHoliday ? (
            <>
              <strong>{upcomingHoliday.name}</strong>
              <span>
                {formatHolidayDate(upcomingHoliday)} • {upcomingHoliday.holiday_descripion || "Holiday"}
              </span>
            </>
          ) : (
            <>
              <strong>No upcoming holidays</strong>
              <span>Have a productive day! ✨</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;