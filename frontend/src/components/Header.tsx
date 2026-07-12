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
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">
              TransitOps
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Welcome,</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;