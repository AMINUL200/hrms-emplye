import React, { useState, useEffect } from 'react';
import './EmpPermissionList.css';

const EmpPermissionList = () => {
  // State variables
  const [permissionData, setPermissionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Dummy data for role permissions
  const dummyPermissionData = [
    {
      id: 1,
      roll_name: 'Admin',
      permissions: [
        'View Projects',
        'Create Projects',
        'Edit Projects',
        'Delete Projects',
        'Assign Team Members',
        'View Project Reports',
        'Export Project Data',
        'Manage Project Budget'
      ],
      permission_count: 8,
      created_at: '2024-01-15'
    },
    {
      id: 2,
      roll_name: 'Employee',
      permissions: [
        'View Projects',
        'View Project Reports'
      ],
      permission_count: 2,
      created_at: '2024-01-16'
    },
    {
      id: 3,
      roll_name: 'Guest',
      permissions: [
        'View Projects'
      ],
      permission_count: 1,
      created_at: '2024-01-17'
    },
    {
      id: 4,
      roll_name: 'Manager',
      permissions: [
        'View Projects',
        'Create Projects',
        'Edit Projects',
        'Assign Team Members',
        'View Project Reports',
        'Export Project Data'
      ],
      permission_count: 6,
      created_at: '2024-01-18'
    },
    {
      id: 5,
      roll_name: 'Supervisor',
      permissions: [
        'View Projects',
        'Edit Projects',
        'View Project Reports'
      ],
      permission_count: 3,
      created_at: '2024-01-19'
    },
    {
      id: 6,
      roll_name: 'HR Admin',
      permissions: [
        'View Projects',
        'View Project Reports',
        'Export Project Data'
      ],
      permission_count: 3,
      created_at: '2024-01-20'
    },
    {
      id: 7,
      roll_name: 'Finance',
      permissions: [
        'View Projects',
        'View Project Reports',
        'Export Project Data',
        'Manage Project Budget'
      ],
      permission_count: 4,
      created_at: '2024-01-21'
    },
    {
      id: 8,
      roll_name: 'IT Support',
      permissions: [
        'View Projects',
        'Edit Projects'
      ],
      permission_count: 2,
      created_at: '2024-01-22'
    },
    {
      id: 9,
      roll_name: 'Team Lead',
      permissions: [
        'View Projects',
        'Create Projects',
        'Edit Projects',
        'View Project Reports'
      ],
      permission_count: 4,
      created_at: '2024-01-23'
    },
    {
      id: 10,
      roll_name: 'Director',
      permissions: [
        'View Projects',
        'Create Projects',
        'Edit Projects',
        'Delete Projects',
        'Assign Team Members',
        'View Project Reports',
        'Export Project Data',
        'Manage Project Budget'
      ],
      permission_count: 8,
      created_at: '2024-01-24'
    },
    {
      id: 11,
      roll_name: 'Consultant',
      permissions: [
        'View Projects',
        'View Project Reports'
      ],
      permission_count: 2,
      created_at: '2024-01-25'
    },
    {
      id: 12,
      roll_name: 'Trainee',
      permissions: [
        'View Projects'
      ],
      permission_count: 1,
      created_at: '2024-01-26'
    }
  ];
  
  // Load data on component mount
  useEffect(() => {
    loadPermissionData();
  }, []);
  
  // Filter and paginate data
  useEffect(() => {
    filterAndPaginateData();
  }, [searchTerm, currentPage, itemsPerPage]);
  
  // Load initial dummy data
  const loadPermissionData = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setPermissionData(dummyPermissionData);
      setTotalItems(dummyPermissionData.length);
      setLoading(false);
    }, 500);
  };
  
  // Filter and paginate data
  const filterAndPaginateData = () => {
    let filteredData = [...dummyPermissionData];
    
    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        item.roll_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setTotalItems(filteredData.length);
    return filteredData;
  };
  
  // Get current page data
  const getCurrentPageData = () => {
    let filteredData = [...dummyPermissionData];
    
    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        item.roll_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = getCurrentPageData();
  
  // Handle page change
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  return (
    <div className="emp-permission-list-container">
      {/* Header Section */}
      <div className="permission-list-header">
        <div>
          <h1 className="permission-list-title">Role Permission List</h1>
          <p className="permission-list-subtitle">View all roles and their assigned permissions</p>
        </div>
      </div>
      
      {/* Search and Per Page Section */}
      <div className="permission-controls">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by role name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="per-page-selector">
          <label>Show:</label>
          <select 
            className="per-page-dropdown"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
      
      {/* Permissions Table */}
      <div className="permission-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading permissions...</p>
          </div>
        ) : (
          <table className="permission-table">
            <thead>
              <tr>
                <th className="col-sno">S.No</th>
                <th className="col-role">Role Name</th>
                <th className="col-permissions">Permissions</th>
                <th className="col-count">Permission Count</th>
                <th className="col-created">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-sno">{startIndex + index + 1}</td>
                    <td className="col-role">
                      <span className="role-badge">{item.roll_name}</span>
                    </td>
                    <td className="col-permissions">
                      <div className="permissions-list-cell">
                        {item.permissions.map((permission, idx) => (
                          <span key={idx} className="permission-tag">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="col-count">
                      <span className="permission-count-badge">
                        {item.permission_count} Permission{item.permission_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="col-created">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    <div className="no-data-message">
                      📭 No roles found
                      {searchTerm && <p>Try adjusting your search</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="permission-pagination">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + currentData.length, totalItems)} of {totalItems} entries
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            {getPageNumbers().map(page => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpPermissionList;