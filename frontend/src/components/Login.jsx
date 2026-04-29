import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] h-[calc(100vh-64px)] overflow-hidden flex bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10 overflow-y-auto">
        <div className="max-w-md w-full">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">Log in to manage your VibeFlow board</p>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl shadow-brand/5 border border-white/50 dark:border-slate-800/50">
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded-r-xl text-sm text-red-700 dark:text-red-400 font-medium">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-70 mt-6 shadow-lg shadow-brand/20 active:scale-[0.98] text-sm"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform ease-out duration-300 rounded-xl"></div>
                <span className="relative">{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand font-bold hover:text-brand-dark transition-colors border-b-2 border-brand/30 hover:border-brand pb-0.5">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900 border-l border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-purple-600/10 mix-blend-overlay z-10 pointer-events-none"></div>
        <img 
          src="/kanban-animated.svg" 
          alt="VibeFlow Kanban Animation" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
        />
        {/* Glassmorphism overlay card */}
        <div className="absolute bottom-8 left-8 right-8 z-20">
           <div className="backdrop-blur-md bg-white/10 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Master Your Workflow</h2>
              <p className="text-white/80 text-sm">VibeFlow provides a real-time, synchronized environment to track your team's progress beautifully.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
