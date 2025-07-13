import React from 'react';
import { Link } from 'react-router-dom';

const RecentCrops = ({ crops, loading, totalCount }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-md">
              <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Crops</h2>
        <Link to="/crop" className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
          View All ({totalCount})
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      {crops.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="mt-2 text-gray-600">You haven't added any crops yet.</p>
          <Link 
            to="/crop/add" 
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Add Your First Crop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {crops.map((crop) => (
            <Link 
              key={crop._id} 
              to={`/crop/${crop._id}`}
              className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              
              <div className="ml-4 flex-1">
                <div className="font-medium text-gray-800">{crop.name}</div>
                <div className="text-sm text-gray-600">
                  {crop.status} • {crop.area} {crop.areaUnit}
                </div>
              </div>
              
              <div className="text-right">
                {crop.plantingDate && (
                  <div className="text-xs text-gray-500">
                    Planted: {new Date(crop.plantingDate).toLocaleDateString()}
                  </div>
                )}
                {crop.expectedYield && (
                  <div className="text-sm font-medium text-gray-700">
                    {crop.expectedYield} {crop.yieldUnit}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentCrops;
