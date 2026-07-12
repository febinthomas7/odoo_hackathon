import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../../api/dashboardApi';

// Custom icons to avoid external dependencies
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
const ToolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;

const DashboardOverview = ({ role = 'Admin' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData(role);
        setData(result);
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading Dashboard...</div>;
  }

  if (!data) {
    return <div className="text-red-400">Failed to load data.</div>;
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Today's Overview</h2>
        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider border border-slate-700">
          View: {role === 'Department Head' ? 'Department Only' : role === 'Employee' ? 'Personal' : 'Global'}
        </span>
      </div>

      {/* KPI Grid - HIDE FOR EMPLOYEES */}
      {role !== 'Employee' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KPICard title="Available" value={data.kpi.available} />
          <KPICard title="Allocated" value={data.kpi.allocated} />
          <KPICard title="Maintenance" value={data.kpi.maintenance} />
          <KPICard title="Active Bookings" value={data.kpi.activeBookings} />
          <KPICard title="Pending Transfers" value={data.kpi.pendingTransfers} />
          <KPICard title="Upcoming Returns" value={data.kpi.upcomingReturns} />
        </div>
      )}

      {/* Alerts Section */}
      {data.alerts && data.alerts.map(alert => (
        <div key={alert.id} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-center gap-3 text-red-400 font-medium">
          <AlertIcon />
          <span>{alert.message}</span>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-10">
        <ActionButton icon={<PlusIcon />} label="+ register asset" onClick={() => console.log('register')} />
        <ActionButton icon={<BookIcon />} label="Book resource" onClick={() => console.log('book')} />
        <ActionButton icon={<ToolIcon />} label="Raise requests" onClick={() => console.log('raise')} />
      </div>

      {/* Recent Activity Section */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ActivityIcon /> Recent Activity
        </h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/20">
          <ul className="space-y-4">
            {data.recentActivity && data.recentActivity.map(activity => (
              <li key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
                <span className="text-slate-300 font-medium">{activity.log}</span>
                <span className="text-xs font-semibold text-slate-500 mt-1 sm:mt-0 whitespace-nowrap">{activity.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* --- Sub Components --- */

const KPICard = ({ title, value }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/10 hover:border-slate-700 transition-colors">
    <h4 className="text-slate-400 text-sm font-semibold mb-2">{title}</h4>
    <div className="text-3xl font-bold text-white">{value}</div>
  </div>
);

const ActionButton = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-5 py-2.5 rounded-lg font-semibold transition-all"
  >
    {icon} {label}
  </button>
);

export default DashboardOverview;
