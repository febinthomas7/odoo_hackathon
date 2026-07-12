import React, { useState, useEffect } from 'react';
import { getMaintenanceRequests, raiseRequest, updateRequestStatus } from '../../api/maintenanceApi';
import { getAssets } from '../../api/assetApi';
import { getEmployees } from '../../api/organizationApi';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, astData, empData] = await Promise.all([
        getMaintenanceRequests(),
        getAssets(),
        getEmployees()
      ]);
      setRequests(reqData);
      setAssets(astData);
      setEmployees(empData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400';
      case 'Medium': return 'bg-orange-500/20 text-orange-400';
      case 'Low': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="w-full">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 min-h-[500px]">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Maintenance Management</h3>
            <p className="text-sm text-slate-400 mt-1">Track repairs and maintenance requests through their lifecycle.</p>
          </div>
          <button onClick={() => { setEditingRequest(null); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20">
            <PlusIcon /> Raise Request
          </button>
        </div>
        
        {/* Kanban Board Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {['Pending', 'Approved', 'In Progress', 'Resolved'].map((statusCol) => (
            <div key={statusCol} className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 min-w-[280px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                <h4 className="font-bold text-slate-200">{statusCol}</h4>
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {requests.filter(r => r.status === statusCol).length}
                </span>
              </div>
              
              <div className="space-y-3">
                {requests.filter(r => r.status === statusCol).length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No {statusCol.toLowerCase()} requests.</p>
                ) : (
                  requests.filter(r => r.status === statusCol).map(req => (
                    <div key={req.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-colors cursor-pointer shadow-lg shadow-black/10" onClick={() => { setEditingRequest(req); setShowModal(true); }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${getPriorityColor(req.priority)}`}>
                          {req.priority}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{req.date}</span>
                      </div>
                      <h5 className="font-bold text-white text-sm mb-1">{req.assetName}</h5>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{req.issue}</p>
                      
                      <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-slate-700/50">
                        <div className="flex items-center gap-1 text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span className="truncate max-w-[100px]">{req.reportedBy}</span>
                        </div>
                        {req.technician && (
                          <div className="flex items-center gap-1 text-indigo-400 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                            <span className="truncate max-w-[80px]">{req.technician}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {showModal && (
        <RequestModal 
          request={editingRequest}
          assets={assets} 
          employees={employees} 
          onClose={() => setShowModal(false)} 
          onComplete={loadData} 
        />
      )}
    </div>
  );
};

const RequestModal = ({ request, assets, employees, onClose, onComplete }) => {
  const isEdit = !!request;
  const [formData, setFormData] = useState(
    request || { assetId: '', reportedBy: '', issue: '', priority: 'Medium' }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isEdit) {
      await updateRequestStatus(request.id, {
        status: formData.status,
        technician: formData.technician,
        priority: formData.priority,
        issue: formData.issue
      });
    } else {
      const selectedAsset = assets.find(a => a.id.toString() === formData.assetId);
      await raiseRequest({
        ...formData,
        assetName: selectedAsset.name
      });
    }
    onComplete();
    onClose();
  };

  return (
    <Modal title={isEdit ? "Update Maintenance Request" : "Raise Maintenance Request"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {!isEdit && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Select Asset</label>
              <select required value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
                <option value="">Select...</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Reported By</label>
              <select required value={formData.reportedBy} onChange={e => setFormData({...formData, reportedBy: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
                <option value="">Select Employee...</option>
                {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
              </select>
            </div>
          </>
        )}

        {isEdit && (
          <div className="bg-slate-800/50 p-4 rounded-lg mb-4 border border-slate-700">
            <p className="text-sm text-slate-300">Asset: <span className="font-bold text-white">{request.assetName}</span></p>
            <p className="text-sm text-slate-300">Reported by: <span className="font-medium text-white">{request.reportedBy}</span> on {request.date}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Priority</label>
          <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Issue Description</label>
          <textarea required rows="3" value={formData.issue} onChange={e => setFormData({...formData, issue: e.target.value})} placeholder="Describe the issue..." className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500"></textarea>
        </div>

        {isEdit && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Update Status (Manager/Tech Only)</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
                <option>Pending</option>
                <option>Approved</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Assign Technician</label>
              <input type="text" value={formData.technician || ''} onChange={e => setFormData({...formData, technician: e.target.value})} placeholder="e.g. Mike Mechanic" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </>
        )}

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg mt-6 shadow-lg shadow-indigo-900/20 transition-colors">
          {isEdit ? "Update Request" : "Submit Request"}
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

export default Maintenance;
