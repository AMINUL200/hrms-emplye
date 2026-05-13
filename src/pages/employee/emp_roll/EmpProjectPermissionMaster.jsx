import React, { useState, useEffect } from 'react';
import './EmpProjectPermissionMaster.css';

const EmpProjectPermissionMaster = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const dummyRoles = [
    { id: 1, roll_name: 'Admin' },
    { id: 2, roll_name: 'Employee' },
    { id: 3, roll_name: 'Guest' },
    { id: 4, roll_name: 'Manager' },
    { id: 5, roll_name: 'Supervisor' },
  ];

  const dummyPermissions = {
    1: [
      { id: 1, name: 'View Projects', enabled: true },
      { id: 2, name: 'Create Projects', enabled: true },
      { id: 3, name: 'Edit Projects', enabled: true },
      { id: 4, name: 'Delete Projects', enabled: true },
      { id: 5, name: 'Assign Team Members', enabled: true },
      { id: 6, name: 'View Project Reports', enabled: true },
      { id: 7, name: 'Export Project Data', enabled: true },
      { id: 8, name: 'Manage Project Budget', enabled: true },
    ],
    2: [
      { id: 1, name: 'View Projects', enabled: true },
      { id: 2, name: 'Create Projects', enabled: false },
      { id: 3, name: 'Edit Projects', enabled: false },
      { id: 4, name: 'Delete Projects', enabled: false },
      { id: 5, name: 'Assign Team Members', enabled: false },
      { id: 6, name: 'View Project Reports', enabled: true },
      { id: 7, name: 'Export Project Data', enabled: false },
      { id: 8, name: 'Manage Project Budget', enabled: false },
    ],
    3: [
      { id: 1, name: 'View Projects', enabled: true },
      { id: 2, name: 'Create Projects', enabled: false },
      { id: 3, name: 'Edit Projects', enabled: false },
      { id: 4, name: 'Delete Projects', enabled: false },
      { id: 5, name: 'Assign Team Members', enabled: false },
      { id: 6, name: 'View Project Reports', enabled: false },
      { id: 7, name: 'Export Project Data', enabled: false },
      { id: 8, name: 'Manage Project Budget', enabled: false },
    ],
    4: [
      { id: 1, name: 'View Projects', enabled: true },
      { id: 2, name: 'Create Projects', enabled: true },
      { id: 3, name: 'Edit Projects', enabled: true },
      { id: 4, name: 'Delete Projects', enabled: false },
      { id: 5, name: 'Assign Team Members', enabled: true },
      { id: 6, name: 'View Project Reports', enabled: true },
      { id: 7, name: 'Export Project Data', enabled: true },
      { id: 8, name: 'Manage Project Budget', enabled: false },
    ],
    5: [
      { id: 1, name: 'View Projects', enabled: true },
      { id: 2, name: 'Create Projects', enabled: false },
      { id: 3, name: 'Edit Projects', enabled: true },
      { id: 4, name: 'Delete Projects', enabled: false },
      { id: 5, name: 'Assign Team Members', enabled: false },
      { id: 6, name: 'View Project Reports', enabled: true },
      { id: 7, name: 'Export Project Data', enabled: false },
      { id: 8, name: 'Manage Project Budget', enabled: false },
    ],
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRoles(dummyRoles);
      setLoading(false);
    }, 400);
  }, []);

  const handleRoleChange = (e) => {
    const roleId = parseInt(e.target.value);
    setSelectedRole(roleId || '');
    if (roleId) {
      setLoading(true);
      setTimeout(() => {
        setPermissions((dummyPermissions[roleId] || []).map((p) => ({ ...p })));
        setLoading(false);
      }, 300);
    } else {
      setPermissions([]);
    }
  };

  const handleToggle = (id) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSelectAll = () => {
    const allOn = permissions.every((p) => p.enabled);
    setPermissions((prev) => prev.map((p) => ({ ...p, enabled: !allOn })));
  };

  const handleSave = () => {
    if (!selectedRole) { alert('Please select a role first'); return; }
    setSaving(true);
    setTimeout(() => {
      alert('Permissions saved successfully!');
      setSaving(false);
    }, 800);
  };

  const getRoleName = () => {
    const r = roles.find((r) => r.id === selectedRole);
    return r ? r.roll_name : '';
  };

  const enabledCount = permissions.filter((p) => p.enabled).length;
  const allOn = permissions.length > 0 && permissions.every((p) => p.enabled);

  return (
    <div className="pp-container">
      {/* Header */}
      <div className="pp-header">
        <h1 className="pp-title">Project Permission Master</h1>
        <p className="pp-subtitle">Manage role-based permissions for projects</p>
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
          disabled={loading && !selectedRole}
        >
          <option value="">— Choose a role —</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.roll_name}
            </option>
          ))}
        </select>
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
                {enabledCount} of {permissions.length} permissions enabled
              </p>
            </div>
            <button
              className="pp-btn-selall"
              onClick={handleSelectAll}
              disabled={loading || permissions.length === 0}
            >
              {allOn ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Permissions Grid */}
          {loading ? (
            <div className="pp-loading">
              <div className="pp-spinner" />
              <p>Loading permissions...</p>
            </div>
          ) : (
            <>
              <div className="pp-perm-grid">
                {permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className={`pp-perm-item ${perm.enabled ? 'is-on' : 'is-off'}`}
                    onClick={() => handleToggle(perm.id)}
                  >
                    <div className={`pp-checkbox ${perm.enabled ? 'checked' : ''}`}>
                      {perm.enabled && (
                        <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                          <polyline points="1.5,5 4,7.5 8.5,2.5" />
                        </svg>
                      )}
                    </div>
                    <span className="pp-perm-name">{perm.name}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pp-perm-footer">
                <span className="pp-enabled-badge">
                  <strong>{enabledCount}</strong> / {permissions.length} enabled
                </span>
                <button className="pp-btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Permissions'}
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
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