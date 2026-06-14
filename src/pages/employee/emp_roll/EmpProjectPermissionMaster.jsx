import React, { useState, useEffect, useContext } from 'react';
import './EmpProjectPermissionMaster.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faCheckCircle, 
  faTimesCircle,
  faSave,
  faUsers,
  faShieldAlt,
  faLayerGroup,
  faTasks,
  faList,
  faComment,
  faUpload,
  faUserCheck,
  faProjectDiagram
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/AuthContex';

const EmpProjectPermissionMaster = () => {
  const { token } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRoleData, setSelectedRoleData] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Group icons mapping
  const groupIcons = {
    'project': faProjectDiagram,
    'module': faLayerGroup,
    'submodule': faLayerGroup,
    'task': faTasks,
    'subtask': faList,
    'assignment': faUserCheck,
    'submission': faUpload,
    'comment': faComment,
    'default': faShieldAlt
  };

  // Fetch all roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${api_url}/project-role`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        setRoles(response.data.roles || []);
        // toast.success("Roles loaded successfully");
      } else {
        toast.error("Failed to fetch roles");
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error(err.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all permissions
  const fetchAllPermissions = async () => {
    try {
      const response = await axios.get(
        `${api_url}/master-permission-list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        setAllPermissions(response.data.data || []);
      } else {
        toast.error("Failed to fetch permissions");
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
      toast.error(err.response?.data?.message || "Failed to load permissions");
    }
  };

  // Fetch role-based permissions
  const fetchRolePermissions = async (roleId) => {
    setLoadingPermissions(true);
    try {
      const response = await axios.get(
        `${api_url}/master-role-permission/${roleId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        setSelectedRoleData(response.data.data.role);
        const permissions = response.data.data.permissions || [];
        setRolePermissions(permissions);
        
        // Mark permissions as checked based on role permissions
        const updatedPermissions = allPermissions.map(perm => ({
          ...perm,
          enabled: permissions.some(p => p.id === perm.id)
        }));
        setAllPermissions(updatedPermissions);
        
        // toast.success(`Loaded permissions for ${response.data.data.role.name}`);
      } else {
        // If no permissions found, just set empty array
        setRolePermissions([]);
        const resetPermissions = allPermissions.map(perm => ({
          ...perm,
          enabled: false
        }));
        setAllPermissions(resetPermissions);
      }
    } catch (err) {
      console.error("Error fetching role permissions:", err);
      toast.error(err.response?.data?.message || "Failed to load role permissions");
      // Reset all permissions to unchecked
      const resetPermissions = allPermissions.map(perm => ({
        ...perm,
        enabled: false
      }));
      setAllPermissions(resetPermissions);
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRoles();
      fetchAllPermissions();
    }
  }, [token]);

  const handleRoleChange = async (e) => {
    const roleId = parseInt(e.target.value);
    setSelectedRole(roleId || '');
    
    if (roleId) {
      await fetchRolePermissions(roleId);
    } else {
      // Reset permissions
      const resetPermissions = allPermissions.map(perm => ({
        ...perm,
        enabled: false
      }));
      setAllPermissions(resetPermissions);
      setRolePermissions([]);
      setSelectedRoleData(null);
    }
  };

  const handleToggle = (permissionId) => {
    setAllPermissions((prev) =>
      prev.map((p) => 
        p.id === permissionId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const handleGroupToggle = (groupName) => {
    const groupPermissions = allPermissions.filter(p => p.group_name === groupName);
    const allEnabled = groupPermissions.every(p => p.enabled);
    
    setAllPermissions((prev) =>
      prev.map((p) => 
        p.group_name === groupName ? { ...p, enabled: !allEnabled } : p
      )
    );
  };

  const handleSelectAll = () => {
    const allOn = allPermissions.every((p) => p.enabled);
    setAllPermissions((prev) => prev.map((p) => ({ ...p, enabled: !allOn })));
  };

  const handleSave = async () => {
    if (!selectedRole) {
      toast.warning('Please select a role first');
      return;
    }

    // Get selected permission IDs
    const selectedPermissionIds = allPermissions
      .filter(p => p.enabled)
      .map(p => p.id);

    if (selectedPermissionIds.length === 0) {
      toast.warning('Please select at least one permission');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(
        `${api_url}/create-update-master-role-permission`,
        {
          project_role_id: selectedRole,
          permission_ids: selectedPermissionIds
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1) {
        toast.success(`Permissions saved successfully for ${selectedRoleData?.name || 'role'}!`);
        // Refresh the role permissions
        await fetchRolePermissions(selectedRole);
      } else {
        toast.error(response.data.message || "Failed to save permissions");
      }
    } catch (err) {
      console.error("Error saving permissions:", err);
      toast.error(err.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (groupName) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Group permissions by group_name
  const groupedPermissions = allPermissions.reduce((groups, permission) => {
    const group = permission.group_name || 'other';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(permission);
    return groups;
  }, {});

  const getEnabledCount = () => {
    return allPermissions.filter(p => p.enabled).length;
  };

  const getGroupEnabledCount = (groupName) => {
    return allPermissions.filter(p => p.group_name === groupName && p.enabled).length;
  };

  const getRoleName = () => {
    if (!selectedRoleData) return '';
    return selectedRoleData.name;
  };

  const enabledCount = getEnabledCount();
  const totalPermissions = allPermissions.length;
  const allOn = totalPermissions > 0 && enabledCount === totalPermissions;

  // Format group name for display
  const formatGroupName = (groupName) => {
    return groupName.charAt(0).toUpperCase() + groupName.slice(1);
  };

  return (
    <div className="pp-container">
      {/* Header */}
      <div className="pp-header">
        <h1 className="pp-title">Project Permission Master</h1>
        <p className="pp-subtitle">Manage role-based permissions for projects, modules, tasks, and more</p>
      </div>

      {/* Role Selector */}
      <div className="pp-role-card">
        <label htmlFor="role_select" className="pp-label">
          Select Role <span className="pp-req">*</span>
        </label>
        <select
          id="role_select"
          className="pp-select"
          value={selectedRole}
          onChange={handleRoleChange}
          disabled={loading}
        >
          <option value="">— Choose a role —</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {loading && (
          <div className="pp-loading-small">
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>Loading roles...</span>
          </div>
        )}
      </div>

      {/* Permissions Card */}
      {selectedRole && (
        <div className="pp-perm-card">
          {/* Card Header */}
          <div className="pp-perm-head">
            <div>
              <h3 className="pp-perm-head-title">
                Permissions for: <span className="pp-role-accent">{getRoleName()}</span>
              </h3>
              <p className="pp-perm-count">
                {enabledCount} of {totalPermissions} permissions enabled
              </p>
            </div>
            <div className="pp-head-actions">
              <button
                className="pp-btn-selall"
                onClick={handleSelectAll}
                disabled={loadingPermissions || totalPermissions === 0}
              >
                {allOn ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Permissions Groups */}
          {loadingPermissions ? (
            <div className="pp-loading">
              <div className="pp-spinner" />
              <p>Loading permissions...</p>
            </div>
          ) : (
            <>
              <div className="pp-perm-groups">
                {Object.keys(groupedPermissions).map((groupName) => {
                  const permissions = groupedPermissions[groupName];
                  const groupEnabledCount = getGroupEnabledCount(groupName);
                  const isExpanded = expandedGroups.has(groupName);
                  
                  return (
                    <div key={groupName} className="pp-perm-group">
                      <div 
                        className="pp-perm-group-header"
                        onClick={() => toggleGroup(groupName)}
                      >
                        <div className="pp-group-info">
                          <FontAwesomeIcon 
                            icon={groupIcons[groupName] || groupIcons.default} 
                            className="pp-group-icon"
                          />
                          <div>
                            <h4 className="pp-group-title">{formatGroupName(groupName)}</h4>
                            <span className="pp-group-count">
                              {groupEnabledCount}/{permissions.length} permissions
                            </span>
                          </div>
                        </div>
                        <div className="pp-group-actions">
                          <button 
                            className="pp-group-select-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGroupToggle(groupName);
                            }}
                          >
                            {groupEnabledCount === permissions.length ? 'Deselect Group' : 'Select Group'}
                          </button>
                          {/* <FontAwesomeIcon 
                            icon={isExpanded ? faSpinner : faSpinner} 
                            className={`pp-group-arrow ${isExpanded ? 'expanded' : ''}`}
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          /> */}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="pp-perm-group-content">
                          <div className="pp-perm-grid">
                            {permissions.map((perm) => (
                              <div
                                key={perm.id}
                                className={`pp-perm-item ${perm.enabled ? 'is-on' : 'is-off'}`}
                                onClick={() => handleToggle(perm.id)}
                              >
                                <div className={`pp-checkbox ${perm.enabled ? 'checked' : ''}`}>
                                  {perm.enabled && (
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                  )}
                                </div>
                                <span className="pp-perm-name">
                                  {perm.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="pp-perm-footer">
                <div className="pp-footer-stats">
                  <div className="pp-stat-item">
                    <FontAwesomeIcon icon={faCheckCircle} className="pp-stat-icon" />
                    <span><strong>{enabledCount}</strong> Enabled</span>
                  </div>
                  <div className="pp-stat-item">
                    <FontAwesomeIcon icon={faTimesCircle} className="pp-stat-icon" />
                    <span><strong>{totalPermissions - enabledCount}</strong> Disabled</span>
                  </div>
                </div>
                <button 
                  className="pp-btn-save" 
                  onClick={handleSave} 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Save Permissions
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedRole && !loading && (
        <div className="pp-empty">
          <div className="pp-empty-icon">
            <FontAwesomeIcon icon={faShieldAlt} />
          </div>
          <div>
            <h4 className="pp-empty-title">No role selected</h4>
            <p className="pp-empty-sub">
              Choose a role from the dropdown above to view and manage its permissions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpProjectPermissionMaster;