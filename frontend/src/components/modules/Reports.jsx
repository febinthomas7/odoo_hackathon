import React, { useState, useEffect } from 'react';
import { getReportsData } from '../../api/reportsApi';

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;

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

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "Asset Utilization by Category\n";
    csvContent += "Category,Utilization (%)\n";
    data.utilization.forEach(item => {
      csvContent += `"${item.category}",${item.percentage}\n`;
    });
    csvContent += "\n";

    csvContent += "Department-wise Allocation\n";
    csvContent += "Department,Asset Count\n";
    data.departmentAllocation.forEach(item => {
      csvContent += `"${item.dept}",${item.count}\n`;
    });
    csvContent += "\n";

    csvContent += "Maintenance Frequency (Top Incidents)\n";
    csvContent += "Asset Name,Incident Count\n";
    data.maintenance.forEach(item => {
      csvContent += `"${item.asset}",${item.incidents}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `assetflow_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading reports...</div>;
  }

  if (!data) return null;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Reports & Analytics</h3>
          <p className="text-sm text-slate-400 mt-1">Actionable operational insights across your organization.</p>
        </div>
        <button onClick={handleExportCSV} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20">
          <DownloadIcon /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Asset Utilization Trends */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
          <h4 className="text-lg font-bold text-white mb-6">Asset Utilization by Category</h4>
          <div className="space-y-6">
            {data.utilization.length === 0 ? (
              <p className="text-slate-500 text-sm">No data available.</p>
            ) : (
              data.utilization.map(item => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-medium">{item.category}</span>
                    <span className="text-indigo-400 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Department Allocation Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
          <h4 className="text-lg font-bold text-white mb-6">Department-wise Allocation</h4>
          <div className="space-y-6">
            {data.departmentAllocation.length === 0 ? (
              <p className="text-slate-500 text-sm">No data available.</p>
            ) : (
              data.departmentAllocation.map(item => {
                const maxCount = Math.max(...data.departmentAllocation.map(d => d.count), 1);
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
              })
            )}
          </div>
        </div>

        {/* Maintenance Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 lg:col-span-2">
          <h4 className="text-lg font-bold text-white mb-6">Maintenance Frequency (Top Incidents)</h4>
          <div className="flex flex-col sm:flex-row gap-4 h-48 items-end justify-around pb-6 border-b border-slate-800/50">
            {data.maintenance.length === 0 ? (
              <p className="text-slate-500 text-sm w-full text-center self-center">No maintenance data available.</p>
            ) : (
              data.maintenance.map(item => {
                const maxIncidents = Math.max(...data.maintenance.map(d => d.incidents), 1);
                const height = (item.incidents / maxIncidents) * 100;
                return (
                  <div key={item.asset} className="flex flex-col items-center gap-3 w-full sm:w-auto h-full justify-end">
                    <div className="w-16 bg-orange-500/80 rounded-t-sm hover:bg-orange-500 transition-colors relative group" style={{ height: `${height}%`, minHeight: item.incidents === 0 ? '4px' : 'auto' }}>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.incidents}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium text-center truncate max-w-[80px]">{item.asset}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
