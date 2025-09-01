import React, { useState, useEffect, useContext } from 'react';
import Breadcrumb from '../../../component/common/Breadcrumb';
import axios from 'axios'; // or your preferred HTTP client
import './Holiday.css'
import { AuthContext } from '../../../context/AuthContex';

const Holiday = () => {
    const api_url = import.meta.env.VITE_API_URL;
    const { token } = useContext(AuthContext)
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [slideDirection, setSlideDirection] = useState('');
    const [monthYearDirection, setMonthYearDirection] = useState('');
    const [holidayData, setHolidayData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [popupData, setPopupData] = useState(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Fetch holiday data from API
    useEffect(() => {
        const fetchHolidayData = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await axios.get(`${api_url}/holiday-calender`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                console.log(response.data.data);

                setHolidayData(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching holiday data:', error);
                setLoading(false);
            }
        };

        fetchHolidayData();
    }, []);

    const handleDayClick = (date, isNational, isPersonal) => {
        if (!isNational && !isPersonal) return;

        if (isNational) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            const holiday = holidayData.national_holiday.find(h => h.from_date === dateStr);
            if (holiday) {
                setPopupData({
                    title: holiday.name,
                    description: holiday.holiday_descripion,
                    type: 'national'
                });
            }
        } else if (isPersonal) {
            setPopupData({
                title: "Personal Holiday",
                description: "Employee's personal holiday",
                type: 'personal'
            });
        }
    };


    const daysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const firstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        setSlideDirection('slide-right');
        setMonthYearDirection('slide-down');

        setTimeout(() => {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
            setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
            setSlideDirection('');
            setMonthYearDirection('');
        }, 300);
    };

    const nextMonth = () => {
        setSlideDirection('slide-left');
        setMonthYearDirection('slide-up');

        setTimeout(() => {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
            setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
            setSlideDirection('');
            setMonthYearDirection('');
        }, 300);
    };

    // Check if a date is an off day (Saturday or Sunday)
    const isOffDay = (date) => {
        if (!holidayData?.off_days?.[0]) return false;

        const dayOfWeek = new Date(currentYear, currentMonth, date).getDay();
        const offDays = holidayData.off_days[0];

        // Map day numbers to their corresponding keys in the API response
        const dayMap = {
            0: 'sun', // Sunday
            1: 'mon', // Monday
            2: 'tue', // Tuesday
            3: 'wed', // Wednesday
            4: 'thu', // Thursday
            5: 'fri', // Friday
            6: 'sat'  // Saturday
        };

        const dayKey = dayMap[dayOfWeek];
        return offDays[dayKey] === "1"; // Check if the day is marked as off day
    };

    // Check if a date is a national holiday
    const isNationalHoliday = (date) => {
        if (!holidayData?.national_holiday) return false;

        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

        return holidayData.national_holiday.some(holiday => {
            return holiday.from_date === dateStr;
        });
    };

    // Check if a date is a personal holiday
    const isPersonalHoliday = (date) => {
        if (!holidayData?.holiday_apply) return false;

        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

        return holidayData.holiday_apply.some(holiday => {
            const fromDate = holiday.form_date.split(' ')[0];
            const toDate = new Date(new Date(fromDate).getTime() + (holiday.no_of_days * 24 * 60 * 60 * 1000));
            const currentDate = new Date(dateStr);

            return currentDate >= new Date(fromDate) && currentDate <= toDate;
        });
    };

    // Get holiday description for a date
    const getHolidayDescription = (date) => {
        if (!holidayData?.national_holiday) return null;

        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        const holiday = holidayData.national_holiday.find(h => h.from_date === dateStr);

        return holiday ? holiday.holiday_descripion : null;
    };

    const renderCalendar = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan="7" className="text-center py-5">
                        Loading calendar data...

                    </td>
                </tr>
            );
        }

        const totalDays = daysInMonth(currentMonth, currentYear);
        const firstDay = firstDayOfMonth(currentMonth, currentYear);
        const today = new Date();

        let blanks = [];
        for (let i = 0; i < firstDay; i++) {
            blanks.push(<td key={`blank-${i}`} className="calendar-day empty"></td>);
        }

        let days = [];
        for (let d = 1; d <= totalDays; d++) {
            const isToday =
                d === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

            const isOff = isOffDay(d);
            const isNational = isNationalHoliday(d);
            const isPersonal = isPersonalHoliday(d);
            const holidayDesc = getHolidayDescription(d);

            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (isOff) dayClass += ' off-day';
            if (isNational) dayClass += ' national-holiday';
            if (isPersonal) dayClass += ' personal-holiday';

            days.push(
                <td
                    key={`day-${d}`}
                    className={dayClass}
                    onClick={() => handleDayClick(d, isNational, isPersonal)}
                >
                    <div className="day-number">{d}</div>
                    {holidayDesc && (
                        <div className="holiday-label">
                            {holidayDesc.length > 15
                                ? `${holidayDesc.substring(0, 15)}...`
                                : holidayDesc}
                        </div>
                    )}
                    {isPersonal && !isNational && (
                        <div className="holiday-label personal">
                            Personal...
                        </div>
                    )}
                </td>
            );
        }

        let totalSlots = [...blanks, ...days];
        let rows = [];
        let cells = [];

        totalSlots.forEach((day, i) => {
            if (i % 7 !== 0) {
                cells.push(day);
            } else {
                rows.push(cells);
                cells = [];
                cells.push(day);
            }
            if (i === totalSlots.length - 1) {
                rows.push(cells);
            }
        });

        return rows.map((row, i) => (
            <tr key={`row-${i}`}>{row}</tr>
        ));
    };

    return (
        <>
            <Breadcrumb pageTitle="Holiday Calendar" />
            <div className='card holiday-calendar'>
                <div className="card-body">
                    <div className="calendar">
                        <div className="calendar-header">
                            <div className={`month-year-container ${monthYearDirection}`}>
                                <div className="month-year">
                                    {months[currentMonth]} {currentYear}
                                </div>
                            </div>
                            <div className="navigation">
                                <button className="nav-button" onClick={prevMonth}>&lt; Prev</button>
                                <button className="nav-button today-button" onClick={() => {
                                    const today = new Date();
                                    setCurrentMonth(today.getMonth());
                                    setCurrentYear(today.getFullYear());
                                    setCurrentDate(today);
                                }}>
                                    Today
                                </button>
                                <button className="nav-button" onClick={nextMonth}>Next &gt;</button>
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
                        <div className="calendar-body">
                            <table className="calendar-table">
                                <thead>
                                    <tr>
                                        <th>Sun</th>
                                        <th>Mon</th>
                                        <th>Tue</th>
                                        <th>Wed</th>
                                        <th>Thu</th>
                                        <th>Fri</th>
                                        <th>Sat</th>
                                    </tr>
                                </thead>
                                <tbody className={`calendar-grid ${slideDirection}`}>
                                    {renderCalendar()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


            </div>

            {popupData && (
                <div className="holiday-popup-overlay" onClick={() => setPopupData(null)}>
                    <div className="holiday-popup" onClick={e => e.stopPropagation()}>
                        <button className="close-popup" onClick={() => setPopupData(null)}>
                            &times;
                        </button>
                        <h3>{popupData.title}</h3>
                        <div className={`popup-type ${popupData.type}`}>
                            {popupData.type === 'national' ? 'National Holiday' : 'Personal Holiday'}
                        </div>
                        <p>{popupData.description}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default Holiday;