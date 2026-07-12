import React from 'react';

const Sidebar = ({ activeModule, setActiveModule, modules }) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex justify-center items-center text-xs font-bold text-white shadow-md">
            AF
          </div>
          <span className="text-lg font-bold text-white tracking-wide">AssetFlow</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {modules.map((module) => (
          <button
            key={module}
            onClick={() => setActiveModule(module)}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeModule === module 
                ? 'bg-indigo-500/10 text-indigo-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {module}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
