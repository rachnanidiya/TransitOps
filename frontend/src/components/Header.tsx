import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Header: React.FC = () => {
  useEffect(() => {
    // Check if user is logged in, redirect to login if not
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="bg-dark-bg/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-white hover:text-dark-primary transition-colors duration-300">
              TransitOps
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-sm">Welcome,</span>
              <span className="font-medium text-white">
                {JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-primary hover:bg-dark-primary/90 text-white rounded-lg transition-all duration-300 border border-transparent hover:border-dark-primary/50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M11 16l-4-4m0 0L7 7m4 9v3m3-3H9m12 0a9 9 0 100-18 9 9 0 000 18z"></path>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;