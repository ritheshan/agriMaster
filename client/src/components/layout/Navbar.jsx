import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, handleLogout } = useAuth();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-primary-700 shadow-lg">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/assets/logo.svg" 
                alt="AgriMaster Logo" 
                className="h-10 w-10" 
              />
              <span className="ml-2 text-xl font-bold text-white">AgriMaster</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'bg-primary-900 text-white' 
                    : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                }`}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard') 
                        ? 'bg-primary-900 text-white' 
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    to="/crop" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/crop') 
                        ? 'bg-primary-900 text-white' 
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                    }`}
                  >
                    Crops
                  </Link>
                  
                  <Link 
                    to="/field" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/field') 
                        ? 'bg-primary-900 text-white' 
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                    }`}
                  >
                    Fields
                  </Link>
                  
                  <Link 
                    to="/weather" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/weather') 
                        ? 'bg-primary-900 text-white' 
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                    }`}
                  >
                    Weather
                  </Link>
                  
                  <Link 
                    to="/community" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/community') 
                        ? 'bg-primary-900 text-white' 
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                    }`}
                  >
                    Community
                  </Link>
                  
                  <Link 
                    to="/calculator" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/calculator') 
                        ? 'bg-primary-900 text-white' 
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                    }`}
                  >
                    Calculator
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-primary-100 hover:bg-primary-600 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/login') 
                        ? 'bg-primary-900 text-white' 
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                    }`}
                  >
                    Login
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className="px-3 py-2 rounded-md text-sm font-medium bg-accent-500 text-primary-800 hover:bg-accent-400"
                  >
                    Register
                  </Link>
                </>
              )}
              
              <Link 
                to="/contact" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/contact') 
                    ? 'bg-primary-900 text-white' 
                    : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              type="button" 
              className="mobile-menu-button p-2 rounded-md text-primary-200 hover:text-white focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="hidden mobile-menu md:hidden p-2">
        <Link 
          to="/" 
          className={`block px-3 py-2 rounded-md text-base font-medium ${
            isActive('/') 
              ? 'bg-primary-900 text-white' 
              : 'text-primary-100 hover:bg-primary-600 hover:text-white'
          }`}
        >
          Home
        </Link>
        
        {isAuthenticated ? (
          <>
            <Link 
              to="/dashboard" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard') 
                  ? 'bg-primary-900 text-white' 
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            
            <Link 
              to="/crop" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/crop') 
                  ? 'bg-primary-900 text-white' 
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`}
            >
              Crops
            </Link>
            
            <Link 
              to="/field" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/field') 
                  ? 'bg-primary-900 text-white' 
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`}
            >
              Fields
            </Link>
            
            <Link 
              to="/weather" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/weather') 
                  ? 'bg-primary-900 text-white' 
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`}
            >
              Weather
            </Link>
            
            <Link 
              to="/community" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/community') 
                  ? 'bg-primary-900 text-white' 
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`}
            >
              Community
            </Link>
            
            <Link 
              to="/calculator" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/calculator') 
                  ? 'bg-primary-900 text-white' 
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`}
            >
              Calculator
            </Link>
            
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-600 hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/login') 
                  ? 'bg-primary-900 text-white' 
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`}
            >
              Login
            </Link>
            
            <Link 
              to="/register" 
              className="block px-3 py-2 rounded-md text-base font-medium bg-accent-500 text-primary-800 hover:bg-accent-400"
            >
              Register
            </Link>
          </>
        )}
        
        <Link 
          to="/contact" 
          className={`block px-3 py-2 rounded-md text-base font-medium ${
            isActive('/contact') 
              ? 'bg-primary-900 text-white' 
              : 'text-primary-100 hover:bg-primary-600 hover:text-white'
          }`}
        >
          Contact
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
