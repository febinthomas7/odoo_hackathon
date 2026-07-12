import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// Modules
import DashboardOverview from '../components/modules/DashboardOverview';
import Assets from '../components/modules/Assets';
import AllocationTransfer from '../components/modules/AllocationTransfer';
import Maintenance from '../components/modules/Maintenance';
import Audit from '../components/modules/Audit';
import Reports from '../components/modules/Reports';
import Notifications from '../components/modules/Notifications';

const AssetManagerDashboard = () => {
  const [activeModule, setActiveModule] = useState('Dashboard');

  const modules = [
    "Dashboard",
    "Assets",
    "Allocation & Transfer",
    "Maintenance",
    "Audit",
    "Reports",
    "Notifications",
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'Dashboard':
        return <DashboardOverview />;
      case 'Assets':
        return <Assets />;
      case 'Allocation & Transfer':
        return <AllocationTransfer />;
      case 'Maintenance':
        return <Maintenance />;
      case 'Audit':
        return <Audit />;
      case 'Reports':
        return <Reports />;
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

export default AssetManagerDashboard;
