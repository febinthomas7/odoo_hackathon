import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../../api/dashboardApi';

// Custom SVG Icons
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
const ToolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;

const DashboardOverview = ({ role = 'Admin' }) => {
  // Use passed role directly instead of simulator
  const user = { name: 'Current User', role: role, departmentId: role === 'Department Head' || role === 'Employee' ? 'IT Support' : null };

  // Data state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getDashboardData(user.role);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]); // Refetch when role changes

  // Derive UI permissions
  const isManagerial = ['Admin', 'Asset Manager', 'Department Head'].includes(user.role);
  const isDeptHead = user.role === 'Department Head';
  const canRegisterAsset = user.role === 'Asset Manager';
  const canBookResource = ['Employee', 'Department Head'].includes(user.role);
  const canRaiseMaintenance = user.role === 'Employee';

  return (
    <div className="w-full max-w-5xl">

      <div className="flex items-center justify-end mb-6">
        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider border border-slate-700">
          {isDeptHead ? 'Department View' : user.role === 'Employee' ? 'Personal View' : 'Global View'}
        </span>
      </div>

      {/* --- QUICK ACTIONS PANEL --- */}
      {(canRegisterAsset || canBookResource || canRaiseMaintenance) && (
        <div className="flex flex-wrap gap-4 mb-8">
          {canRegisterAsset && (
            <ActionButton icon={<PlusIcon />} label="Register Asset" color="indigo" />
          )}
          {canBookResource && (
            <ActionButton icon={<BookIcon />} label="Book Resource" color="emerald" />
          )}
          {canRaiseMaintenance && (
            <ActionButton icon={<ToolIcon />} label="Raise Maintenance Request" color="orange" />
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Loading data...</div>
      ) : !data ? (
        <div className="text-red-400 p-4 bg-slate-900 rounded-lg">Failed to load data.</div>
      ) : (
        <>
          {/* --- MANAGERIAL VIEW (KPIs & Alerts) --- */}
          {isManagerial ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <KPICard title="Assets Available" value={data.kpi?.available} />
                <KPICard title="Assets Allocated" value={data.kpi?.allocated} />
                <KPICard title="Maintenance Today" value={data.kpi?.maintenance} />
                <KPICard title="Active Bookings" value={data.kpi?.activeBookings} />
                <KPICard title="Pending Transfers" value={data.kpi?.pendingTransfers} />
                <KPICard title="Upcoming Returns" value={data.kpi?.upcomingReturns} />
              </div>

              <div className="space-y-6">
                {/* Overdue Returns - Visually distinct (Red/Amber) */}
                <div>
                  <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                    <AlertIcon /> Overdue Returns
                  </h3>
                  {data.overdueReturns?.length === 0 ? (
                    <p className="text-sm text-slate-500 bg-slate-900 border border-slate-800 p-4 rounded-xl">No overdue returns at this time.</p>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-red-500/20 text-red-400 font-semibold border-b border-red-500/30">
                          <tr><th className="px-4 py-3">Asset</th><th className="px-4 py-3">Holder</th><th className="px-4 py-3">Due Date</th></tr>
                        </thead>
                        <tbody className="divide-y divide-red-500/20">
                          {data.overdueReturns?.map(item => (
                            <tr key={item.id} className="hover:bg-red-500/10 transition-colors">
                              <td className="px-4 py-3"><span className="font-bold text-red-200">{item.assetName}</span> <span className="text-xs text-red-400/70 ml-2">{item.tag}</span></td>
                              <td className="px-4 py-3">{item.holder} {isDeptHead ? '' : `(${item.dept})`}</td>
                              <td className="px-4 py-3 font-medium text-red-400">{item.due}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Standard Upcoming Returns */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Standard Upcoming Returns</h3>
                  {data.upcomingReturns?.length === 0 ? (
                    <p className="text-sm text-slate-500 bg-slate-900 border border-slate-800 p-4 rounded-xl">No upcoming returns scheduled.</p>
                  ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                          <tr><th className="px-4 py-3">Asset</th><th className="px-4 py-3">Holder</th><th className="px-4 py-3">Due Date</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {data.upcomingReturns?.map(item => (
                            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3"><span className="font-bold text-white">{item.assetName}</span> <span className="text-xs text-slate-500 ml-2">{item.tag}</span></td>
                              <td className="px-4 py-3">{item.holder}</td>
                              <td className="px-4 py-3 text-slate-400">{item.due}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* --- EMPLOYEE VIEW (Personal Tables) --- */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
                <h3 className="text-lg font-bold text-white mb-4">My Assigned Assets</h3>
                {data.assignedAssets?.length === 0 ? (
                  <p className="text-sm text-slate-500">You have no assets assigned to you.</p>
                ) : (
                  <ul className="space-y-3">
                    {data.assignedAssets?.map(asset => (
                      <li key={asset.id} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white">{asset.name}</h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{asset.tag}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Allocated on</span>
                          <span className="text-sm text-slate-300 font-medium">{asset.allocatedOn}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
                <h3 className="text-lg font-bold text-white mb-4">My Upcoming Bookings</h3>
                {data.upcomingBookings?.length === 0 ? (
                  <p className="text-sm text-slate-500">You have no upcoming bookings.</p>
                ) : (
                  <ul className="space-y-3">
                    {data.upcomingBookings?.map(booking => (
                      <li key={booking.id} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white">{booking.resource}</h4>
                          <p className="text-xs text-emerald-400 font-medium mt-0.5">{booking.date}</p>
                        </div>
                        <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-300">
                          {booking.time}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* --- SUB COMPONENTS --- */

const KPICard = ({ title, value }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/10 hover:border-slate-700 transition-colors">
    <h4 className="text-slate-400 text-xs sm:text-sm font-semibold mb-2">{title}</h4>
    <div className="text-3xl font-bold text-white">{value ?? '-'}</div>
  </div>
);

const ActionButton = ({ icon, label, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    orange: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20',
  };
  return (
    <button className={`flex items-center gap-2 border px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${colorClasses[color]}`}>
      {icon} {label}
    </button>
  );
};

export default DashboardOverview;
