import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-brand dark:bg-slate-900 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-2xl tracking-tight">
              VibeFlow<span className="text-brand-light">.</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/projects" className="text-white hover:text-gray-200 transition-colors font-medium">Projects</Link>
                <Link to="/reports/time" className="text-white hover:text-gray-200 transition-colors font-medium">Reports</Link>
                <div className="h-6 w-px bg-brand-light/30 mx-1"></div>
                <div className="flex items-center space-x-3">
                  <span className="text-white/80 text-sm hidden md:inline">{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-brand hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-gray-200 transition-colors font-medium">Login</Link>
                <Link
                  to="/register"
                  className="bg-white text-brand hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
