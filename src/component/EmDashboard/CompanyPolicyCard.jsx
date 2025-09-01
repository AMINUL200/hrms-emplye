import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye } from '@fortawesome/free-solid-svg-icons';

const CompanyPolicyCard = ({
  wrapperClass = 'company-soft-tertiary',
  iconClass = 'company-icon-tertiary',
}) => {
  return (
    <div className={`company-grid ${wrapperClass}`}>
      <div className="company-top">
        <div className="company-icon">
          <span className={`rounded-circle ${iconClass}`}>HR</span>
        </div>
        <div className="company-link">
          <a href="companies.html">HR Policy</a>
        </div>
      </div>
      <div className="company-bottom d-flex">
        <ul>
          <li>Policy Name : Work policy</li>
          <li>Updated on : Today</li>
        </ul>
        <div className="company-bottom-links">
          <a href="#"><FontAwesomeIcon className='icon' icon={faDownload} /></a>
          <a href="#"><FontAwesomeIcon className='icon' icon={faEye} /></a>
        </div>
      </div>
    </div>
  );
};

export default CompanyPolicyCard;
