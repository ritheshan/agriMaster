import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-16 px-4 text-center">
      <h1 className="text-6xl md:text-8xl font-bold text-primary-600 mb-8">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium bg-primary-600 hover:bg-primary-700 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Return to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
