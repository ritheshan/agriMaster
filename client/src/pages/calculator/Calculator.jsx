import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import calculatorService from '../../services/calculatorService';

const Calculator = () => {
  // Initial form state
  const initialFormState = {
    cropType: '',
    area: '',
    areaUnit: 'acres',
    seedCost: '',
    fertilizerCost: '',
    pesticideCost: '',
    laborCost: '',
    otherCosts: '',
    expectedYield: '',
    yieldUnit: 'kg',
    expectedPrice: '',
  };

  // State variables
  const [formData, setFormData] = useState(initialFormState);
  const [results, setResults] = useState(null);
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  // Common crop types in India
  const cropTypes = [
    'Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar',
    'Cotton', 'Sugarcane', 'Pulses', 'Vegetables', 'Fruits',
    'Spices', 'Oilseeds', 'Tea', 'Coffee', 'Jute'
  ];

  // Area units
  const areaUnits = [
    { value: 'acres', label: 'Acres' },
    { value: 'hectares', label: 'Hectares' },
    { value: 'sqft', label: 'Square Feet' },
    { value: 'bigha', label: 'Bigha' },
  ];

  // Yield units
  const yieldUnits = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'ton', label: 'Tons' },
    { value: 'quintal', label: 'Quintals' },
  ];

  // Fetch calculation history on component mount
  useEffect(() => {
    fetchCalculationHistory();
  }, []);

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Fetch calculation history
  const fetchCalculationHistory = async () => {
    try {
      setFetchingHistory(true);
      const response = await calculatorService.getCalculationHistory();
      setSavedCalculations(response.data);
    } catch (error) {
      console.error('Error fetching calculation history:', error);
      toast.error('Could not fetch your previous calculations');
    } finally {
      setFetchingHistory(false);
    }
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.cropType) {
      toast.error('Please select a crop type');
      return;
    }
    
    if (!formData.area || isNaN(formData.area) || Number(formData.area) <= 0) {
      toast.error('Please enter a valid area');
      return;
    }
    
    if (!formData.expectedYield || isNaN(formData.expectedYield) || Number(formData.expectedYield) <= 0) {
      toast.error('Please enter a valid expected yield');
      return;
    }
    
    if (!formData.expectedPrice || isNaN(formData.expectedPrice) || Number(formData.expectedPrice) <= 0) {
      toast.error('Please enter a valid expected price');
      return;
    }
    
    // Prepare data for calculation
    const calculationData = {
      ...formData,
      seedCost: Number(formData.seedCost) || 0,
      fertilizerCost: Number(formData.fertilizerCost) || 0,
      pesticideCost: Number(formData.pesticideCost) || 0,
      laborCost: Number(formData.laborCost) || 0,
      otherCosts: Number(formData.otherCosts) || 0,
      area: Number(formData.area),
      expectedYield: Number(formData.expectedYield),
      expectedPrice: Number(formData.expectedPrice),
    };
    
    try {
      setLoading(true);
      // Call API to calculate profit/loss
      const response = await calculatorService.calculateProfit(calculationData);
      setResults(response.data);
      toast.success('Calculation completed successfully');
      
      // Refresh history after saving
      fetchCalculationHistory();
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Failed to calculate profit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData(initialFormState);
    setResults(null);
  };

  // Load a saved calculation
  const loadCalculation = (calculation) => {
    setFormData({
      cropType: calculation.cropType,
      area: calculation.area,
      areaUnit: calculation.areaUnit,
      seedCost: calculation.seedCost,
      fertilizerCost: calculation.fertilizerCost,
      pesticideCost: calculation.pesticideCost,
      laborCost: calculation.laborCost,
      otherCosts: calculation.otherCosts,
      expectedYield: calculation.expectedYield,
      yieldUnit: calculation.yieldUnit,
      expectedPrice: calculation.expectedPrice,
    });
    
    setResults({
      totalCost: calculation.totalCost,
      grossIncome: calculation.grossIncome,
      netProfit: calculation.netProfit,
      roi: calculation.roi,
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profit Calculator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculation Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cost & Revenue Details</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Crop Type */}
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="cropType">
                    Crop Type *
                  </label>
                  <select
                    id="cropType"
                    name="cropType"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.cropType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Crop Type</option>
                    {cropTypes.map((crop) => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                
                {/* Area */}
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2" htmlFor="area">
                      Area *
                    </label>
                    <input
                      type="number"
                      id="area"
                      name="area"
                      min="0.01"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="w-1/3">
                    <label className="block text-gray-700 mb-2" htmlFor="areaUnit">
                      Unit
                    </label>
                    <select
                      id="areaUnit"
                      name="areaUnit"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.areaUnit}
                      onChange={handleInputChange}
                    >
                      {areaUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-700 col-span-2 mt-2">Input Costs</h3>

                {/* Seed Cost */}
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="seedCost">
                    Seed Cost (₹)
                  </label>
                  <input
                    type="number"
                    id="seedCost"
                    name="seedCost"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.seedCost}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Fertilizer Cost */}
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="fertilizerCost">
                    Fertilizer Cost (₹)
                  </label>
                  <input
                    type="number"
                    id="fertilizerCost"
                    name="fertilizerCost"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.fertilizerCost}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Pesticide Cost */}
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="pesticideCost">
                    Pesticide Cost (₹)
                  </label>
                  <input
                    type="number"
                    id="pesticideCost"
                    name="pesticideCost"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.pesticideCost}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Labor Cost */}
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="laborCost">
                    Labor Cost (₹)
                  </label>
                  <input
                    type="number"
                    id="laborCost"
                    name="laborCost"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.laborCost}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Other Costs */}
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="otherCosts">
                    Other Costs (₹)
                  </label>
                  <input
                    type="number"
                    id="otherCosts"
                    name="otherCosts"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.otherCosts}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <hr className="my-4" />
                </div>

                <h3 className="text-lg font-medium text-gray-700 col-span-2">Expected Revenue</h3>

                {/* Expected Yield */}
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2" htmlFor="expectedYield">
                      Expected Yield *
                    </label>
                    <input
                      type="number"
                      id="expectedYield"
                      name="expectedYield"
                      min="0.01"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.expectedYield}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="w-1/3">
                    <label className="block text-gray-700 mb-2" htmlFor="yieldUnit">
                      Unit
                    </label>
                    <select
                      id="yieldUnit"
                      name="yieldUnit"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.yieldUnit}
                      onChange={handleInputChange}
                    >
                      {yieldUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Expected Price */}
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="expectedPrice">
                    Expected Price per {formData.yieldUnit} (₹) *
                  </label>
                  <input
                    type="number"
                    id="expectedPrice"
                    name="expectedPrice"
                    min="0.01"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.expectedPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={loading}
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Calculate Profit
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Results Section */}
            {results && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Calculation Results</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Total Cost</div>
                    <div className="text-2xl font-bold text-gray-800">{formatCurrency(results.totalCost)}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Gross Income</div>
                    <div className="text-2xl font-bold text-gray-800">{formatCurrency(results.grossIncome)}</div>
                  </div>
                  
                  <div className={`p-4 rounded-md ${results.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="text-sm text-gray-600">Net Profit/Loss</div>
                    <div className={`text-2xl font-bold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(results.netProfit)}
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-md ${results.roi >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                    <div className="text-sm text-gray-600">ROI</div>
                    <div className={`text-2xl font-bold ${results.roi >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {results.roi.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This calculation is based on the provided inputs and should be used as an estimate only. 
                    Actual results may vary due to external factors such as weather conditions, market fluctuations, and other unforeseen circumstances.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Calculations */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Previous Calculations</h2>
            
            {fetchingHistory ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="border rounded-md p-4 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : savedCalculations.length === 0 ? (
              <div className="text-center py-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-gray-500">No previous calculations found</p>
                <p className="text-sm text-gray-400">Your calculations will appear here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {savedCalculations.map((calc) => (
                  <div 
                    key={calc._id} 
                    className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => loadCalculation(calc)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-800">{calc.cropType}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${calc.netProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {calc.netProfit >= 0 ? 'Profit' : 'Loss'}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <div>Area: {calc.area} {calc.areaUnit}</div>
                      <div>Yield: {calc.expectedYield} {calc.yieldUnit}</div>
                    </div>
                    
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">
                        {new Date(calc.createdAt).toLocaleDateString()}
                      </span>
                      <span className={calc.netProfit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {formatCurrency(calc.netProfit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Farming Tips</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600">Compare different crop varieties for better profit margins.</p>
              </div>
              
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600">Consider intercropping to maximize land usage and reduce risks.</p>
              </div>
              
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600">Track market trends before deciding which crops to plant.</p>
              </div>
              
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600">Invest in water-saving technologies to reduce costs in the long run.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
