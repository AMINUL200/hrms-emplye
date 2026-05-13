import React, { useState, useEffect, useContext } from "react";
import "./EmpRollMaster.css";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContex";

const EmpRollMaster = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  // Fetch roles from API
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api_url}/project-role`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 1) {
        setRoles(response.data.roles || []);
        setTotalItems(response.data.roles?.length || 0);
        toast.success("Roles loaded successfully!");
      } else {
        toast.error(response.data.message || "Failed to fetch roles");
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error(err.response?.data?.message || "Failed to load roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRoles();
    }
  }, [token]);

  useEffect(() => {
    const filtered = getFilteredData();
    setTotalItems(filtered.length);
  }, [searchTerm, roles]);

  const getFilteredData = () => {
    let filtered = [...roles];
    if (searchTerm) {
      filtered = filtered.filter((role) =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const getCurrentPageData = () => {
    const filtered = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.warning("Please enter a role name");
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingId) {
        // Update role
        const response = await axios.post(
          `${api_url}/project-role-update/${editingId}`,
          { role_name: roleName },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.status === 1) {
          toast.success("Role updated successfully!");
          fetchRoles(); // Refresh the list
          resetForm();
        } else {
          toast.error(response.data.message || "Failed to update role");
        }
      } else {
        // Create role
        const response = await axios.post(
          `${api_url}/project-role-create`,
          { role_name: roleName },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.status === 1) {
          toast.success("Role created successfully!");
          fetchRoles(); // Refresh the list
          resetForm();
        } else {
          toast.error(response.data.message || "Failed to create role");
        }
      }
    } catch (err) {
      console.error("Error saving role:", err);
      toast.error(err.response?.data?.message || "Failed to save role. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (role) => {
    setRoleName(role.name);
    setEditingId(role.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, roleName) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      try {
        const response = await axios.delete(`${api_url}/project-role-delete/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.status === 1) {
          toast.success("Role deleted successfully!");
          fetchRoles(); // Refresh the list
          
          // Adjust current page if needed
          const filtered = getFilteredData();
          const totalPages = Math.ceil((filtered.length - 1) / itemsPerPage);
          if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
          }
        } else {
          toast.error(response.data.message || "Failed to delete role");
        }
      } catch (err) {
        console.error("Error deleting role:", err);
        toast.error(err.response?.data?.message || "Failed to delete role. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setRoleName("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = getCurrentPageData();

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="rm-container">
      {/* Header */}
      <div className="rm-header">
        <div>
          <h1 className="rm-title">Role Master</h1>
          <p className="rm-subtitle">Manage user roles and permissions</p>
        </div>
        <button
          className={`rm-btn-add ${showForm ? "cancel" : ""}`}
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
          {showForm ? "✕ Close" : "+ Add New Role"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rm-form-box">
          <form onSubmit={handleSubmit} className="rm-form-row">
            <div className="rm-form-field">
              <label htmlFor="role_name">
                Role Name <span className="req">*</span>
              </label>
              <input
                type="text"
                id="role_name"
                placeholder="e.g. Admin, Manager, Guest"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="rm-form-btns">
              <button type="submit" className="rm-btn-save" disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Update Role" : "Create Role"}
              </button>
              <button type="button" className="rm-btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls */}
      <div className="rm-controls">
        <div className="rm-search-wrap">
          <svg className="rm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="rm-search-input"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="rm-pp-wrap">
          <span>Show</span>
          <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Table */}
      <div className="rm-table-wrap">
        {loading ? (
          <div className="rm-loading">
            <div className="rm-spinner" />
            <p>Loading roles...</p>
          </div>
        ) : (
          <table className="rm-table">
            <thead>
              <tr>
                <th className="col-sno">S.No</th>
                <th className="col-role">Role Name</th>
                <th className="col-date">Created Date</th>
                <th className="col-act">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((role, index) => (
                  <tr key={role.id}>
                    <td className="col-sno">
                      <span className="sno-text">{startIndex + index + 1}</span>
                    </td>
                    <td className="col-role">
                      <span className="role-pill">{role.name}</span>
                    </td>
                    <td className="col-date">
                      <span className="date-text">{formatDate(role.created_at)}</span>
                    </td>
                    <td className="col-act">
                      <div className="act-group">
                        <button className="btn-edit" onClick={() => handleEdit(role)}>
                          Edit
                        </button>
                        <button className="btn-del" onClick={() => handleDelete(role.id, role.name)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data-cell">
                    <div className="no-data-msg">
                      {searchTerm ? "No roles found matching your search" : "No roles available"}
                      {searchTerm && <p>Try adjusting your search term</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="rm-pagination">
          <span className="pg-info">
            Showing {startIndex + 1}–{Math.min(startIndex + currentData.length, totalItems)} of{" "}
            {totalItems} entries
          </span>
          <div className="pg-controls">
            <button
              className="pg-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>
            {getPageNumbers().map((page) => (
              <button
                key={page}
                className={`pg-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pg-btn"
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

export default EmpRollMaster;