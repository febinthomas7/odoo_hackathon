import React, { useState, useEffect } from 'react';
import { getAllocations, getTransferRequests, allocateAsset, requestTransfer, approveTransfer, returnAsset } from '../../api/allocationApi';
import { getAssets } from '../../api/assetApi';
import { getEmployees } from '../../api/organizationApi';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const AllocationTransfer = () => {
  const [activeTab, setActiveTab] = useState('allocations');
  const [allocations, setAllocations] = useState([]);
  const [transferRequests, setTransferRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allocData, reqData, assetsData, empData] = await Promise.all([
        getAllocations(),
        getTransferRequests(),
        getAssets(), // To list assets available for allocation
        getEmployees() // To list users to assign to
      ]);
      setAllocations(allocData);
      setTransferRequests(reqData);
      setAssets(assetsData);
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

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl mb-6 w-full max-w-md border border-slate-800">
        <TabButton 
          active={activeTab === 'allocations'} 
          onClick={() => setActiveTab('allocations')}
          label="Active Allocations"
        />
        <TabButton 
          active={activeTab === 'requests'} 
          onClick={() => setActiveTab('requests')}
          label="Transfer Requests"
          count={transferRequests.filter(r => r.status === 'Pending').length}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">Loading data...</div>
        ) : (
          <>
            {activeTab === 'allocations' && (
              <AllocationsTab 
                data={allocations} 
                onOpenAllocate={() => setShowAllocateModal(true)}
                onOpenReturn={(alloc) => { setSelectedAllocation(alloc); setShowReturnModal(true); }}
                onOpenTransfer={() => setShowTransferModal(true)}
              />
            )}
            {activeTab === 'requests' && (
              <TransferRequestsTab 
                data={transferRequests} 
                onApprove={async (id) => { await approveTransfer(id); loadData(); }}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showAllocateModal && <AllocateModal assets={assets} employees={employees} onClose={() => setShowAllocateModal(false)} onComplete={loadData} />}
      {showReturnModal && <ReturnModal allocation={selectedAllocation} onClose={() => setShowReturnModal(false)} onComplete={loadData} />}
      {showTransferModal && <TransferModal assets={assets} employees={employees} onClose={() => setShowTransferModal(false)} onComplete={loadData} />}
    </div>
  );
};

/* --- Tab Content Components --- */

