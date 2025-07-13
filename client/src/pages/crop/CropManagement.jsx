import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import cropService from '../../services/cropService';
import { toast } from 'react-toastify';

// This is the main component that will handle routing for crop-related pages
const CropManagement = () => {
  return (
    <Routes>
      <Route index element={<CropList />} />
      <Route path="add" element={<AddEditCrop />} />
      <Route path="edit/:id" element={<AddEditCrop />} />
      <Route path=":id" element={<CropDetail />} />
    </Routes>
  );
};

// Component to list all crops
const CropList = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCrops();
  }, [page, filter, searchTerm]);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const response = await cropService.getUserCrops(page, 10, filter, searchTerm);
      setCrops(response.data.crops);
      setTotalPages(Math.ceil(response.data.totalCount / 10));
    } catch (error) {
      console.error('Failed to fetch crops:', error);
      toast.error('Failed to fetch crops. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cropId) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await cropService.deleteCrop(cropId);
        toast.success('Crop deleted successfully');
        fetchCrops();
      } catch (error) {
        console.error('Failed to delete crop:', error);
        toast.error('Failed to delete crop. Please try again later.');
      }
    }
  };

  const getCropStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'growing':
        return 'bg-green-100 text-green-800';
      case 'harvested':
        return 'bg-yellow-100 text-yellow-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">My Crops</h1>
        <Link
          to="/crop/add"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Add New Crop
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search crops..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="growing">Growing</option>
            <option value="harvested">Harvested</option>
            <option value="planned">Planned</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : crops.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">No crops found</h2>
          <p className="mt-2 text-gray-500">
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your search or filter'
              : "You haven't added any crops yet"}
          </p>
          {!searchTerm && filter === 'all' && (
            <Link
              to="/crop/add"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Add Your First Crop
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <div
                key={crop._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                {crop.images && crop.images[0] && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={crop.images[0]}
                      alt={crop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800">{crop.name}</h3>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getCropStatusColor(crop.status)}`}>
                      {crop.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {crop.field && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Field: {crop.field.name}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Area: {crop.area} {crop.areaUnit}
                    </div>

                    {crop.plantingDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Planted: {new Date(crop.plantingDate).toLocaleDateString()}
                      </div>
                    )}

                    {crop.expectedHarvestDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                        Harvest: {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => navigate(`/crop/${crop._id}`)}
                      className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate(`/crop/edit/${crop._id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(crop._id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setPage(index + 1)}
                    className={`px-3 py-1 rounded-md border ${
                      page === index + 1
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Component for adding and editing crops
const AddEditCrop = () => {
  // This is a placeholder component.
  // The actual implementation will be added in future PRs
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Add/Edit Crop (Coming Soon)
      </h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This feature is under development. Please check back later.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Link to="/crop" className="text-primary-600 hover:text-primary-800 font-medium">
          &larr; Back to Crop List
        </Link>
      </div>
    </div>
  );
};

// Component for viewing crop details
const CropDetail = () => {
  // This is a placeholder component.
  // The actual implementation will be added in future PRs
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Crop Details (Coming Soon)
      </h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This feature is under development. Please check back later.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Link to="/crop" className="text-primary-600 hover:text-primary-800 font-medium">
          &larr; Back to Crop List
        </Link>
      </div>
    </div>
  );
};

export default CropManagement;
