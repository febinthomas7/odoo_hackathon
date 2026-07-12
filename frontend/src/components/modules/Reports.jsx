import React, { useState, useEffect } from 'react';
import { getReportsData } from '../../api/reportsApi';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const result = await getReportsData();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading reports...</div>;
  }

  if (!data) return null;

  return (
    <div className="w-full space-y-6">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white">Reports & Analytics</h3>
        <p className="text-sm text-slate-400 mt-1">Actionable operational insights across your organization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Asset Utilization Trends */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
          <h4 className="text-lg font-bold text-white mb-6">Asset Utilization by Category</h4>
          <div className="space-y-6">
            {data.utilization.map(item => (
              <div key={item.category}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">{item.category}</span>
                  <span className="text-indigo-400 font-bold">{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Allocation Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
          <h4 className="text-lg font-bold text-white mb-6">Department-wise Allocation</h4>
          <div className="space-y-6">
            {data.departmentAllocation.map(item => {
              const maxCount = Math.max(...data.departmentAllocation.map(d => d.count));
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.dept}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-medium">{item.dept}</span>
                    <span className="text-emerald-400 font-bold">{item.count} assets</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Maintenance Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 lg:col-span-2">
          <h4 className="text-lg font-bold text-white mb-6">Maintenance Frequency (Top Incidents)</h4>
          <div className="flex flex-col sm:flex-row gap-4 h-48 items-end justify-around pb-6 border-b border-slate-800/50">
            {data.maintenance.map(item => {
              const maxIncidents = Math.max(...data.maintenance.map(d => d.incidents));
              const height = (item.incidents / maxIncidents) * 100;
              return (
                <div key={item.asset} className="flex flex-col items-center gap-3 w-full sm:w-auto">
                  <div className="w-16 bg-orange-500/80 rounded-t-sm hover:bg-orange-500 transition-colors relative group" style={{ height: `${height}%` }}>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.incidents}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium text-center">{item.asset}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