const AllocationsTab = ({ data, onOpenAllocate, onOpenReturn, onOpenTransfer }) => {
  const activeOnly = data.filter(a => a.status === 'Active');

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white">Asset Allocations</h3>
        <div className="flex gap-3">
          <button onClick={onOpenTransfer} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-slate-700">
            Request Transfer
          </button>
          <button onClick={onOpenAllocate} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
            <PlusIcon /> Allocate Asset
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Asset Details</th>
              <th className="px-6 py-4 font-semibold">Assigned To</th>
              <th className="px-6 py-4 font-semibold">Timeline</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {activeOnly.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No active allocations.</td></tr>
            ) : (
              activeOnly.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{alloc.assetName}</p>
                    <p className="text-xs text-slate-500">{alloc.assetTag}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-indigo-300">{alloc.assignedTo}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm">Assigned: {alloc.assignedDate}</p>
                    {alloc.expectedReturnDate && (
                      <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Due: {alloc.expectedReturnDate}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onOpenReturn(alloc)} className="text-emerald-400 hover:text-emerald-300 font-medium text-sm border border-emerald-500/30 px-3 py-1.5 rounded-lg bg-emerald-500/10">
                      Mark Returned
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TransferRequestsTab = ({ data, onApprove }) => (
  <div>
    <div className="mb-6">
      <h3 className="text-xl font-bold text-white">Transfer Requests</h3>
      <p className="text-sm text-slate-400 mt-1">Review requests to re-assign currently allocated assets.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.length === 0 ? (
        <p className="text-slate-500 p-4">No transfer requests pending.</p>
      ) : (
        data.map((req) => (
          <div key={req.id} className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{req.assetName}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">{req.assetTag}</p>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${req.status === 'Pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {req.status}
                </span>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Current Holder:</span>
                  <span className="text-slate-300">{req.currentHolder}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Requested By:</span>
                  <span className="text-indigo-300 font-semibold">{req.requestedBy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-300">{req.requestDate}</span>
                </div>
              </div>
            </div>
            {req.status === 'Pending' && (
              <button onClick={() => onApprove(req.id)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <CheckIcon /> Approve Transfer
              </button>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

/* --- Modals --- */

const AllocateModal = ({ assets, employees, onClose, onComplete }) => {
  // Filter assets to only show 'Available' ones (Conflict rule: can't allocate an already taken asset)
  const availableAssets = assets.filter(a => a.status === 'Available');

  const [formData, setFormData] = useState({ assetId: '', assignedToId: '', expectedReturnDate: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await allocateAsset({
      ...formData,
      assignedToId: formData.assignedToId
    }, 1); // Mock adminId = 1
    onComplete();
    onClose();
  };

  return (
    <Modal title="Allocate Asset" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Select Available Asset</label>
          <select required value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
            <option value="">Select Asset...</option>
            {availableAssets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
          </select>
          {availableAssets.length === 0 && <p className="text-xs text-orange-400 mt-2">No available assets. You may need to Request a Transfer instead.</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Assign To</label>
          <select required value={formData.assignedToId} onChange={e => setFormData({...formData, assignedToId: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
            <option value="">Select Employee...</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Expected Return Date (Optional)</label>
          <input type="date" value={formData.expectedReturnDate} onChange={e => setFormData({...formData, expectedReturnDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
        </div>
        <button type="submit" disabled={availableAssets.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg mt-6 shadow-lg shadow-indigo-900/20 transition-colors">
          Confirm Allocation
        </button>
      </form>
    </Modal>
  );
};

const TransferModal = ({ assets, employees, onClose, onComplete }) => {
  // Transfer is for assets that are ALREADY allocated
  const allocatedAssets = assets.filter(a => a.status === 'Allocated');
  
  const [formData, setFormData] = useState({ assetId: '', requestedById: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await requestTransfer({
      assetId: formData.assetId,
    }, parseInt(formData.requestedById));
    onComplete();
    onClose();
  };

  return (
    <Modal title="Request Asset Transfer" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Select Allocated Asset</label>
          <select required value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
            <option value="">Select Asset...</option>
            {allocatedAssets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag}) - held by {a.assignedTo}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Requesting For</label>
          <select required value={formData.requestedById} onChange={e => setFormData({...formData, requestedById: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
            <option value="">Select Employee...</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-500 mt-4">Transfer requests must be approved by an Asset Manager or Department Head before the asset is re-allocated.</p>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg mt-6 shadow-lg shadow-indigo-900/20 transition-colors">
          Submit Request
        </button>
      </form>
    </Modal>
  );
};

const ReturnModal = ({ allocation, onClose, onComplete }) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await returnAsset(allocation.id, notes);
    onComplete();
    onClose();
  };

  return (
    <Modal title="Return Asset" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-800/50 p-4 rounded-lg mb-4 border border-slate-700">
          <p className="text-sm text-slate-300">Returning: <span className="font-bold text-white">{allocation.assetName}</span> ({allocation.assetTag})</p>
          <p className="text-sm text-slate-300">Currently assigned to: <span className="font-bold text-white">{allocation.assignedTo}</span></p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Condition / Check-in Notes</label>
          <textarea required rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe the current condition of the asset upon return..." className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500"></textarea>
        </div>
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg mt-6 shadow-lg shadow-emerald-900/20 transition-colors">
          Confirm Return
        </button>
      </form>
    </Modal>
  );
};


/* --- Shared UI --- */

const TabButton = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`}
  >
    {label}
    {count > 0 && (
      <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white text-indigo-600' : 'bg-slate-700 text-white'}`}>
        {count}
      </span>
    )}
  </button>
);

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

export default AllocationTransfer;
