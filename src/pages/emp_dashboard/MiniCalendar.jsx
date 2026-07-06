import React, { useState } from "react";
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

const MiniCalendar = () => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells = buildCalendarGrid(year, month);

  const isToday = (day, muted) =>
    !muted &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

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
        {cells.map((cell, idx) => (
          <span
            key={idx}
            className={`mc-cell ${cell.muted ? "mc-cell--muted" : ""} ${
              isToday(cell.day, cell.muted) ? "mc-cell--today" : ""
            }`}
          >
            {cell.day}
          </span>
        ))}
      </div>

      <div className="mc-note">
        <PartyPopper size={15} className="mc-note-icon" />
        <div className="mc-note-text">
          <strong>No upcoming holidays</strong>
          <span>Have a productive day! ✨</span>
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;