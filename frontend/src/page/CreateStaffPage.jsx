import React from 'react';
import CreateStaffForm from '../components/CreateStaffForm.jsx';
import QuickNav from '../components/QuickNav.jsx';

export default function CreateStaffPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Create New Staff Member</h1>
        <p className="text-gray-100">Add a new team member to your staff roster</p>
      </div>

      <QuickNav />

      <div className="max-w-4xl mx-auto">
        <CreateStaffForm />
      </div>
    </div>
  );
}

