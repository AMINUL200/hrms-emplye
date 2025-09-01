import React, { useState } from 'react';

const Calender = () => {
  const today = new Date();
  console.log(today);
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // which day it starts on
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // how many days

  // Generate the calendar grid
  const generateCalendar = () => {
    const calendar = [];
    let day = 1;

    // 6 weeks to cover all possibilities
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        if ((week === 0 && i < firstDayOfMonth) || day > daysInMonth) {
          weekDays.push(<td key={i}></td>);
        } else {
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          weekDays.push(
            <td key={i} className={`calender-day ${isToday ? 'active' :''} `} >
              {day}
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
    <div className='calender'>
      <h2 className='calender-title'>Calendar</h2>
      <h3 className='calender-title'>
        {monthNames[month]} {year}
      </h3>

      <table className='calender-table'>
        <thead>
          <tr>
            {daysOfWeek.map((day, index) => (
              <th key={index} className='calender-week'>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>{generateCalendar()}</tbody>
      </table>
    </div>
  );
};

export default Calender;
