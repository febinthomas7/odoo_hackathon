import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../utils/session';

const Navbar = ({ activeModule }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState({ name: 'User', email: '' });

  useEffect(() => {
    const session = getSession();
    if (session.name) {
      setUser({ name: session.name, email: `${session.role} Account` });
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Left side - Mobile menu / Breadcrumb */}
          <div className="flex items-center">
            <span className="text-lg font-semibold text-white md:hidden">AssetFlow</span>
            <span className="text-lg font-semibold text-white hidden md:block">{activeModule}</span>
          </div>

          {/* Right side - Profile Icon & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-sm text-white font-medium truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-1">{user.email}</p>
                </div>
                <div className="px-2 py-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
