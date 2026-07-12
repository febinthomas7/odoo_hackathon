import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Yahan actual API call aayegi future mein
    navigate('/dashboard');
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[128px] animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[128px] animate-blob animation-delay-2000" />
      
      {/* Login Card (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-[400px] mx-4 px-8 py-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        
        {/* Header & Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex justify-center items-center text-xl font-bold text-white shadow-lg mb-4 ring-2 ring-white/10">
            AF
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-wide">Welcome to AssetFlow</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage your assets</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="name@company.com" 
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 px-3 text-white text-base outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
              <a href="#forgot" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
            </div>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 px-3 text-white text-base outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="mt-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium py-3 rounded-lg text-base shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px w-full bg-white/10"></div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">New</span>
          <div className="h-px w-full bg-white/10"></div>
        </div>

        <div className="mt-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-lg p-3 text-center mb-3">
            <p className="text-sm text-slate-400 leading-snug">
              Sign up creates an <span className="text-slate-300 font-medium">employee account</span>. 
              Admin roles are assigned later.
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/signup')}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-lg text-base transition-all duration-300"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
