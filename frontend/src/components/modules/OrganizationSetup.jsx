import React, { useState, useEffect } from 'react';
import { getDepartments, getAssetCategories, getEmployees, promoteEmployee, addDepartment, updateDepartment, addAssetCategory, updateAssetCategory } from '../../api/organizationApi';

// Custom SVGs
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>;
const TagsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414l8.204 8.204a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [deptData, catData, empData] = await Promise.all([
      getDepartments(),
      getAssetCategories(),
      getEmployees()
    ]);
    setDepartments(deptData);
    setCategories(catData);
    setEmployees(empData);
    setLoading(false);
  };

  const handlePromote = async (id, newRole) => {
    const res = await promoteEmployee(id, newRole);
    if(res.success) {
      setEmployees(employees.map(emp => emp.id === id ? { ...emp, role: newRole } : emp));
      alert(`Role updated successfully to ${newRole}`);
    }
  };

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl mb-6 w-full max-w-2xl border border-slate-800">
        <TabButton 
          active={activeTab === 'departments'} 
          onClick={() => setActiveTab('departments')}
          icon={<BuildingIcon />}
          label="Departments"
        />
        <TabButton 
          active={activeTab === 'categories'} 
          onClick={() => setActiveTab('categories')}
          icon={<TagsIcon />}
          label="Asset Categories"
        />
        <TabButton 
          active={activeTab === 'employees'} 
          onClick={() => setActiveTab('employees')}
          icon={<UsersIcon />}
          label="Employee Directory"
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">Loading data...</div>
        ) : (
          <>
            {activeTab === 'departments' && <DepartmentsTab data={departments} employees={employees} onAdd={async (d) => { await addDepartment(d); fetchData(); }} onUpdate={async (id, d) => { await updateDepartment(id, d); fetchData(); }} />}
            {activeTab === 'categories' && <CategoriesTab data={categories} onAdd={async (c) => { await addAssetCategory(c); fetchData(); }} onUpdate={async (id, c) => { await updateAssetCategory(id, c); fetchData(); }} />}
            {activeTab === 'employees' && <EmployeesTab data={employees} onPromote={handlePromote} />}
          </>
        )}
      </div>
    </div>
  );
};

/* --- Tab Content Components --- */

const DepartmentsTab = ({ data, employees, onAdd, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  
  const [name, setName] = useState('');
  const [headId, setHeadId] = useState('');
  const [parentId, setParentId] = useState('');
  const [status, setStatus] = useState('Active');

  const openAdd = () => { setEditingDept(null); setName(''); setHeadId(''); setParentId(''); setStatus('Active'); setShowModal(true); };
  const openEdit = (dept) => { setEditingDept(dept); setName(dept.name); setHeadId(dept.headId || ''); setParentId(dept.parent || ''); setStatus(dept.status); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, headId: headId ? parseInt(headId) : null, parent: parentId ? parseInt(parentId) : null, status };
    if(editingDept) {
      onUpdate(editingDept.id, payload);
    } else {
      onAdd(payload);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Department Management</h3>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
          <PlusIcon /> Add Department
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Department Name</th>
              <th className="px-6 py-4 font-semibold">Head of Department</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((dept) => {
              const headEmp = employees.find(e => e.id === dept.headId);
              const parentDept = data.find(d => d.id === dept.parent);
              return (
              <tr key={dept.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 font-medium text-white">
                  {dept.name}
                  {parentDept && <div className="text-xs text-slate-500 font-normal mt-0.5">Sub of: {parentDept.name}</div>}
                </td>
                <td className="px-6 py-4">{headEmp ? headEmp.name : <span className="text-slate-500 italic">Unassigned</span>}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${dept.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                    {dept.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(dept)} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm">Edit</button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingDept ? "Edit Department" : "Add Department"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Department Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Head of Department</label>
              <select value={headId} onChange={e => setHeadId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
                <option value="">-- Unassigned --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Parent Department</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
                <option value="">-- None (Top Level) --</option>
                {data.filter(d => !editingDept || d.id !== editingDept.id).map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg mt-4">
              {editingDept ? "Save Changes" : "Create Department"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const CategoriesTab = ({ data, onAdd, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [attrs, setAttrs] = useState([]);
  const [newAttr, setNewAttr] = useState('');

  const openAdd = () => { setEditingCategory(null); setName(''); setAttrs([]); setNewAttr(''); setShowModal(true); };
  const openEdit = (cat) => { setEditingCategory(cat); setName(cat.name); setAttrs([...cat.attributes]); setNewAttr(''); setShowModal(true); };

  const handleAddAttr = () => {
    if (newAttr.trim() && !attrs.includes(newAttr.trim())) {
      setAttrs([...attrs, newAttr.trim()]);
      setNewAttr('');
    }
  };

  const handleRemoveAttr = (index) => {
    setAttrs(attrs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(editingCategory) {
      onUpdate(editingCategory.id, { name, attributes: attrs });
    } else {
      onAdd({ name, attributes: attrs });
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Asset Categories</h3>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
          <PlusIcon /> Add Category
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((cat) => (
          <div key={cat.id} className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-white">{cat.name}</h4>
              <button onClick={() => openEdit(cat)} className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase font-semibold">Custom Attributes</p>
              <div className="flex flex-wrap gap-2">
                {cat.attributes.map((attr, idx) => (
                  <span key={idx} className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1 rounded border border-slate-700">
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editingCategory ? "Edit Asset Category" : "Add Asset Category"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Category Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Vehicles" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Custom Attributes</label>
              <div className="flex gap-2 mb-2">
                <input 
                  value={newAttr} 
                  onChange={e => setNewAttr(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAttr())}
                  type="text" 
                  placeholder="e.g. License Plate" 
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500" 
                />
                <button type="button" onClick={handleAddAttr} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-lg font-semibold">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {attrs.map((attr, idx) => (
                  <span key={idx} className="bg-slate-700 flex items-center gap-1 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-600">
                    {attr}
                    <button type="button" onClick={() => handleRemoveAttr(idx)} className="text-slate-400 hover:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </span>
                ))}
                {attrs.length === 0 && <span className="text-slate-500 text-xs italic">No custom attributes added yet.</span>}
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg mt-4">
              {editingCategory ? "Save Changes" : "Create Category"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const EmployeesTab = ({ data, onPromote }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = data.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-white">Employee Directory & Roles</h3>
        <div className="w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search name or dept..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Name & Email</th>
              <th className="px-6 py-4 font-semibold">Department</th>
              <th className="px-6 py-4 font-semibold">System Role</th>
              <th className="px-6 py-4 font-semibold text-right">Promote Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredData.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-white">{emp.name}</p>
                  <p className="text-sm text-slate-500">{emp.email}</p>
                </td>
                <td className="px-6 py-4">{emp.department}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    emp.role === 'Department Head' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                    emp.role === 'Asset Manager' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    'bg-slate-700 text-slate-300 border-slate-600'
                  }`}>
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select 
                    className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) onPromote(emp.id, e.target.value);
                    }}
                  >
                    <option value="" disabled>Change Role...</option>
                    <option value="Employee">Employee</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Department Head">Department Head</option>
                  </select>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* --- Shared UI --- */

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`}
  >
    {icon}
    {label}
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

export default OrganizationSetup;
