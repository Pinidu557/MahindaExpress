import React, { useState } from 'react';
import StaffList from '../components/StaffList.jsx';
import StaffProfile from '../components/StaffProfile.jsx';
import AssignStaff from '../components/AssignStaff.jsx';
import CreateStaffForm from '../components/CreateStaffForm.jsx';

export default function Staff() {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Staff List</h2>
        <StaffList key={refreshKey} />
      </div>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Create Staff</h2>
        <CreateStaffForm onCreated={triggerRefresh} />
      </div>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Staff Profile</h2>
        <StaffProfile />
      </div>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Assign Staff</h2>
        <AssignStaff />
      </div>
    </div>
  );
}


