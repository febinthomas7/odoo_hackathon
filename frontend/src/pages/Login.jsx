import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, forgotPassword } from '../api/authApi';
import { setSession } from '../utils/session';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await login(email, password);
      // Save session
      setSession(token, user.role, user.name, user.id);
      
      // Route based on role
      switch (user.role) {
        case 'Admin': navigate('/admin-dashboard'); break;
        case 'Asset Manager': navigate('/asset-manager-dashboard'); break;
        case 'Department Head': navigate('/department-head-dashboard'); break;
        default: navigate('/employee-dashboard'); break;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPassword(email);
      setForgotMsg(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}
        {forgotMsg && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg mb-4">{forgotMsg}</div>}

        {!showForgot ? (
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 px-3 text-white text-base outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                required 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</button>
              </div>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 px-3 text-white text-base outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium py-3 rounded-lg text-base shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleForgot}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reset-email" className="text-sm font-medium text-slate-300">Email Address</label>
              <input 
                type="email" 
                id="reset-email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 px-3 text-white text-base outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium py-3 rounded-lg text-base shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button 
              type="button" 
              onClick={() => { setShowForgot(false); setForgotMsg(null); setError(null); }}
              className="mt-2 text-sm text-slate-400 hover:text-white text-center"
            >
              Back to Login
            </button>
          </form>
        )}

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
