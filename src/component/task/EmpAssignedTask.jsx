import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faTasks, 
  faUser, 
  faCalendarAlt,
  faFlag,
  faPaperclip,
  faFileAlt,
  faUpload,
  faTimes,
  faCheckCircle,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import CustomTextEditor from '../common/CustomTextEditor';
import './EmpAssignedTask.css';

const EmpAssignedTask = () => {
  // Employee list - replace with actual API data
  const [employees] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", department: "Development" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", department: "Design" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", department: "Development" },
    { id: 4, name: "Sarah Wilson", email: "sarah@example.com", department: "Marketing" },
    { id: 5, name: "David Brown", email: "david@example.com", department: "HR" }
  ]);

  // State for form data
  const [formData, setFormData] = useState({
    assignTo: '',
    taskName: '',
    description: '',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    summary: '',
    taskFile: null,
    summaryFile: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle text editor changes
  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  // Handle file uploads
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload valid file type (PDF, DOC, DOCX, TXT, JPG, PNG)');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  // Remove file
  const removeFile = (fileType) => {
    setFormData(prev => ({
      ...prev,
      [fileType]: null
    }));
    // Reset file input value
    if (fileType === 'taskFile') {
      document.getElementById('taskFile').value = '';
    } else {
      document.getElementById('summaryFile').value = '';
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Task assigned:', formData);
      setSubmitSuccess(true);
      setIsSubmitting(false);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
        setSubmitSuccess(false);
      }, 3000);
    }, 1500);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      assignTo: '',
      taskName: '',
      description: '',
      priority: 'Medium',
      startDate: '',
      endDate: '',
      summary: '',
      taskFile: null,
      summaryFile: null
    });
    // Reset file inputs
    if (document.getElementById('taskFile')) {
      document.getElementById('taskFile').value = '';
    }
    if (document.getElementById('summaryFile')) {
      document.getElementById('summaryFile').value = '';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="emp-assigned-task-container">
      {/* Header */}
      <div className="task-header">
        <div className="header-title">
          <FontAwesomeIcon icon={faUserPlus} className="title-icon" />
          <h2>Assign Task to Employee</h2>
        </div>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="success-message">
          <FontAwesomeIcon icon={faCheckCircle} />
          Task assigned successfully!
        </div>
      )}

      {/* Assignment Form */}
      <div className="task-form-container">
        <div className="form-header">
          <h3>Task Assignment Form</h3>
          <p className="form-subtitle">Fill in the details to assign a task to an employee</p>
        </div>
        
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faUser} className="form-icon" />
                Assign To <span className="required">*</span>
              </label>
              <select
                name="assignTo"
                value={formData.assignTo}
                onChange={handleChange}
                required
                className="employee-select"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} - {emp.department} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faTasks} className="form-icon" />
                Task Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="taskName"
                value={formData.taskName}
                onChange={handleChange}
                placeholder="Enter task name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <FontAwesomeIcon icon={faFileAlt} className="form-icon" />
              Task Description <span className="required">*</span>
            </label>
            <CustomTextEditor
              value={formData.description}
              onChange={handleEditorChange}
              placeholder="Describe the task in detail..."
              height={300}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faFlag} className="form-icon" />
                Priority <span className="required">*</span>
              </label>
              <select name="priority" value={formData.priority} onChange={handleChange} required>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faCalendarAlt} className="form-icon" />
                Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faCalendarAlt} className="form-icon" />
                End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <FontAwesomeIcon icon={faFileAlt} className="form-icon" />
              Summary
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Brief summary of the task (optional)..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faPaperclip} className="form-icon" />
                Task File Attachment
              </label>
              <div className="file-upload">
                <input
                  type="file"
                  id="taskFile"
                  onChange={(e) => handleFileChange(e, 'taskFile')}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  style={{ display: 'none' }}
                />
                <button type="button" className="file-btn" onClick={() => document.getElementById('taskFile').click()}>
                  <FontAwesomeIcon icon={faUpload} />
                  Choose File
                </button>
                {formData.taskFile && (
                  <div className="file-info">
                    <span className="file-name">
                      <FontAwesomeIcon icon={faPaperclip} />
                      {formData.taskFile.name}
                    </span>
                    <button type="button" className="remove-file" onClick={() => removeFile('taskFile')}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
              </div>
              <small className="file-hint">Max file size: 10MB. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG</small>
            </div>
            
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faFileAlt} className="form-icon" />
                Summary File Attachment
              </label>
              <div className="file-upload">
                <input
                  type="file"
                  id="summaryFile"
                  onChange={(e) => handleFileChange(e, 'summaryFile')}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  style={{ display: 'none' }}
                />
                <button type="button" className="file-btn" onClick={() => document.getElementById('summaryFile').click()}>
                  <FontAwesomeIcon icon={faUpload} />
                  Choose File
                </button>
                {formData.summaryFile && (
                  <div className="file-info">
                    <span className="file-name">
                      <FontAwesomeIcon icon={faFileAlt} />
                      {formData.summaryFile.name}
                    </span>
                    <button type="button" className="remove-file" onClick={() => removeFile('summaryFile')}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
              </div>
              <small className="file-hint">Max file size: 10MB. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn btn btn-apply" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Assigning...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUserPlus} />
                  Assign Task
                </>
              )}
            </button>
            <button type="button" className="reset-btn" onClick={resetForm}>
              Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Preview Section (Optional) */}
      {formData.taskName && formData.assignTo && (
        <div className="preview-section">
          <div className="preview-header">
            <h4>Task Summary Preview</h4>
          </div>
          <div className="preview-content">
            <div className="preview-item">
              <strong>Task:</strong> {formData.taskName}
            </div>
            <div className="preview-item">
              <strong>Assigned to:</strong> {formData.assignTo}
            </div>
            <div className="preview-item">
              <strong>Priority:</strong>
              <span className={`priority-badge ${getPriorityClass(formData.priority)}`}>
                {formData.priority}
              </span>
            </div>
            <div className="preview-item">
              <strong>Timeline:</strong> {formData.startDate || 'Not set'} to {formData.endDate || 'Not set'}
            </div>
            {formData.summary && (
              <div className="preview-item">
                <strong>Summary:</strong> {formData.summary}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpAssignedTask;