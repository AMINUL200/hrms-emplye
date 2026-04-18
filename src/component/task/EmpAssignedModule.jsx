import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './EmpAssignedModule.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faSave, 
  faUserPlus,
  faTimes,
  faUser,
  faLayerGroup,
  faCalendarAlt,
  faSortNumericDown,
  faInfoCircle,
  faCheckCircle,
  faEdit,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmpAssignedModule = () => {
  const { id } = useParams(); // module_id
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project;
  const module = location.state?.module;
  
  // Check if it's add mode (add=true) or edit mode (add=false)
  const isAddMode = searchParams.get('add') === 'true';
  
  // Dummy module data for edit mode
  const dummyModuleData = {
    module_id: id || '1',
    module_name: "User Authentication Module",
    description: "Complete authentication system with JWT, OAuth, and role-based access control",
    order_by: "1",
    created_by: "John Doe",
    created_at: "2024-01-15",
    updated_at: "2024-02-01"
  };

  // Form state
  const [formData, setFormData] = useState({
    module_id: '',
    project_id: project?.project_id || '',
    module_name: '',
    description: '',
    order_by: '',
    created_by: '',
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy employees data
  const dummyEmployees = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Developer", department: "Engineering" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Tester", department: "QA" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Frontend Developer", department: "Engineering" },
    { id: 4, name: "Sarah Wilson", email: "sarah@example.com", role: "Backend Developer", department: "Engineering" },
    { id: 5, name: "Tom Brown", email: "tom@example.com", role: "DevOps", department: "Infrastructure" },
    { id: 6, name: "Emily Davis", email: "emily@example.com", role: "Data Analyst", department: "Analytics" },
    { id: 7, name: "Robert Taylor", email: "robert@example.com", role: "UI/UX Designer", department: "Design" },
    { id: 8, name: "Lisa Anderson", email: "lisa@example.com", role: "Project Manager", department: "Management" }
  ];

  // Dummy assigned employees for edit mode
  const dummyAssignedEmployees = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Developer", department: "Engineering", status: "active" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Frontend Developer", department: "Engineering", status: "active" },
    { id: 6, name: "Emily Davis", email: "emily@example.com", role: "Data Analyst", department: "Analytics", status: "active" }
  ];

  useEffect(() => {
    // Fetch employees (simulate API call)
    setEmployees(dummyEmployees);
    
    if (isAddMode) {
      // ADD MODE: Clear all form fields
      setFormData({
        module_id: '',
        project_id: project?.project_id || '',
        module_name: '',
        description: '',
        order_by: '',
        created_by: '',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      });
      setSelectedEmployees([]);
    } else {
      // EDIT MODE: Populate with dummy data
      setFormData({
        module_id: id || dummyModuleData.module_id,
        project_id: project?.project_id || 'PROJ-001',
        module_name: module?.module_name || dummyModuleData.module_name,
        description: module?.module_description || dummyModuleData.description,
        order_by: module?.order_by || dummyModuleData.order_by,
        created_by: module?.created_by || dummyModuleData.created_by,
        created_at: module?.created_at || dummyModuleData.created_at,
        updated_at: new Date().toISOString().split('T')[0]
      });
      
      // If module has existing assigned employees, populate them
      if (module?.assigned_employees && module.assigned_employees.length > 0) {
        setSelectedEmployees(module.assigned_employees);
      } else {
        // Use dummy assigned employees for edit mode
        setSelectedEmployees(dummyAssignedEmployees);
      }
    }
  }, [module, id, isAddMode, project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      updated_at: new Date().toISOString().split('T')[0]
    }));
  };

  const handleEmployeeSelect = (employee) => {
    if (!selectedEmployees.find(emp => emp.id === employee.id)) {
      setSelectedEmployees([...selectedEmployees, employee]);
      toast.success(`${employee.name} added to module`);
    } else {
      toast.info(`${employee.name} is already assigned`);
    }
  };

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== employeeId));
    toast.info('Employee removed from module');
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate required fields
    if (!formData.module_name) {
      toast.error('Module name is required');
      setLoading(false);
      return;
    }
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      assigned_employees: selectedEmployees.map(emp => emp.id),
      module_name: formData.module_name,
      description: formData.description,
      mode: isAddMode ? 'create' : 'update'
    };
    
    console.log('Submitting module data:', submitData);
    
    // Simulate API call
    setTimeout(() => {
      if (isAddMode) {
        toast.success('Module created successfully!');
      } else {
        toast.success('Module updated successfully!');
      }
      setLoading(false);
      navigate(`/organization/assigned-project/${formData.project_id}/modules`, {
        state: { project: project }
      });
    }, 1500);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="emp-assigned-module-container">
      <div className="form-header">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back</span>
        </button>
        <h1>
          {isAddMode ? (
            <>
              <FontAwesomeIcon icon={faPlus} />
              Create New Module
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faEdit} />
              Edit Module & Assign Employees
            </>
          )}
        </h1>
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="module-assign-form">
          {/* Module Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faLayerGroup} />
              {isAddMode ? 'Module Details' : 'Module Information'}
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="module_id">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Module ID
                </label>
                <input
                  type="text"
                  id="module_id"
                  name="module_id"
                  value={formData.module_id}
                  onChange={handleChange}
                  placeholder={isAddMode ? "Auto-generated" : "Module ID"}
                  readOnly={!isAddMode}
                  className={!isAddMode ? "readonly-input" : ""}
                />
                {isAddMode && (
                  <small className="form-hint">Leave empty for auto-generation</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="project_id">
                  <FontAwesomeIcon icon={faLayerGroup} />
                  Project ID
                </label>
                <input
                  type="text"
                  id="project_id"
                  name="project_id"
                  value={formData.project_id}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="module_name">
                  <FontAwesomeIcon icon={faUser} />
                  Module Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="module_name"
                  name="module_name"
                  value={formData.module_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter module name"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter module description"
                />
              </div>

              <div className="form-group">
                <label htmlFor="order_by">
                  <FontAwesomeIcon icon={faSortNumericDown} />
                  Order By
                </label>
                <input
                  type="number"
                  id="order_by"
                  name="order_by"
                  value={formData.order_by}
                  onChange={handleChange}
                  placeholder="Display order"
                />
              </div>

              <div className="form-group">
                <label htmlFor="created_by">
                  <FontAwesomeIcon icon={faUser} />
                  Created By
                </label>
                <input
                  type="text"
                  id="created_by"
                  name="created_by"
                  value={formData.created_by}
                  onChange={handleChange}
                  placeholder="Enter creator name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="created_at">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Created At
                </label>
                <input
                  type="date"
                  id="created_at"
                  name="created_at"
                  value={formData.created_at}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="updated_at">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Updated At
                </label>
                <input
                  type="date"
                  id="updated_at"
                  name="updated_at"
                  value={formData.updated_at}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Assign Employees Section */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faUserPlus} />
              {isAddMode ? 'Assign Employees (Optional)' : 'Assigned Employees'}
            </h2>

            {/* Search Employees */}
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search employees by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Employees List */}
            <div className="employees-list">
              <h3>Available Employees</h3>
              <div className="employees-grid">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => (
                    <div key={employee.id} className="employee-card">
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {employee.name.charAt(0)}
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">{employee.name}</div>
                          <div className="employee-role">{employee.role}</div>
                          <div className="employee-email">{employee.email}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="add-employee-btn"
                        onClick={() => handleEmployeeSelect(employee)}
                        disabled={selectedEmployees.some(emp => emp.id === employee.id)}
                      >
                        {selectedEmployees.some(emp => emp.id === employee.id) ? (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Assigned
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUserPlus} />
                            Assign
                          </>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No employees found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Employees */}
            {selectedEmployees.length > 0 && (
              <div className="selected-employees">
                <h3>
                  <FontAwesomeIcon icon={faUserPlus} />
                  Selected Employees ({selectedEmployees.length})
                </h3>
                <div className="selected-employees-list">
                  {selectedEmployees.map(employee => (
                    <div key={employee.id} className="selected-employee-card">
                      <div className="selected-employee-info">
                        <div className="employee-avatar small">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="employee-name">{employee.name}</div>
                          <div className="employee-role">{employee.role}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="remove-employee-btn"
                        onClick={() => handleRemoveEmployee(employee.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleBack}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  {isAddMode ? 'Create Module' : 'Update Module'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmpAssignedModule;