import React from 'react';

const DashboardOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-32 flex flex-col justify-center">
        <span className="text-slate-400 text-sm">Total Assets</span>
        <span className="text-3xl font-bold text-white mt-2">124</span>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-32 flex flex-col justify-center">
        <span className="text-slate-400 text-sm">Active Allocations</span>
        <span className="text-3xl font-bold text-indigo-400 mt-2">45</span>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-32 flex flex-col justify-center">
        <span className="text-slate-400 text-sm">Pending Audits</span>
        <span className="text-3xl font-bold text-purple-400 mt-2">2</span>
      </div>
    </div>
  );
};

export default DashboardOverview;
