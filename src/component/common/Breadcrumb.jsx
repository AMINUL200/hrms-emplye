import React from 'react'
import { Link } from 'react-router-dom'

const Breadcrumb = ({pageTitle}) => {
  return (
    <div className='page-header' style={{display: 'inline-block', width:'fit-content'}}>
      <div className="row">
        <div className="">
            <h3 className="page-title">{pageTitle}</h3>
            <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to='/organization/employerdashboard'>Dashboard</Link></li>
                <li className="breadcrumb-item active">{pageTitle}</li>
            </ul>
        </div>
      </div>
    </div>
  )
}

export default Breadcrumb
