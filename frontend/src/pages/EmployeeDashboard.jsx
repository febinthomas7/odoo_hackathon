import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// Modules
import DashboardOverview from '../components/modules/DashboardOverview';
import AllocationTransfer from '../components/modules/AllocationTransfer';
import ResourceBooking from '../components/modules/ResourceBooking';
import Maintenance from '../components/modules/Maintenance';
import Audit from '../components/modules/Audit';
import Notifications from '../components/modules/Notifications';

const EmployeeDashboard = () => {
  const [activeModule, setActiveModule] = useState('Dashboard');

  const modules = [
    "Dashboard",
    "Allocation & Transfer",
    "Resource Booking",
    "Maintenance",
    "Audit",
    "Notifications",
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'Dashboard':
        return <DashboardOverview />;
      case 'Allocation & Transfer':
        return <AllocationTransfer />;
      case 'Resource Booking':
        return <ResourceBooking />;
      case 'Maintenance':
        return <Maintenance />;
      case 'Audit':
        return <Audit />;
      case 'Notifications':
        return <Notifications />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200">
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        modules={modules} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar activeModule={activeModule} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-white mb-6">{activeModule} Overview</h1>
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
