import React, { useState, useEffect } from 'react';
import { getAssets, registerAsset } from '../../api/assetApi';
import { getAssetCategories, getDepartments } from '../../api/organizationApi';
import { getSession } from '../../utils/session';
// We also need allocations and maintenance for history, we can import them from mockData for now, 
// or create endpoints. The prompt says "pull from the shared mock allocation/maintenance arrays".
import { mockAllocations, mockMaintenanceRequests } from '../../api/mockData';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  // New Asset Form State
  const [formData, setFormData] = useState({
    name: '', category: '', serialNumber: '', acquisitionDate: '', acquisitionCost: '', condition: 'Good', location: '', shared: false, department: '', customFields: {}
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetsData, catsData, deptsData] = await Promise.all([
        getAssets(), // fetch all
        getAssetCategories(),
        getDepartments()
      ]);
      setAssets(assetsData);
      setCategories(catsData);
      setDepartments(deptsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerAsset(formData);
    setShowModal(false);
    setFormData({ name: '', category: '', serialNumber: '', acquisitionDate: '', acquisitionCost: '', condition: 'Good', location: '', shared: false, department: '', customFields: {} });
    loadData(); // Refresh list
  };

  const handleCategoryChange = (e) => {
    const catName = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: catName,
      customFields: {} // reset custom fields on category change
    }));
  };

  const handleCustomFieldChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value
      }
    }));
  };

  const selectedCategoryObj = categories.find(c => c.name === formData.category);

  // Client-side filtering
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      (asset.tag && asset.tag.toLowerCase().includes(search.toLowerCase())) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(search.toLowerCase())) ||
      (asset.location && asset.location.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter ? asset.category === categoryFilter : true;
    const matchesStatus = statusFilter ? asset.status === statusFilter : true;
    const matchesDept = departmentFilter ? asset.department === departmentFilter : true;
    return matchesSearch && matchesCategory && matchesStatus && matchesDept;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Allocated': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Under Maintenance': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Lost': case 'Retired': case 'Disposed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const session = getSession();
  const canRegister = session.role === 'Admin' || session.role === 'Asset Manager';

  return (
    <div className="w-full">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 min-h-[500px]">
        
        {/* Top Bar: Title & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-white">Asset Directory</h2>
          
          {canRegister && (
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20">
              <PlusIcon /> Register New Asset
            </button>
          )}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, tag, serial, location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
            />
          </div>
          <select 
            value={departmentFilter} 
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        {/* Assets Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Asset Details</th>
                <th className="px-6 py-4 font-semibold">Category & Dept</th>
                <th className="px-6 py-4 font-semibold">Location & Cond.</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading assets...</td></tr>
              ) : filteredAssets.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No assets found matching your criteria.</td></tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-800 p-2 rounded-lg text-slate-400 border border-slate-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-2">
                            {asset.name}
                            {asset.shared && <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Bookable</span>}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">Tag: {asset.tag} | SN: {asset.serialNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-200">{asset.category}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{asset.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-200">{asset.location}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Cond: <span className={asset.condition === 'Excellent' || asset.condition === 'Good' ? 'text-emerald-400' : 'text-orange-400'}>{asset.condition}</span></p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                      {asset.status === 'Allocated' && asset.assignedTo && (
                        <p className="text-xs text-slate-500 mt-1.5 ml-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          {asset.assignedTo}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedAsset(asset)} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <Modal title={`Asset Details: ${selectedAsset.name}`} onClose={() => setSelectedAsset(null)} wide>
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Tag</p>
                <p className="text-sm font-semibold text-white">{selectedAsset.tag}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Serial Number</p>
                <p className="text-sm font-semibold text-white">{selectedAsset.serialNumber}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(selectedAsset.status)}`}>{selectedAsset.status}</span>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Acquisition Cost</p>
                <p className="text-sm font-semibold text-white">${selectedAsset.acquisitionCost}</p>
              </div>
            </div>

            {selectedAsset.customFields && Object.keys(selectedAsset.customFields).length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-white mb-3">Custom Attributes</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(selectedAsset.customFields).map(([k, v]) => (
                    <div key={k} className="bg-slate-800/30 border border-slate-700/50 p-2 rounded">
                      <p className="text-[10px] uppercase text-slate-500 tracking-wider mb-0.5">{k}</p>
                      <p className="text-sm text-slate-300">{v || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-white mb-3">Allocation History</h4>
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-2 font-medium">Assigned To</th>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {mockAllocations.filter(a => a.assetId === selectedAsset.id).map(a => (
                      <tr key={a.id}>
                        <td className="px-4 py-2">{a.assignedTo}</td>
                        <td className="px-4 py-2">{a.assignedDate}</td>
                        <td className="px-4 py-2">{a.status}</td>
                      </tr>
                    ))}
                    {mockAllocations.filter(a => a.assetId === selectedAsset.id).length === 0 && (
                      <tr><td colSpan="3" className="px-4 py-4 text-center text-slate-500">No allocation history</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">Maintenance History</h4>
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Issue</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {mockMaintenanceRequests.filter(m => m.assetId === selectedAsset.id).map(m => (
                      <tr key={m.id}>
                        <td className="px-4 py-2">{m.date}</td>
                        <td className="px-4 py-2">{m.issue}</td>
                        <td className="px-4 py-2">{m.status}</td>
                      </tr>
                    ))}
                    {mockMaintenanceRequests.filter(m => m.assetId === selectedAsset.id).length === 0 && (
                      <tr><td colSpan="3" className="px-4 py-4 text-center text-slate-500">No maintenance history</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* Registration Modal */}
      {showModal && (
        <Modal title="Register New Asset" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Asset Tag (Auto-Generated)</label>
              <input readOnly value="Will be generated on submit" className="w-full bg-slate-900/50 border border-slate-800 text-slate-500 rounded-lg p-2.5 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Asset Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g. Dell Monitor 24''" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Category</label>
                <select required value={formData.category} onChange={handleCategoryChange} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Department</label>
                <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
                  <option value="">Select...</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Dynamic Custom Fields */}
            {selectedCategoryObj && selectedCategoryObj.attributes && selectedCategoryObj.attributes.length > 0 && (
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category Specific Details</h4>
                {selectedCategoryObj.attributes.map(attr => (
                  <div key={attr}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{attr}</label>
                    <input 
                      type="text" 
                      value={formData.customFields[attr] || ''} 
                      onChange={e => handleCustomFieldChange(attr, e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500" 
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Serial Number</label>
                <input required value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} type="text" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Condition</label>
                <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
                  <option>New</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Acquisition Date</label>
                <input required type="date" value={formData.acquisitionDate} onChange={e => setFormData({...formData, acquisitionDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Cost ($)</label>
                <input required type="number" value={formData.acquisitionCost} onChange={e => setFormData({...formData, acquisitionCost: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500" />
                <p className="text-[10px] text-slate-500 mt-1">For reporting/ranking only — not linked to accounting</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Location / Room</label>
              <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} type="text" placeholder="e.g. Server Room A" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg mt-2">
              <input 
                type="checkbox" 
                id="shared" 
                checked={formData.shared}
                onChange={e => setFormData({...formData, shared: e.target.checked})}
                className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label htmlFor="shared" className="text-sm font-medium text-white cursor-pointer">
                Mark as Shared/Bookable Resource
                <p className="text-xs text-slate-400 font-normal">Allows users to book this asset for specific time slots.</p>
              </label>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg mt-6 shadow-lg shadow-indigo-900/20 transition-colors">
              Complete Registration
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Reusable Modal Component
const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
      <div className="flex justify-between items-center p-5 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div className="p-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

export default Assets;
