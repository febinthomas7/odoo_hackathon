import React, { useState, useEffect } from 'react';
import { getAuditCycles, createAuditCycle, submitAuditResult, closeAuditCycle } from '../../api/auditApi';
import { getAssets } from '../../api/assetApi';
import { getDepartments, getEmployees } from '../../api/organizationApi';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

const Audit = () => {
  const [cycles, setCycles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cycData, deptData, empData, astData] = await Promise.all([
        getAuditCycles(),
        getDepartments(),
        getEmployees(),
        getAssets()
      ]);
      setCycles(cycData);
      setDepartments(deptData);
      setEmployees(empData);
      setAssets(astData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-full">
      {selectedCycle ? (
        <ActiveAuditView 
          cycle={selectedCycle} 
          assets={assets}
          onBack={() => { setSelectedCycle(null); loadData(); }}
          onRefresh={async () => {
             const cycData = await getAuditCycles();
             setCycles(cycData);
             setSelectedCycle(cycData.find(c => c.id === selectedCycle.id));
          }}
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 min-h-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Asset Audits</h3>
              <p className="text-sm text-slate-400 mt-1">Manage structured verification cycles and auto-generate discrepancy reports.</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20">
              <PlusIcon /> Create Audit Cycle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-slate-500 col-span-3">Loading audit cycles...</p>
            ) : cycles.length === 0 ? (
              <p className="text-slate-500 col-span-3">No audit cycles found.</p>
            ) : (
              cycles.map(cycle => (
                <div key={cycle.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg text-white">{cycle.title}</h4>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      cycle.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {cycle.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-slate-400"><span className="text-slate-500 font-medium">Target:</span> {cycle.department}</p>
                    <p className="text-sm text-slate-400"><span className="text-slate-500 font-medium">Timeline:</span> {cycle.startDate} to {cycle.endDate}</p>
                    <p className="text-sm text-slate-400"><span className="text-slate-500 font-medium">Auditors:</span> {cycle.auditors.join(', ')}</p>
                  </div>
                  <button onClick={() => setSelectedCycle(cycle)} className="w-full bg-slate-700/50 hover:bg-slate-700 text-indigo-300 font-semibold py-2.5 rounded-lg transition-colors border border-slate-600/50">
                    {cycle.status === 'Active' ? 'Run Audit' : 'View Report'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateCycleModal 
          departments={departments}
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onComplete={loadData}
        />
      )}
    </div>
  );
};

const ActiveAuditView = ({ cycle, assets, onBack, onRefresh }) => {
  // Filter assets that belong to the department being audited
  const targetAssets = assets.filter(a => a.department === cycle.department);
  
  const handleMark = async (assetId, status) => {
    await submitAuditResult(cycle.id, assetId, status);
    onRefresh();
  };

  const handleClose = async () => {
    if(window.confirm('Are you sure you want to close this audit cycle? This will lock the results.')) {
      await closeAuditCycle(cycle.id);
      onBack();
    }
  };

  const isClosed = cycle.status === 'Closed';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 min-h-[500px]">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {cycle.title}
            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
              isClosed ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {cycle.status}
            </span>
          </h2>
          <p className="text-sm text-slate-400">Auditing {cycle.department} assets.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800 mb-6">
        <table className="w-full text-left text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Asset Tag</th>
              <th className="px-6 py-4 font-semibold">Asset Name</th>
              <th className="px-6 py-4 font-semibold">Current Location</th>
              <th className="px-6 py-4 font-semibold">Audit Result</th>
              {!isClosed && <th className="px-6 py-4 font-semibold text-right">Quick Mark</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {targetAssets.length === 0 ? (
              <tr><td colSpan={isClosed ? 4 : 5} className="px-6 py-8 text-center text-slate-500">No assets found for this department.</td></tr>
            ) : (
              targetAssets.map(asset => {
                const result = cycle.results.find(r => r.assetId === asset.id);
                const currentMark = result ? result.status : 'Pending';
                
                return (
                  <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{asset.tag}</td>
                    <td className="px-6 py-4 font-bold text-white">{asset.name}</td>
                    <td className="px-6 py-4 text-sm">{asset.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        currentMark === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        currentMark === 'Missing' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        currentMark === 'Damaged' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-slate-700 text-slate-300 border-slate-600'
                      }`}>
                        {currentMark}
                      </span>
                    </td>
                    {!isClosed && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleMark(asset.id, 'Verified')} className="text-emerald-400 hover:bg-emerald-500/10 p-2 rounded transition-colors" title="Verified">✓</button>
                        <button onClick={() => handleMark(asset.id, 'Damaged')} className="text-orange-400 hover:bg-orange-500/10 p-2 rounded transition-colors" title="Damaged">⚠</button>
                        <button onClick={() => handleMark(asset.id, 'Missing')} className="text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors" title="Missing">✗</button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isClosed && (
        <div className="flex justify-end">
          <button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-900/20">
            Complete & Close Audit Cycle
          </button>
        </div>
      )}
    </div>
  );
};

const CreateCycleModal = ({ departments, employees, onClose, onComplete }) => {
  const [formData, setFormData] = useState({ title: '', department: '', startDate: '', endDate: '', auditors: [] });
  const [auditorInput, setAuditorInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAuditCycle({
      ...formData,
      auditors: [auditorInput] // Simplified for mock
    });
    onComplete();
    onClose();
  };

  return (
    <Modal title="Create Audit Cycle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Audit Title</label>
          <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Q4 Company Wide Audit" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Target Department</label>
          <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
            <option value="">Select...</option>
            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Start Date</label>
            <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">End Date</label>
            <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Assign Primary Auditor</label>
          <select required value={auditorInput} onChange={e => setAuditorInput(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
            <option value="">Select Employee...</option>
            {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg mt-6 shadow-lg shadow-indigo-900/20 transition-colors">
          Initialize Cycle
        </button>
      </form>
    </Modal>
  );
};

// Reusable Modal Component
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center p-5 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  </div>
);

export default Audit;
