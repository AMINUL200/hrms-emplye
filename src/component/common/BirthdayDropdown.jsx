import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBirthdayCake, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const BirthdayDropdown = ({ birthdays }) => {
  const [showBirthdays, setShowBirthdays] = useState(false);
  const [currentBirthdaySlide, setCurrentBirthdaySlide] = useState(0);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBirthdays(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Birthday slider functions
  const nextSlide = () => {
    setCurrentBirthdaySlide((prev) => 
      prev >= birthdays.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentBirthdaySlide((prev) => 
      prev <= 0 ? birthdays.length - 1 : prev - 1
    );
  };

  const toggleBirthdays = () => {
    setShowBirthdays(!showBirthdays);
  };

  return (
    <div className="dropdown birthday-dropdown" ref={dropdownRef}>
      <button 
        className="birthday-btn"
        onClick={toggleBirthdays}
      >
        <FontAwesomeIcon icon={faBirthdayCake} />
        {birthdays.length > 0 && (
          <span className="birthday-badge">{birthdays.length}</span>
        )}
      </button>
      
      {showBirthdays && (
        <div className="dropdown-menu birthday-menu show">
          <div className="birthday-header">
            <h6>Today's Birthdays</h6>
            <span className="birthday-count">{birthdays.length}</span>
          </div>
          
          {birthdays.length > 0 && (
            <div className="birthday-slider">
              <button 
                className="slider-btn prev-btn"
                onClick={prevSlide}
                disabled={birthdays.length <= 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              
              <div className="birthday-card">
                <div className="birthday-image">
                  <img 
                    src={birthdays[currentBirthdaySlide]?.image} 
                    alt={birthdays[currentBirthdaySlide]?.name}
                  />
                </div>
                <div className="birthday-info">
                  <h6>{birthdays[currentBirthdaySlide]?.name}</h6>
                  <p className="birthday-date">
                    🎂 {birthdays[currentBirthdaySlide]?.birthdate}
                  </p>
                  <p className="birthday-dept">
                    {birthdays[currentBirthdaySlide]?.department}
                  </p>
                </div>
              </div>
              
              <button 
                className="slider-btn next-btn"
                onClick={nextSlide}
                disabled={birthdays.length <= 1}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BirthdayDropdown;